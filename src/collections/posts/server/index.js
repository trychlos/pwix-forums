/*
 * pwix:forums/src/collections/posts/server/index.js 
 */

import './functions.js';
import './methods.js';
import './publish.js';

if( Forums.opts().verbosity() & FRS_VERBOSE_COLLECTIONS ){
    console.log( 'pwix:forums/src/collections/posts/server/index.js declaring Posts collection' );
}
