
Meteor.methods({
    // self-delete a post
    //  actually just set the corresponding attributes
    //  deletedBecause is left null (no reason) when the owner deletes his own post
    //  throw an exception if the post is not owned by the current user
    'frsPosts.delete'( post ){
        if( post.owner !== this.userId ){
            throw new Meteor.Error( 'now-owner', 'Currently logged-in user is not the owner of to-be-deleted post' );
        }
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

    // called after a moderator has confirmed the moderation and the post has been moderated (aka deleted)
    //  manage here threadleader and user information
    //  parms is an object with:
    //  - post: the just-moderated post (inclusing reason and additional argument)
    //  - inform: whether the moderator has asked the user to be informed
    //  - stats: the user count stats
    // this is always called, even if the moderator chooses to not inform the user
    'frsPosts.postModerate'( parms ){
        console.log( 'postModerate', parms );
        // if the just-moderated post was a thread leader, then find another one if possible
        if( parms.post.threadLeader ){
            const fetched = pwiForums.server.collections.Posts.find({ threadId: parms.post._id, deletedAt: null }, { sort: { createdAt: -1 }, limit: 1 }).fetch();
            if( fetched.length ){
                const newLeader = fetched[0]
                newLeader.threadLeader = true;
                newLeader.title = parms.post.title;
                const res = pwiForums.server.collections.Posts.update({ _id: newLeader._id }, { $set: { threadLeader: true, title: newLeader.title }});
                console.log( 'promoting new thread leader', newLeader, res );
            }
            parms.post.threadLeader = false;
            const res = pwiForums.server.collections.Posts.update({ _id: parms.post._id }, { $set: { threadLeader: false }});
            console.log( 'unpromoting previoous thread leader', parms.post, res );
        }
    },

    // called when a moderator cancels a moderation
    //  if the unmoderated post is older than the current threadLeader, then promote it (and unpromote the current one..)
    'frsPosts.unmoderate'( post ){
        const unset = {
            deletedAt: 1,
            deletedBy: 1,
            deletedBecause: 1,
            deletedText: 1
        };
        delete post.deletedAt;
        delete post.deletedBy;
        delete post.deletedBecause;
        delete post.deletedText;
        const res = pwiForums.server.collections.Posts.update({ _id: post._id }, { $unset: unset });
        console.log( 'frsPosts.unmoderate', post, unset, res );
        // may be it a new thread leader (because it was before being moderated) ?
        //  search the current thread leader, and test against the creation date
        const fetched = pwiForums.server.collections.Posts.find({ threadLeader: true, threadId: post.threadId }, { sort: { createdAt: -1 }, limit: 1 }).fetch();
        if( fetched.length ){
            const currentLeader = fetched[0];
            if( post.createdAt.getTime() < currentLeader.createdAt.getTime()){
                // unpromote current leader
                currentLeader.threadLeader = false;
                let res = pwiForums.server.collections.Posts.update({ _id: currentLeader._id }, { $set: { threadLeader: false }});
                console.log( 'unpromoting current thread leader', currentLeader, res );
                // promoting the new one
                post.threadLeader = true;
                post.title = post.title || currentLeader.title;
                res = pwiForums.server.collections.Posts.update({ _id: post._id }, { $set: { threadLeader: true, title: post.title }});
                console.log( 'promoting new thread leader', post, res );
            }
        }
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
        let modifier = {};
        const res = pwiForums.server.fn.Posts.upsert( o, modifier );
        if( !res ){
            throw new Meteor.Error(
                'frsPosts.upsert',
                'Unable to upsert "'+o.title+'" post' );
        } else {
            res.upserted = {
                _id: o._id || res.insertedId,
                ...modifier
            }
            if( o.threadLeader ){
                const updRes = pwiForums.server.collections.Posts.update({ _id: res.upserted._id }, { $set: { threadId: res.upserted._id }});
                console.log( 'update threadId for this new threadLeader', updRes, res.upserted._id );
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
