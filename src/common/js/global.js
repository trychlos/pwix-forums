/*
 * pwix:forums/src/common/js/global.js
 */

import { ReactiveVar } from 'meteor/reactive-var';

Forums = {
    // client-specific data and functions
    client: {
        collections: {},
        userSettings: new ReactiveVar( null )
    },

    // the collections used by the package
    collections: [
        'Categories',
        'Forums',
        'Orders',
        'Posts'
    ],

    // internationalization
    i18n: {},

    // server-specific data and functions
    server: {
        collections: {}
    }
};
