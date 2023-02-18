/*
 * pwix:forums/src/common/js/startup.js
 */

Meteor.startup( function(){
    //console.log( 'pwix:forums/src/common/startup.js Meteor.startup()' );
    if( pwiForums.opts().verbosity() & FRS_VERBOSE_STARTUP ){
        console.log( 'pwix:forums pwiForums', pwiForums );
    }
});
