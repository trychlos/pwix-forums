/*
 * pwi:forums/src/server/js/startup.js
 */
import { Mongo } from 'meteor/mongo';

if( Meteor.isServer ){
    Meteor.startup( function(){
        // define the collections
        console.log( 'pwi:forums/src/client/js/startup.js Meteor.startup() defining collections...' );
        pwiForums.collections.every(( c ) => {
            const name = pwiForums.conf.prefix + pwiForums[c].radical;
            console.log( '   '+c+' -> '+name );
            pwiForums.server.collections[c] = new Mongo.Collection( name );
            pwiForums.server.collections[c].attachSchema( pwiForums[c].schema );
            pwiForums[c].deny();
            if( pwiForums[c].serverTransform ){
                pwiForums.server.collections[c].serverTransform( pwiForums[c].serverTransform );
            }
            //console.log( pwiForums.server.collections[c] );
            return true;
        });
        //console.log( pwiForums );
    });
}
