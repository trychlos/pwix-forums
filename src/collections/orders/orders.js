/*
 * /src/collections/orders/orders.js
 *
 * See server/sofns.js for server-only functions.
 * See server/methods.js for server functions remotely callable from the client
 *  (aka Meteor RPC).
 * 
 * Orders is used to record the order of the categories, and of the forums in a category.
 */
import SimpleSchema from 'simpl-schema';

Forums.Orders = {

    // name radical
    radical: 'orders',

    // Orders schema
    schema: new SimpleSchema({
        // the type we are recording here
        //  either a 'CAT': a single record which registers the orders of the categories
        //  or a 'FOR': a record per category which registers the orders of the forums in this category
        //  or a 'ROOT' virtual root document (just to be able to publish some composite datas)
        // mandatory
        type: {
            type: String
        },
        // category identifier if type is 'FOR'
        category: {
            type: String,
            optional: true
        },
        // list of id's
        //  ordered list of categories if type='CAT'
        //  ordered list of forums if type='FOR'
        order: {
            type: Array,
            defaultValue: []
        },
        "order.$": Object,
        "order.$.id": String,
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
        Forums.server.collections.Orders.deny({
            insert(){ return true; },
            update(){ return true; },
            remove(){ return true; },
        });
    }
};
