/*
 * pwix:forums/src/client/components/frsAllPosts/frsAllPosts.js
 *
 * Manage options through a ReactiveDict which contains the key=values.
 */

import { ReactiveDict } from 'meteor/reactive-dict';

import '../frs_posts_all/frs_posts_all.js';
import '../frs_posts_options/frs_posts_options.js';

import './frsAllPosts.html';
import './frsAllPosts.less';

Template.frsAllPosts.onCreated( function(){
    const self = this;

    self.FRS = {
        options: new ReactiveDict()
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
