/*
 * pwix:forums/src/common/js/config.js
 */

import _ from 'lodash';

import { frsOptions } from '../classes/frs_options.class.js';

Forums._conf = {};

Forums._false = function(){
    return false;
}

Forums._defaults = {
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
        access: Forums.C.Access.PUBLIC,
        publicWriter: Forums.C.Participation.EMAILVERIFIED,
        publicWriterAppFn: Forums._false,
        moderation: Forums.C.Moderation.APRIORI,
        inform: Forums.C.Information.MUST
    },
    verbosity: Forums.C.Verbose.NONE
};

/**
 * @summary Package configuration
 *  Should be called *in same terms* both by the client and the server
 * @locus Anywhere
 * @param {Object} o the runtime configuration of the package
 * @returns {Object} the package configuration
 */
Forums.configure = function( o ){
    _.merge( Forums._conf, Forums._defaults, o );
    Forums._opts = new frsOptions( Forums._conf );

    if( Forums.opts().verbosity() & Forums.C.Verbose.CONFIGURE ){
        console.log( 'pwix:forums configure() with', o );
    }

    return Forums._conf;
}


/**
 * @summarry Runtime configuration getter
 * @locus Anywhere
 * @returns {acOptionsConf} the runtime configuration object
 */
Forums.opts = function(){
    return Forums._opts;
}

_.merge( Forums._conf, Forums._defaults );
Forums._opts = new frsOptions( Forums._conf );
