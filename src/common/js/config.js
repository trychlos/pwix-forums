/*
 * pwix:forums/src/common/js/config.js
 */

import { ReactiveVar } from 'meteor/reactive-var';

import _ from 'lodash';

import { frsOptions } from '../classes/options.class.js';

//console.log( 'pwix:forums/src/common/js/config.js defining globally exported pwiForums object' );

pwiForums = {
    _conf: {},
    _opts: null,

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

    /** THIS IS TO BE OBSOLETED */
    conf: {
        posts: {
            limit: 100
        },
        // whether we want only verified emails to participate to forums
        wantVerifiedEmail: true
    },
    /** UNTIL HERE */

    /**
     * @summary Package configuration
     * @locus Anywhere
     * @param {Object} o the runtime configuration of the package
     *  Should be called *in same terms* both by the client and the server.
     */
    configure: function( o ){
        _.merge.recursive( pwiForums._conf, o );
        pwiForums._opts = new frsOptions( pwiForums._conf );

        if( pwiForums.opts().verbosity() & FRS_VERBOSE_CONFIGURE ){
            console.log( 'pwix:forums configure() with', o );
        }
    },

    // internationalization
    i18n: {},

    /**
     * @summarry Runtime configuration getter
     * @locus Anywhere
     * @returns {acOptionsConf} the runtime configuration object
     */
    opts(){
        return pwiForums._opts;
    },

    /**
     * @summary Returned value is updated at package client startup.
     * @locus Client
     * @returns {Boolean} true when the package is ready
     * A reactive data source.
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
