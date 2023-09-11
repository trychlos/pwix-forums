/*
 * pwix:forums/src/common/js/startup.js
 */

Meteor.startup( function(){
    //console.log( 'pwix:forums/src/common/startup.js Meteor.startup()' );
    if( Forums.opts().verbosity() & Forums.C.Verbose.STARTUP ){
        console.log( 'pwix:forums Forums', Forums );
    }
});
