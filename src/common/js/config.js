/*
 * pwix:forums/src/common/js/config.js
 */

import { Tracker } from 'meteor/tracker';

console.log( 'pwix:forums/src/common/js/config.js declaring global exported pwiForums object' );

_ready = {
    dep: new Tracker.Dependency(),
    val: false
};

pwiForums = {

    // client-specific data and functions
    client: {
        collections: {},
    },

    // the collections used by the package
    collections: [
        'Categories',
        'Forums',
        'Orders',
        'Posts'
    ],

    conf: {
        // the prefix of the collection's names (do not use dash here)
        prefix: 'frs_',
        // all the configured routes will have this radical
        route: '/forums',
        posts: {
            limit: 100
        },
        // whether we want only verified emails to participate to forums
        wantVerifiedEmail: true
    },

    // should be *in same terms* called both by the client and the server
    configure: function( o ){
        console.log( 'pwix:forums configure() with', o );
        pwiForums.conf = { ...pwiForums.conf, ...o };
        //console.log( 'pwix:forums/src/common/index.js:config() pwiForums=', pwiForums );
    },

    /**
     * A reactive data source, only relevant on the client.
     * Returned value is updated at package client startup.
     * @returns {Boolean} true when the package is ready
     */
    ready: function(){
        _ready.dep.depend();
        return _ready.val;
    },

    // server-specific data and functions
    server: {
        collections: {}
    }
};
