
Meteor.publish( 'frsPosts.byId', function( id ){
    return pwiForums.server.collections.Posts.find({ _id: id });
});

Meteor.publish( 'frsPosts.byQuery', function( query ){
    return pwiForums.server.collections.Posts.find( query.selector, query.options );
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
