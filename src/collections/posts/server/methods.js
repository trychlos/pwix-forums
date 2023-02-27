
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

    // called after a moderator has confirmed the moderation
    //  parms are an object with:
    //  - post: the just-moderated post
    //  - inform: whether the moderator has asked the user to be informed
    //  - stats: the user count stats
    //  - reason: the reason
    // this is always called, even if the moderator chooses to not inform the user
    'frsPosts.postModerate'( parms ){
        console.log( 'postModerate', parms );
    },

    // called when a moderator cancels a moderation
    'frsPosts.unmoderate'( id ){
        const unset = {
            deletedAt: 1,
            deletedBy: 1,
            deletedBecause: 1
        };
        const res = pwiForums.server.collections.Posts.update({ _id: id }, { $unset: unset });
        console.log( 'frsPosts.unmoderate', unset, res );
        return res;
    },

    // called when a moderator cancels a validation
    //  unfortunately, as of 2023- 2-27 and Meteor 2.10, seems that $unset doesn't trigger a subscription refresh (see todo #54)
    //  the publication observer sees the right change. So, as far as I know, this is the most I can do/check server side
    'frsPosts.unvalidate'( id ){
        const unset = {
            validatedAt: 1,
            validatedBy: 1
        };
        const res = pwiForums.server.collections.Posts.update({ _id: id }, { $unset: unset });
        console.log( 'frsPosts.unvalidate', unset, res );
        return res;
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
        f_add( 'validatedAt' );
        f_add( 'validatedBy' );
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
        console.log( 'userStats', res );
        return res;
    },

    // called when a moderator confirm the validation
    'frsPosts.validate'( id ){
        const set = {
            validatedAt: new Date(),
            validatedBy: Meteor.userId()
        };
        const res = pwiForums.server.collections.Posts.update({ _id: id }, { $set: set });
        console.log( 'frsPosts.validate', set, res );
        return res;
    }
});
