/*
 * pwix:forums/src/client/components/frs_category_panel/frs_category_panel.js
 *
 * Category editing.
 * 
 * Params:
 * - cat: the category to be edited, or null
 */

import { Modal } from 'meteor/pwix:modal';
import { Tolert } from 'meteor/pwix:tolert';

import { Forums } from '../../js/index.js';

import { frsColor } from '../../../common/classes/frs_color.class.js';

import '../frs_color_button/frs_color_button.js';
import '../frs_color_panel/frs_color_panel.js';

import './frs_category_panel.html';

Template.frs_category_panel.onCreated( function(){
    const self = this;

    self.FRS = {
        // the title is made reactive to enable/disable the save button
        title: new ReactiveVar( null ),
        // the color is reactive to provide a retroaction way from the frs_color_panel
        rvColor: new ReactiveVar( null )
    };
    
    self.FRS.title.set( self.data && self.data.cat ? self.data.cat.title : '' );

    self.autorun(() => {
        const cat = Template.currentData().cat;
        const color = cat ? cat.color : null;
        self.FRS.rvColor.set( color || frsColor.Random().color());
    });
});

Template.frs_category_panel.onRendered( function(){
    const self = this;

    Modal.set({ target: self.$( '.frs-category-panel' )});

    // the Submit button is enabled if the record is OK to be saved (i.e. useable)
    //  if and only if the title is not empty
    self.autorun(() => {
        const title = self.FRS.title.get();
        return Modal.set({ buttons: { id: Modal.C.Button.SAVE, enabled: title.length > 0 }});
    });
});

Template.frs_category_panel.helpers({
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

    // category color
    rvColor(){
        return Template.instance().FRS.rvColor;
    },

    // i18n
    i18n( opts ){
        return Forums.fn.i18n( 'category_edit.'+opts.hash.label );
    }
});

Template.frs_category_panel.events({

    // click on the color button
    'click .frs-color-button'( event, instance ){
        Modal.run({
            mdBody: 'frs_color_panel',
            mdTitle: Forums.fn.i18n( 'color.choose' ),
            mdButtons: [ Modal.C.Button.CANCEL, Modal.C.Button.OK ],
            rvColor: instance.FRS.rvColor
        });
    },

    // handle every change on the title
    'input .frs-title'( event, instance ){
        const title = $( event.currentTarget ).val().trim();
        instance.FRS.title.set( title );
    },

    // Modal click
    'md-click .frs-category-panel'( event, instance, data ){
        if( data.button === MD_BUTTON_SAVE ){
            let o = instance.data.cat || {};
            o.title = instance.$( '.frs-title' ).val();
            o.description = instance.$( '.frs-description' ).val();
            o.color = instance.FRS.rvColor.get();
            Meteor.call( 'frsCategories.upsert', o, ( err, res ) => {
                if( err ){
                    Tolert.error({ type:err.error, message:err.reason });
                } else {
                    Tolert.success( Forums.fn.i18n( 'category_edit.'+( o._id ? 'message_updated' : 'message_created' ), res.upserted.title ));
                    Modal.close();
                }
            });
        }
    }
});
