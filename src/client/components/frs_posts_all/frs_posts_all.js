/*
 * pwix:forums/src/client/components/frs_posts_all/frs_posts_all.js
 *
 * Parms:
 * - options: as a ReactiveDict
 */

import { frsOrderedTree } from '../../../common/classes/frs_ordered_tree.class.js';

import '../frs_posts_all/frs_posts_all.js';
import '../frs_posts_options/frs_posts_options.js';

import './frs_posts_all.html';

Template.frs_posts_all.onCreated( function(){
    const self = this;

    self.FRS = {
        orderedTree: new frsOrderedTree(),
        displayable: new ReactiveVar( [] )      // the displayable forums list
    }

});

Template.frs_posts_all.onRendered( function(){
    const self = this;

});

Template.frs_posts_all.helpers({

});
