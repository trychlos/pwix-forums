
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
        const res = Forums.server.collections.Posts.upsert( selector, { $set: modifier });
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

    // called when a moderator has confirmed the moderation
    //  moderate (aka delete the post)
    //  manage here threadleader and user information
    //  options is an object with:
    //  - inform: whether the moderator has asked the user to be informed
    //  - stats: the user count stats
    'frsPosts.moderate'( post, options ){
        const modifier = {
            deletedAt: post.deletedAt,
            deletedBy: post.deletedBy,
            deletedBecause: post.deletedBecause,
            deletedText: post.deletedText
        };
        let res = Forums.server.collections.Posts.update({ _id: post._id }, { $set: modifier });
        console.log( 'moderating post', post, res );
        // if the just-moderated post was a thread leader, then find another one if possible
        /*
        const fetched = Forums.server.collections.Posts.find({ threadId: post.threadId, deletedAt: null }, { sort: { createdAt: -1 }, limit: 1 }).fetch();
        if( fetched.length ){
            const newLeader = fetched[0];
            newLeader.title = post.title;
            res = Forums.server.collections.Posts.update({ _id: newLeader._id }, { $set: { title: newLeader.title }});
            console.log( 'promoting new thread leader', newLeader, res );
        }
        */
    },

    // called when a moderator cancels a moderation
    //  if the unmoderated post is older than the current thread leader, then promote it (and unpromote the current one..)
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
        let res = Forums.server.collections.Posts.update({ _id: post._id }, { $unset: unset });
        console.log( 'frsPosts.unmoderate', post, unset, res );
        // may be it a new thread leader (because it was before being moderated) ?
        //  search the current thread leader, and test against the creation date
        /*
        const fetched = Forums.server.collections.Posts.find({ threadLeader: true, threadId: post.threadId }, { sort: { createdAt: -1 }, limit: 1 }).fetch();
        if( fetched.length ){
            const currentLeader = fetched[0];
            if( post.createdAt.getTime() < currentLeader.createdAt.getTime()){
                // unpromote current leader
                currentLeader.threadLeader = false;
                res = Forums.server.collections.Posts.update({ _id: currentLeader._id }, { $set: { threadLeader: false }});
                console.log( 'unpromoting current thread leader', currentLeader, res );
                // promoting the new one
                post.threadLeader = true;
                post.title = post.title || currentLeader.title;
                res = Forums.server.collections.Posts.update({ _id: post._id }, { $set: { threadLeader: true, title: post.title }});
                console.log( 'promoting new thread leader', post, res );
            }
        }
        */
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
        const res = Forums.server.collections.Posts.update({ _id: id }, { $unset: unset });
        console.log( 'frsPosts.unvalidate', unset, res );
        return res;
    },

    // create a new post
    //  the passed-in object may or may not contains an _id
    'frsPosts.upsert'( o ){
        let modifier = {};
        const res = Forums.server.fn.Posts.upsert( o, modifier );
        if( !res ){
            throw new Meteor.Error(
                'frsPosts.upsert',
                'Unable to upsert "'+o.title+'" post' );
        } else {
            res.upserted = {
                _id: o._id || res.insertedId,
                ...modifier
            }
            /*
            if( o.threadLeader ){
                const updRes = Forums.server.collections.Posts.update({ _id: res.upserted._id }, { $set: { threadId: res.upserted._id }});
                console.log( 'update threadId for this new threadLeader', updRes, res.upserted._id );
            }
            */
        }
        console.log( 'frsPosts.upsert returns', res );
        return res;
    },

    // returns an object with postsCount and statsCount
    'frsPosts.userStats'( userId ){
        // the total count of posts (including deleted)
        const posts = Forums.server.collections.Posts.find({ owner: userId }).count();
        // the auto-deleted count
        const auto = Forums.server.collections.Posts.find({ owner: userId, deletedAt: { $ne: null }, deletedBy: userId }).count();
        // the moderated (i.e. deleted by someone else)
        const moderated = Forums.server.collections.Posts.find({ owner: userId, deletedAt: { $ne: null }, deletedBy: { $ne: userId }}).count();
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
        const res = Forums.server.collections.Posts.update({ _id: id }, { $set: set });
        console.log( 'frsPosts.validate', set, res );
        return res;
    }
});
