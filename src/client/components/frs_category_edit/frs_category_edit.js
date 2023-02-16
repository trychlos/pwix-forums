/*
 * /components/frs_category_edit/frs_category_edit.js
 *
 * Category editing.
 * 
 * Params:
 * - cat: the category to be edited, or null
 */

import { tlTolert } from 'meteor/pwix:tolert';

import { pwiForums } from '../../js/index.js';

import './frs_category_edit.html';

Template.frs_category_edit.onCreated( function(){
    const self = this;

    self.FRS = {
        // the title is made reactive to enable/disable the save button
        title: new ReactiveVar( null )
    };
    
    self.FRS.title.set( self.data && self.data.cat ? self.data.cat.title : '' );
});

Template.frs_category_edit.onRendered( function(){
    this.$( '.modal' ).modal( 'show' );
});

Template.frs_category_edit.helpers({
    // category description
    catDescription(){
        const cat = Template.currentData().cat;
        return cat ? cat.description : '';
    },

    // category title
    catTitle(){
        const cat = Template.currentData().cat;
        return cat ? cat.title : '';
    },

    // i18n
    i18( opts ){
        return pwiForums.fn.i18n( 'category_edit.'+opts.hash.label );
    },

    // modal title
    modalTitle(){
        const cat = Template.currentData().cat;
        return pwiForums.fn.i18n( 'category_edit.'+( cat && cat._id ? 'modal_edit' : 'modal_new' ));
    },

    // the Submit button is enabled if the record is OK to be saved (i.e. useable)
    //  if and only if the title is not empty
    saveDisabled(){
        const title = Template.instance().FRS.title.get();
        return title.length > 0 ? '' : 'disabled';
    }
});

Template.frs_category_edit.events({
    // click on the 'Save' button: record the new category and close the input area
    'click .frs-save'( event, instance ){
        let o = instance.data.cat || {};
        o.title = instance.$( '.frs-title' ).val();
        o.description = instance.$( '.frs-description' ).val();
        Meteor.call( 'frsCategories.upsert', o, ( err, res ) => {
            if( err ){
                tlTolert.error({ type:err.error, message:err.reason });
            } else {
                tlTolert.success( pwiForums.fn.i18n( 'category_edit.'+( o._id ? 'message_updated' : 'message_created' ), res.upserted.title ));
            }
            instance.$( '.frs-modal' ).modal( 'hide' );
        });
        return false;
    },

    // handle every change on the title
    'input .frs-title'( event, instance ){
        const title = $( event.currentTarget ).val().trim();
        instance.FRS.title.set( title );
    },

    'shown.bs.modal .frs-modal'( event, instance ){
        instance.$( '.frs-title' ).focus();
    },

    // remove the Blaze element from the DOM
    'hidden.bs.modal .frs-category-edit'( event, instance ){
        Blaze.remove( instance.view );
    }
});
