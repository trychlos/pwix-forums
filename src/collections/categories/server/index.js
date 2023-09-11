/*
 * pwix:forums/src/collections/categories/server/index.js 
 */

import './methods.js';
import './publish.js';

if( Forums.opts().verbosity() & Forums.C.Verbose.COLLECTIONS ){
    console.log( 'pwix:forums/src/collections/categories/server/index.js declaring Categories collection' );
}
