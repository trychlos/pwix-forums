/*
 * pwix:forums/src/client/js/config.js
 */

import { Tracker } from 'meteor/tracker';

_ready = {
    dep: new Tracker.Dependency(),
    val: false
};

Forums = {
    ...Forums,
    ...{
        /**
         * @summary Returned value is updated at package client startup.
         * @locus Client
         * @returns {Boolean} true when the package is ready
         * A reactive data source.
         */
        ready: function(){
            _ready.dep.depend();
            return _ready.val;
        }
    }
}
