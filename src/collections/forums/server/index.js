/*
 * pwix:forums/src/collections/forums/server/index.js 
 */

import './functions.js';
import './methods.js';
import './publish.js';

if( pwiForums.opts().verbosity() & FRS_VERBOSE_COLLECTIONS ){
    console.log( 'pwix:forums/src/collections/forums/server/index.js declaring Forums collection' );
}
