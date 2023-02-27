/*
 * /src/collections/posts/posts.js
 *
 * See server/sofns.js for server-only functions.
 * See server/methods.js for server functions remotely callable from the client
 *  (aka Meteor RPC).
 */
import SimpleSchema from 'simpl-schema';

pwiForums.Posts = {

    // name radical
    radical: 'posts',

    // Posts schema
    schema: new SimpleSchema({
        // the post title (a single line)
        //  cannot be empty for the initial post of the thread
        //  always empty for all replies in this thread
        title: {
            type: String,
            optional: true
        },
        content: {
            type: String,
            optional: true
        },
        // the forum identifier
        //  cannot be empty
        forum: {
            type: String
        },
        // the post id this one replies to
        //  empty for the initial post of a thread
        replyTo: {
            type: String,
            optional: true
        },
        // the initial post id of this thread
        //  empty for this same initial post
        threadId: {
            type: String,
            optional: true
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
        // delete timestamp (by the owner or a forum admin)
        //  when deleted, a post is still in the collection, but no more visible
        deletedAt: {
            type: Date,
            optional: true
        },
        // either the user himself or a moderator
        deletedBy: {
            type: String,
            optional: true
        },
        // why a forum admin has he deleted this post ?
        //  null/unset when deleted by the owner
        //  aka: set if and only if moderated
        deletedBecause: {
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
        pwiForums.server.collections.Posts.deny({
            insert(){ return true; },
            update(){ return true; },
            remove(){ return true; },
        });
    },

    // returns an object { selector, options } suitable to list the posts inside a thread
    //  opts may contain:
    //  - withModerated: true|false
    //  - withDeleted: true|false
    //  - userId: mandatory if withDeleted is true
    //  - limit
    queryPosts( threadId, opts ){
        // honor 'showDeletedForAdmin' and 'showDeletedForUser' forum properties
        let deletedClause = [{ deletedAt: null }];
        if( Object.keys( opts ).includes( 'withModerated' ) && opts.withModerated ){
            deletedClause.push({ deletedBecause: { $ne: null }});
        }
        if( Object.keys( opts ).includes( 'withDeleted' ) && opts.withDeleted && opts.userId ){
            deletedClause.push({ $and: [
                { deletedBecause: null },
                { deletedBy: opts.userId },
                { owner: opts.userId }
            ]});
        }
        let result = {
            selector: {
                $and: [
                    { $or: [
                        { _id: threadId },
                        { threadId: threadId }
                    ]},
                    { $or: deletedClause }
                ],
            },
            options: {
                sort: { createdAt: 1 }
            }
        };
        if( opts.limit ){
            result.options.limit = opts.limit;
        }
        return result;
    },

    // returns an object { selector, options } suitable to list the posts to be moderated
    // opts is
    //  - forums: an array of all forums moderable by the user
    //  - since: the date to not go before (as a Date object)
    //  - showValidated: whether to also return the already validated posts
    //  - showModerated: whether to also return the already moderated posts
    queryModerables( opts ){
        console.log( opts.since );
        let result = {
            selector: { $and: [{ createdAt: { $gte: opts.since }}] },
            options: {
                // first most recent threads (old threads can wait...)
                //  in each thread, in the ascending order of the creations
                sort: { forum: 1, threadIdentifier: 1, createdAt: 1 }
            }
        };
        // do not select posts deleted by the user himself
        // selfDeleted = deletedAt ne null and deletedBecause null
        result.selector.$and.push({ $or: [{ deletedAt: null }, { deletedBecause: { $ne: null }}] });
        let aprioriIds = [];
        let aposterIds = [];
        opts.forums.every(( f ) => {
            if( f.moderation == FRS_MODERATE_APRIORI ){
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

    // returns an object { selector, options } suitable to list the threads opened on a forum
    queryThreads( forumId, limit ){
        let result = {
            selector: {
                forum: forumId,
                threadId: null,
                deletedAt: null
            },
            options: {
                sort: { createdAt: -1 }
            }
        };
        if( limit ){
            result.options.limit = limit;
        }
        return result;
    }
};
