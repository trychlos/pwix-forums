/*
 * pwix:forums/src/client/components/frs_color_panel/frs_color_panel.js
 *
 * Parms:
 * - rvColor: a ReactiveVar which contains the initial color, and will return the selected one
 */

import { Modal } from 'meteor/pwix:modal';
import { ReactiveVar } from 'meteor/reactive-var';

import { frsColor } from '../../../common/classes/frs_color.class.js';

import './frs_color_panel.html';
import './frs_color_panel.less';

Template.frs_color_panel.onCreated( function(){
    const self = this;

    self.FRS = {
        rvCurrent: new ReactiveVar( null ),

        // set the provided color as the current one
        setCurrent( color ){
            self.FRS.rvCurrent.set( color );
        }
    };
});

Template.frs_color_panel.onRendered( function(){
    const self = this;

    Modal.set({ target: self.$( '.frs-color-panel' )});

    // set the provided color as the current one
    self.autorun(() => {
        self.FRS.rvCurrent.set( Template.currentData().rvColor.get());
    });
});

Template.frs_color_panel.helpers({
    // display the color on the button
    rvColor( color ){
        return new ReactiveVar( color );
    },

    // the current selection
    rvCurrent( color ){
        return Template.instance().FRS.rvCurrent;
    },

    // returns the list of available colors
    colors(){
        return frsColor.Colors;
    },

    // i18n
    i18n( opts ){
        return Forums.fn.i18n( 'color.'+opts.hash.label );
    }
});

Template.frs_color_panel.events({

    // a new color has been chosen
    'frs-color-clicked .frs-color-choices'( event, instance, data ){
        instance.FRS.rvCurrent.set( data.color );
    },

    // dialog validation
    'md-click .frs-color-panel'( event, instance, data ){
        if( data.button.id === Modal.C.Button.OK ){
            Template.currentData().rvColor.set( instance.FRS.rvCurrent.get());
            Modal.close();
        }
    }
});
