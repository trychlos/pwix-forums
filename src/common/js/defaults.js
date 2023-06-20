/*
 * pwix:forums/src/common/js/defaults.js
 */

import _ from 'lodash';

import { frsOptions } from '../classes/options.class.js';

const _false = function(){
    return false;
}

defaults = {
    common: {
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
    }
};

_.merge( pwiForums._conf, defaults.common );
pwiForums._opts = new frsOptions( pwiForums._conf );
