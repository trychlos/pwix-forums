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

Template.frsAllPosts.onRendered( function(){
    const self = this;

    self.autorun(() => {
        console.log( self.FRS.options.all());
    });
});

Template.frsAllPosts.helpers({

    // i18n
    i18n( opts ){
        return Forums.fn.i18n( 'allPosts.'+opts.hash.label );
    },

    // manage options through a ReactiveDict
    optionsParms(){
        return {
            name: 'allPosts',
            options: Template.instance().FRS.options
        };
    },

    // options to be passed to the frs_all_posts component
    //  same thant optionsParms at the moment
    postsParms(){
        return {
            name: 'allPosts',
            options: Template.instance().FRS.options
        };
    },

});
