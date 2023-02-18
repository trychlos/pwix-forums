/*
 * pwix:forums/src/collections/orders/server/index.js 
 */

import './methods.js';
import './publish.js';

if( pwiForums.opts().verbosity() & FRS_VERBOSE_COLLECTIONS ){
    console.log( 'pwix:forums/src/collections/orders/server/index.js declaring Orders collection' );
}
