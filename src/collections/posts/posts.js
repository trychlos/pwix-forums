/*
 * /src/collections/posts/posts.js
 *
 * See server/sofns.js for server-only functions.
 * See server/methods.js for server functions remotely callable from the client
 *  (aka Meteor RPC).
 */
import SimpleSchema from 'simpl-schema';

Forums.Posts = {

    // name radical
    radical: 'posts',

    schema: new SimpleSchema({
        // the post title (a single line)
        //  cannot be empty for the initial post of the thread (the original thread leader)
        //  is set for each new thread leader which may occur depending of deletions/moderations/unmoderations
        //  never unset
        title: {
            type: String,
            optional: true
        },
        // the displayed content of the post (the main piece of the cake!)
        //  must be set
        content: {
            type: String
        },
        // the forum identifier
        //  must be set
        forum: {
            type: String
        },
        // the post id this one replies to
        //  empty for the initial post of a thread, always set for others posts in the thread
        //  for all others, will be most probably set to the current thread leader at the time the post is created
        replyTo: {
            type: String,
            optional: true
        },
        // the initial post id of this thread
        //  always set and never changes, even when the corresponding post is deleted/moderated or a new thread leader is designated
        //  as a consequence, is always the id of the original post
        //  as a consequence, is always an invariant identifier of the thread
        threadId: {
            type: String
        },
        // the user id of the creator
        //  this is the id of the record in the Meteor.users collection
        //  same than createdBy...
        owner: {
            type: String
        },
        // whether this post is pinned on top of the forum
        pinned: {
            type: Boolean,
            defaultValue: false,
        },
        // whether this post may be replied to
        //  this is a facility for the forum admin to forbid this feature for the posts he pins
        replyable: {
            type: Boolean,
            defaultValue: true,
        },
        // creation timestamp
        // mandatory
        createdAt: {
            type: Date,
            defaultValue: new Date()
        },
        // last update timestamp (by the owner only)
        updatedAt: {
            type: Date,
            optional: true
        },
        // delete timestamp (by the owner as a self-deletion, or a forum admin as a moderation)
        //  when deleted/moderated, a post is still in the collection, but no more visible
        deletedAt: {
            type: Date,
            optional: true
        },
        // either the user himself or a moderator
        deletedBy: {
            type: String,
            optional: true
        },
        // why a forum admin has he moderated this post ?
        //  null/unset when deleted by the owner
        //  aka: set if and only if moderated: a reason is mandatory when moderating
        deletedBecause: {
            type: String,
            optional: true
        },
        // an additional text which may be provided by the moderator who wants argument his decision
        deletedText: {
            type: String,
            optional: true
        },
        // validation timestamp by a moderator, only relevant in forums moderated a priori
        validatedAt: {
            type: Date,
            optional: true
        },
        // the moderator who has validated the post
        validatedBy: {
            type: String,
            optional: true
        },
        // Mongo identifier
        // mandatory (auto by Meteor+Mongo)
        _id: {
            type: String,
            optional: true
        },
        xxxxxx: {   // unused key to be sure we always have something to unset
            type: String,
            optional: true
        }
    }),

    // Deny all client-side updates
    // cf. https://guide.meteor.com/security.html#allow-deny
    deny(){
        Forums.server.collections.Posts.deny({
            insert(){ return true; },
            update(){ return true; },
            remove(){ return true; },
        });
    },

    // returns an object { selector, options } suitable to list the posts to be moderated
    // opts is
    //  - forums: an array of all forums moderable by the user
    //  - since: the date to not go before (as a Date object)
    //  - showValidated: whether to also return the already validated posts
    //  - showModerated: whether to also return the already moderated posts
    queryModerables( opts ){
        //console.log( opts.since );
        let result = {
            selector: { $and: [{ createdAt: { $gte: opts.since }}] },
            options: {
                // first most recent threads (old threads can wait...)
                //  in each thread, in the ascending order of the creations
                sort: { forum: 1, threadId: 1, createdAt: 1 }
            }
        };
        // do not select posts deleted by the user himself
        // selfDeleted = deletedAt ne null and deletedBecause null
        result.selector.$and.push({ $or: [{ deletedAt: null }, { deletedBecause: { $ne: null }}] });
        let aprioriIds = [];
        let aposterIds = [];
        opts.forums.every(( f ) => {
            if( f.moderation == Forums.C.Moderation.APRIORI ){
                aprioriIds.push( f._id );
            } else {
                aposterIds.push( f._id );
            }
            return true;
        });
        // if we want moderated posts, this is just a 'or' clause more on all forums
        //  if we don't, then add a 'and' clause do not select them
        let or = { $or: []};
        if( opts.showModerated ){
            or.$or.push({ $and: [{ deletedAt: { $ne: null }}, { deletedBecause: { $ne: null }}] });
        } else {
            result.selector.$and.push({ $and: [{ $or: [{ deletedAt: null }, { deletedBecause: null }] }] });
        }
        // in a priori forums, wants non-validated posts (unless showValidated) and non-moderated (unless showModerated)
        //  remind that a post cannot be both validated and moderated...
        if( opts.showValidated ){
            or.$or.push({ $and: [{ forum: { $in: aprioriIds }}] });
        } else {
            or.$or.push({ $and: [{ forum: { $in: aprioriIds }}, { validatedAt: null }] });
        }
        // in a posteriori, wants non-moderated posts unless showModerated
        if( opts.showModerated ){
            or.$or.push({ forum: { $in: aposterIds }});
        } else {
            or.$or.push({ $and: [{ forum: { $in: aposterIds }}, { deletedAt: null }] });
        }
        result.selector.$and.push( or );
        result.parms = { ...opts };
        return result;
    },

    // returns an object { selector, options } suitable to list the readble posts inside of a forum
    //  - forum: the forum document
    //  - userId: the currently logged-in user identifier, may be null
    //  - opts may contain:
    //      > threadId: the thread identifier if we only want the posts for this thread
    //      > withModerated: true|false, only relevant if the user is a moderator of this forum
    //      > withDeleted: true|false, only relevant if the user is a forum admin or the owner of the post
    queryReadables( forum, userId, opts={} ){
        // honor 'showDeletedForAdmin' and 'showDeletedForUser' forum properties
        let deletedClause = [{ deletedAt: null }];
        if( Object.keys( opts ).includes( 'withModerated' ) && opts.withModerated ){
            deletedClause.push({ deletedBecause: { $ne: null }});
        }
        if( Object.keys( opts ).includes( 'withDeleted' ) && opts.withDeleted && userId ){
            deletedClause.push({ $and: [
                { deletedBecause: null },
                { deletedBy: userId },
                { owner: userId }
            ]});
        }
        // display only validated posts in a forum moderated a priori, or posts of the user waiting for validation
        let validatedClause = null;
        if( forum.moderation === Forums.C.Moderation.APRIORI ){
            validatedClause = [{ validatedAt: { $ne: null }}];
            if( userId ){
                validatedClause.push({ owner: userId });
            }
        }
        let result = {
            selector: {
                $and: [
                    { forum: forum._id },
                    { $or: deletedClause }
                ],
            },
            options: {
                sort: { createdAt: 1 }
            }
        };
        if( opts.threadId ){
            result.selector.$and.push({ threadId: opts.threadId });
        }
        if( validatedClause ){
            result.selector.$and.push({ $or: validatedClause });
        }
        //console.log( result.selector.$and );
        return result;
    },

    // returns an object { selector, options } suitable to list the threads opened on a forum
    queryThreads( forumId ){
        let result = {
            selector: {
                forum: forumId,
                threadLeader: true,
                deletedAt: null
            },
            options: {
                sort: { createdAt: -1 }
            }
        };
        return result;
    }
};
