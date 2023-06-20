/*
 * pwix:forums/src/common/js/config.js
 */

import { ReactiveVar } from 'meteor/reactive-var';

import _ from 'lodash';

import { frsOptions } from '../classes/options.class.js';

const _false = function(){
    return false;
}

pwiForums = {
    _conf: {},
    _defaults: {
        collections: {
            prefix: 'frs_'
        },
        routes: {
            forums: '/forums',
            threads: '/forums/t/:forumId',
            posts: '/forums/p/:threadId',
            manager: '/forums/admin',
            moderate: '/forums/moderate',
            allposts: '/forums/allposts'
        },
        forums: {
            access: FRS_FORUM_PUBLIC,
            publicWriter: FRS_USER_EMAILVERIFIED,
            publicWriterAppFn: _false,
            moderation: FRS_MODERATE_APRIORI,
            inform: FRS_INFORM_MUST
        },
        verbosity: FRS_VERBOSE_CONFIGURE|FRS_VERBOSE_READY
    },
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
     *  Should be called *in same terms* both by the client and the server
     * @locus Anywhere
     * @param {Object} o the runtime configuration of the package
     * @returns {Object} the package configuration
     */
    configure: function( o ){
        _.merge.recursive( pwiForums._conf, pwiForums._defaults, o );
        pwiForums._opts = new frsOptions( pwiForums._conf );

        if( pwiForums.opts().verbosity() & FRS_VERBOSE_CONFIGURE ){
            console.log( 'pwix:forums configure() with', o );
        }

        return pwiForums._conf;
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

_.merge( pwiForums._conf, pwiForums._defaults );
pwiForums._opts = new frsOptions( pwiForums._conf );
