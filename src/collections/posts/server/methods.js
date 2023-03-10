
Meteor.methods({
    // delete a post
    //  actually just set the corresponding attributes
    //  deletedBecause is left null (no reason) when the owner deletes his own post
    'frsPosts.delete'( post ){
        const selector = { _id: post._id };
        const modifier = { ...post, ...{
            deletedAt: new Date(),
            deletedBy: this.userId
        }};
        const res = pwiForums.server.collections.Posts.upsert( selector, { $set: modifier });
        if( !res ){
            throw new Meteor.Error(
                'frsPosts.delete',
                'Unable to upsert "'+postId+'" post' );
        } else {
            res.upserted = {
                ...modifier
            }
        }
        console.log( 'frsPosts.delete returns', res );
        return res;
    },

    // called after a moderator has confirmed the deletion
    //  parms are an object with:
    //  - post: the just-moderated post
    //  - inform: whether the moderator has asked the user to be informed
    //  - stats: the user count stats
    //  - reason: the reason
    // Note: we first call the upsert() method before callig this one just to not have to call upsert() from here
    'frsPosts.postModerate'( parms ){
        console.log( 'postModerate', parms );
    },

    // create a new post
    //  the passed-in object may or may not contains an _id
    'frsPosts.upsert'( o ){
        //console.log( 'frsPosts.upsert: o', o );
        const selector = { _id: o._id };
        let modifier = {
            content: o.content.trim(),
            forum: o.forum,
            owner: o.owner
        };
        function f_add( field ){
            if( o[field] ){
                modifier[field] = o[field];
            }
        }
        if( o.title ){
            modifier.title = o.title.trim();
        }
        f_add( 'replyTo' );
        f_add( 'threadId' );
        f_add( 'pinned' );
        f_add( 'replyable' );
        f_add( 'deletedAt' );
        f_add( 'deletedBy' );
        f_add( 'deletedBecause' );
        if( o && o._id ){
            modifier.updatedAt = new Date();
            modifier.updatedBy = Meteor.userId();
        } else {
            modifier.createdAt = new Date();
            modifier.createdBy = Meteor.userId();
        }
        // https://docs.meteor.com/api/collections.html
        // the returned 'res' is an object with keys 'numberAffected' (the number of documents modified) and 'insertedId' (the unique _id of the document that was inserted, if any).
        //console.log( 'frsCategories.upsert: selector', selector );
        //console.log( 'frsCategories.upsert: modifier', modifier );
        const res = pwiForums.server.collections.Posts.upsert( selector, { $set: modifier });
        if( !res ){
            throw new Meteor.Error(
                'frsPosts.upsert',
                'Unable to upsert "'+o.title+'" post' );
        } else {
            res.upserted = {
                _id: o._id || res.insertedId,
                ...modifier
            }
        }
        console.log( 'frsPosts.upsert returns', res );
        return res;
    },

    // returns an object with postsCount and statsCount
    'frsPosts.userStats'( userId ){
        // the total count of posts (including deleted)
        const posts = pwiForums.server.collections.Posts.find({ owner: userId }).count();
        // the auto-deleted count
        const auto = pwiForums.server.collections.Posts.find({ owner: userId, deletedAt: { $ne: null }, deletedBy: userId }).count();
        // the moderated (i.e. deleted by someone else)
        const moderated = pwiForums.server.collections.Posts.find({ owner: userId, deletedAt: { $ne: null }, deletedBy: { $ne: userId }}).count();
        const res = { posts: posts, auto: auto, moderated: moderated };
        //console.log( 'userStats', res );
        return res;
    }
});
