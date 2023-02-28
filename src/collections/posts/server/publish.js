
Meteor.publish( 'frsPosts.listOne', function( threadId ){
    return pwiForums.server.collections.Posts.find({ _id: threadId, deletedAt: null });
});

// list the posts inside a threads
//  add to each post a repliesCount
// + if the current user is a moderator of this forum, then honor the 'showDeletedForAdmin'
Meteor.publish( 'frsPosts.listForThread', function( threadId, limit ){
    const self = this;
    const collectionName = pwiForums.opts()['collections.prefix']() + pwiForums.Posts.radical;
    const userId = this.userId;
    const thread = userId ? pwiForums.server.collections.Posts.findOne({ _id: threadId }) : null;
    const forum = thread ? pwiForums.server.collections.Forums.findOne({ _id: thread.forum }) : null;
    const isModerator = forum ? pwiForums.Forums.canModerate( forum, userId ) : false;
    const withModerated = isModerator ? forum.showDeletedForAdmin : false;
    const withDeleted = forum ? forum.showDeletedForUser : false;
    const query = pwiForums.Posts.queryPosts( threadId, {
        withModerated: withModerated,
        withDeleted: withDeleted,
        userId: userId,
        limit: limit
    });

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

// returns the list of threads in the specified forum
//  returns a list of posts whose replyTo is empty (start of thread)
//  with added:
//  - the total count of posts which are in this thread
//  - the date of the most recent post in this thread
//  ordered by decreasing creation date (most recent first)

Meteor.publish( 'frsPosts.threads', function( forumId, limit ){
    const self = this;
    const collectionName = pwiForums.opts()['collections.prefix']() + pwiForums.Posts.radical;
    const query = pwiForums.Posts.queryThreads( forumId, limit );

    // add lastPosted and posts count for this tread
    //  add 1 as the post which opens the thread doesn't have the threadId set
    function f_addFields( doc ){
        doc.postsCount = 1+pwiForums.server.collections.Posts.find({ threadId: doc._id, deletedAt: null }).count();
        if( doc.postsCount > 0 ){
            doc.lastPost = pwiForums.server.collections.Posts.find({ threadId: doc._id }, { sort: { createdAt: -1 }, limit: 1 }).fetch()[0];
        } else {
            doc.lastPost = null;
        }
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

Meteor.publish( 'frsPosts.moderablesByOpts', function( opts ){
    const query = pwiForums.Posts.queryModerables( opts );
    return pwiForums.server.fn.Posts.findModerablesByQuery( this, query );
});

Meteor.publish( 'frsPosts.moderablesByQuery', function( query ){
    return pwiForums.server.fn.Posts.findModerablesByQuery( this, query );
});
