/*
 * pwi:forums/src/client/js/startup.js
 */

import '../../common/js/index.js';

if( Meteor.isClient ){
    Meteor.startup( function(){
        // define the cient-side collections
        console.log( 'pwi:forums/src/client/js/startup.js Meteor.startup() defining collections...' );
        pwiForums.collections.every(( c ) => {
            const name = pwiForums.conf.prefix + pwiForums[c].radical;
            console.log( '   '+c+' -> '+name );
            pwiForums.client.collections[c] = new Mongo.Collection( name );
            pwiForums.client.collections[c].attachSchema( pwiForums[c].schema );
            return true;
        });
    });
}

if( Meteor.isClient ){
    Meteor.startup( function(){
        console.log( 'pwi:forums/src/client/js/startup.js Meteor.startup() setting package ready' );
        _ready.val = true,
        _ready.dep.changed();
    });
}
