/*
 * pwix:forums/src/client/js/autorun.js
 */

import { Tracker } from 'meteor/tracker';

// must wait that the package is ready so that the collections prefix is set
Tracker.autorun(() => {
    if( Forums.ready()){
        Forums.client.fn.userDataUpdate();
    }
});
