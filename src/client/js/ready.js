/*
 * pwix:forums/src/client/js/ready.js
 */

import { Tracker } from 'meteor/tracker';

_ready = {
    dep: new Tracker.Dependency(),
    val: false
};

/**
 * @summary Returned value is updated at package client startup.
 * @locus Client
 * @returns {Boolean} true when the package is ready
 * A reactive data source.
 */
Forums.ready = function(){
    _ready.dep.depend();
    return _ready.val;
}

Meteor.startup( function(){
    _ready.val = true,
    _ready.dep.changed();
    if( Forums.opts().verbosity() & Forums.C.Verbose.READY ){
        console.log( 'pwix:forums ready', Forums.ready());
    }
});
