/*
 * /src/collections/categories/categories.js
 *
 * See server/sofns.js for server-only functions.
 * See server/methods.js for server functions remotely callable from the client
 *  (aka Meteor RPC).
 * 
 * Categories are used to categorize the forums.
 * 
 * It is expected that the total categories count should be about 10 to 15....
 */
import SimpleSchema from 'simpl-schema';

Forums.Categories = {

    // name radical
    radical: 'categories',

    // default identifier: uncategorized
    default: 'none',

    // Categories schema
    schema: new SimpleSchema({
        // the category title (a single line)
        title: {
            type: String
        },
        // a description
        description: {
            type: String,
            optional: true
        },
        // color as an hex color '#abcdef'
        color: {
            type: String,
            optional: true
        },
        // creation timestamp
        // mandatory
        createdAt: {
            type: Date,
            defaultValue: new Date()
        },
        // creation userid
        // mandatory
        createdBy: {
            type: String
        },
        // last update timestamp
        updatedAt: {
            type: Date,
            optional: true
        },
        // last update userid
        updatedBy: {
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
        Forums.server.collections.Categories.deny({
            insert(){ return true; },
            update(){ return true; },
            remove(){ return true; },
        });
    }
};
