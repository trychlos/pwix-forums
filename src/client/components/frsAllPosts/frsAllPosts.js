/*
 * pwix:forums/src/client/components/frsAllPosts/frsAllPosts.js
 *
 * Manage options through a ReactiveVar which contains the Options object.
 */

import '../frs_posts_all/frs_posts_all.js';
import '../frs_posts_options/frs_posts_options.js';

import './frsAllPosts.html';
import './frsAllPosts.less';

Template.frsAllPosts.onCreated( function(){
    const self = this;

    self.FRS = {
        options: new ReactiveVar( {} )
    }
});

Template.frsAllPosts.helpers({

    // i18n
    i18n( opts ){
        return pwiForums.fn.i18n( 'allPosts.'+opts.hash.label );
    },

    // manage options through a ReactiveVar
    options(){
        return {
            name: 'allPosts',
            options: Template.instance().FRS.options
        };
    },

});
