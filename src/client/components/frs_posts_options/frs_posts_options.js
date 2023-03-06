/*
 * pwix:forums/src/client/components/frs_posts_options/frs_posts_options.js
 *
 * Parms:
 * - name
 * - options: a ReactiveVar
 */

import '../frs_posts_options/frs_posts_options.js';
import '../frs_posts_options/frs_posts_options.js';

import './frs_posts_options.html';

Template.frs_posts_options.onCreated( function(){

});

Template.frs_posts_options.helpers({

    // i18n
    i18n( opts ){
        return pwiForums.fn.i18n( 'posts_options.'+opts.hash.label );
    },

});
