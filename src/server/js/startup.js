/*
 * pwix:forums/src/server/js/startup.js
 */
import { Mongo } from 'meteor/mongo';

Meteor.startup( function(){
    // define the collections
    if( pwiForums.opts().verbosity() & FRS_VERBOSE_COLLECTIONS ){
        console.log( 'pwix:forums defining collections...' );
    }
    pwiForums.collections.every(( c ) => {
        const name = pwiForums.opts()['collections.prefix'] + pwiForums[c].radical;
        if( pwiForums.opts().verbosity() & FRS_VERBOSE_COLLECTIONS ){
            console.log( '   '+c+' -> '+name );
        }
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
