/*
 * pwix:forums/src/client/js/startup.js
 */

import '../../common/js/index.js';

Meteor.startup( function(){
    // define the cient-side collections
    if( pwiForums.opts().verbosity() & FRS_VERBOSE_COLLECTIONS ){
        console.log( 'pwix:forums defining collections...' );
    }
    pwiForums.collections.every(( c ) => {
        const name = pwiForums.opts()['collections.prefix']() + pwiForums[c].radical;
        if( pwiForums.opts().verbosity() & FRS_VERBOSE_COLLECTIONS ){
            console.log( '   '+c+' -> '+name );
        }
        pwiForums.client.collections[c] = new Mongo.Collection( name );
        pwiForums.client.collections[c].attachSchema( pwiForums[c].schema );
        return true;
    });
});

Meteor.startup( function(){
    _ready.val = true,
    _ready.dep.changed();
    if( pwiForums.opts().verbosity() & FRS_VERBOSE_READY ){
        console.log( 'pwix:forums ready', pwiForums.ready());
    }
});
