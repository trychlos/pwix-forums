/*
 * pwix:forums/src/client/js/startup.js
 */

import '../../common/js/index.js';

Meteor.startup( function(){
    // define the cient-side collections
    if( Forums.opts().verbosity() & FRS_VERBOSE_COLLECTIONS ){
        console.log( 'pwix:forums defining collections...' );
    }
    Forums.collections.every(( c ) => {
        const name = Forums.opts()['collections.prefix']() + Forums[c].radical;
        if( Forums.opts().verbosity() & FRS_VERBOSE_COLLECTIONS ){
            console.log( '   '+c+' -> '+name );
        }
        Forums.client.collections[c] = new Mongo.Collection( name );
        Forums.client.collections[c].attachSchema( Forums[c].schema );
        return true;
    });
});

Meteor.startup( function(){
    _ready.val = true,
    _ready.dep.changed();
    if( Forums.opts().verbosity() & FRS_VERBOSE_READY ){
        console.log( 'pwix:forums ready', Forums.ready());
    }
});
