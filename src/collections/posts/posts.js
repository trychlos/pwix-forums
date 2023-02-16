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
        deletedBecause: {
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
