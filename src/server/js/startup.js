/*
 * pwix:forums/src/server/js/startup.js
 */
import { Mongo } from 'meteor/mongo';

Meteor.startup( function(){
    // define the collections
    if( Forums.opts().verbosity() & FRS_VERBOSE_COLLECTIONS ){
        console.log( 'pwix:forums defining collections...' );
    }
    Forums.collections.every(( c ) => {
        const name = Forums.opts()['collections.prefix']() + Forums[c].radical;
        if( Forums.opts().verbosity() & FRS_VERBOSE_COLLECTIONS ){
            console.log( '   '+c+' -> '+name );
        }
        Forums.server.collections[c] = new Mongo.Collection( name );
        Forums.server.collections[c].attachSchema( Forums[c].schema );
        Forums[c].deny();
        if( Forums[c].serverTransform ){
            Forums.server.collections[c].serverTransform( Forums[c].serverTransform );
        }
        //console.log( Forums.server.collections[c] );
        return true;
    });
    //console.log( Forums );
});
