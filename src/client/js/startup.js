/*
 * pwix:forums/src/client/js/startup.js
 */

import '../../common/js/index.js';

Meteor.startup( function(){
    // define the cient-side collections
    if( Forums.opts().verbosity() & Forums.C.Verbose.COLLECTIONS ){
        console.log( 'pwix:forums defining collections...' );
    }
    Forums.collections.every(( c ) => {
        const name = Forums.opts()['collections.prefix']() + Forums[c].radical;
        if( Forums.opts().verbosity() & Forums.C.Verbose.COLLECTIONS ){
            console.log( '   '+c+' -> '+name );
        }
        Forums.client.collections[c] = new Mongo.Collection( name );
        Forums.client.collections[c].attachSchema( Forums[c].schema );
        return true;
    });
});
