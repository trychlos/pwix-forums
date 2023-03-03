
Meteor.publish( 'frsPosts.byId', function( id ){
    return pwiForums.server.collections.Posts.find({ _id: id });
});

// returns the list of thread leaders in the specified forum, ordered by decreasing creation date (most recent first)
//  a thread is characterized by its thread leader, which should be active (not deleted nor moderated)
//  with added:
//  - the total count of non-deleted, non-moderated posts which are in the thread
//  - the most recent post in the thread
//
Meteor.publish( 'frsPosts.threadLeaders', function( query ){
    const self = this;
    const collectionName = pwiForums.opts()['collections.prefix']() + pwiForums.Posts.radical;

    // add lastPosted and posts count for this tread
    function f_addFields( doc ){
        doc.pub = {};
        let promises = [];
        promises.push( pwiForums.server.collections.Posts.countDocuments({ threadId: doc.threadId, deletedAt: null })
            .then(( count ) => {
                doc.pub.postsCount = count;
                doc.pub.lastPost = count ? pwiForums.server.collections.Posts.find({ threadId: doc.threadId, deletedAt: null }, { sort: { createdAt: -1 }, limit: 1 }).fetch()[0] : null;
            }));
        return Promise.all( promises );
    }

    const observer = pwiForums.server.collections.Posts.find( query.selector, query.options ).observe({
        added: function( doc){
            f_addFields( doc ).then(() => { self.added( collectionName, doc._id, doc )});
        },
        changed: function( newDoc, oldDoc ){
            f_addFields( newDoc ).then(() => { self.changed( collectionName, newDoc._id, newDoc )});
        },
        removed: function( oldDoc ){
            self.removed( collectionName, oldDoc._id );
        }
    });

    self.onStop( function(){
        observer.stop();
    });

    self.ready();
});

// list the posts inside a thread
//  add to each post a repliesCount
// + if the current user is a moderator of this forum, then honor the 'showDeletedForAdmin'
Meteor.publish( 'frsPosts.threadPosts', function( query ){
    const self = this;
    const collectionName = pwiForums.opts()['collections.prefix']() + pwiForums.Posts.radical;

    //  add to the Post the count of (not deleted) replies
    function f_addFields( doc ){
        doc.repliesCount = pwiForums.server.collections.Posts.find({ replyTo: doc._id, deletedAt: null }).count();
        return doc;
    }

    const observer = pwiForums.server.collections.Posts.find( query.selector, query.options ).observe({
        added: function( doc){
            self.added( collectionName, doc._id, f_addFields( doc ));
        },
        changed: function( newDoc, oldDoc ){
            self.changed( collectionName, newDoc._id, f_addFields( newDoc ));
        },
        removed: function( oldDoc ){
            self.removed( collectionName, oldDoc._id );
        }
    });

    self.onStop( function(){
        observer.stop();
    });

    self.ready();
});

// return the count of threads available to the current user in this forum
//
Meteor.publish( 'frsPosts.threadsCount', function( forum, userId, opts={} ){
    const self = this;
    const collectionName = pwiForums.opts()['collections.prefix']() + pwiForums.Posts.radical;
    const query = pwiForums.Posts.queryReadables( forum, userId, opts );
    const rawCollection = pwiForums.server.collections.Posts.rawCollection();

    //  add to the provided forum the threadsCount as a result of the Promise
    function f_addFields(){
        return rawCollection.distinct( 'threadId', query.selector );
    }

    const observer = pwiForums.server.collections.Posts.find( query.selector, query.options ).observe({
        added: function( doc){
            f_addFields().then(( res ) => {
                forum.pub = forum.pub || {};
                console.log( 'setting threadsCount to', res.length );
                forum.pub.threadsCount = res.length;
                self.added( collectionName, doc._id, doc );
            });
        },
        changed: function( newDoc, oldDoc ){
            f_addFields().then(() => {
                forum.pub = forum.pub || {};
                console.log( 'setting threadsCount to', res.length );
                forum.pub.threadsCount = res.length;
                self.changed( collectionName, newDoc._id, newDoc );
            });
        },
        removed: function( oldDoc ){
            f_addFields().then(() => {
                self.removed( collectionName, oldDoc._id );
            });
        }
    });
    self.onStop( function(){
        observer.stop();
    });
    self.ready();
});

// returns the list of to-be-moderated posts depending of user display options
// opts is
//  - forums: an array of all forums moderable by the user
//  - since: the date to not go before (as a Date object)
//  - showValidated: whether to also return the already validated posts
//  - showModerated: whether to also return the already moderated posts
//
// returned cursor is ordered by forumId, threadId, increasing creation date (most old first)
//  may be not the actual display order, but enough to compute display breaks

Meteor.publish( 'frsPosts.moderablesByQuery', function( query ){
    return ( pwiForums.server.fn.Posts.moderablesByQuery.bind( this ))( query );
});
