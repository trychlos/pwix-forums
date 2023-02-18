/*
 * pwix:forums/src/collections/posts/server/index.js 
 */

import './methods.js';
import './publish.js';

if( pwiForums.opts().verbosity() & FRS_VERBOSE_COLLECTIONS ){
    console.log( 'pwix:forums/src/collections/posts/server/index.js declaring Posts collection' );
}
