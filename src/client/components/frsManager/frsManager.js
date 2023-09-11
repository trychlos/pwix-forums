/*
 * /src/client/components/frsManager/frsManager.js
 *
 * Settings Management.
 * 
 * It is expected that the application take care of only rendering this template for identified users with role 'FRS_ADMIN'.
 */

import '../../stylesheets/frs_forums.less';
import '../frs_settings_tab/frs_settings_tab.js';
import '../frs_tree_tab/frs_tree_tab.js';

import './frsManager.html';
import './frsManager.less';

Template.frsManager.onCreated( function(){
    const self = this;
    //console.log( self );

    self.FRS = {
        // current active tab identifier
        activeTab: new ReactiveVar( null )
    };
});

Template.frsManager.onRendered( function(){
    const self = this;

    // at rendering time, show the Tree panel
    //  this simulated click will trigger the 'show.bs.tab' event which itself set the active tab reactive var
    self.$( '#frsTreeNav' ).trigger( 'click' );
    self.$( '#frsSettingsContent' ).hide();

    // hide one of the (top-right) button panels depending of the active pane
    self.autorun(() => {
        const active = self.FRS.activeTab.get();
        switch( active ){
            case 'frsTreeNav':
                self.$( '.frs-tree-buttons' ).show();
                self.$( '.frs-settings-buttons' ).hide();
                break;
            case 'frsSettingsNav':
                self.$( '.frs-tree-buttons' ).hide();
                self.$( '.frs-settings-buttons' ).show();
                break;
        }
    });
});

Template.frsManager.helpers({
    // i18n
    i18n( opts ){
        return Forums.fn.i18n( 'manager.'+opts.hash.label );
    }
});

Template.frsManager.events({
    // click on a 'New' button: is forwarded to the corresponding tab
    // per convention, the target has an id built onto the source identifier
    'click .frs-button'( event, instance ){
        //console.log( 'frsManager', event );
        const id = $( event.target ).prop( 'id' ).replace( 'Header', 'Body' );
        instance.$( '#'+id ).trigger( 'frs-click' );
    },

    // message is sent on the nav-link target
    // make sure the tab is hidden
    'hidden.bs.tab'( event, instance ){
        //console.log( event );
        const id = $( event.target ).prop( 'id' ).replace( 'Nav', 'Content' );
        instance.$( '#'+id ).hide();
    },

    // keep a trace of the current active tab, the target here being the button.nav-link element
    'show.bs.tab'( event, instance ){
        //console.log( 'show.bs.tab', event );
        instance.FRS.activeTab.set($( event.target ).prop( 'id' ));
    },

    // keep a trace of the current active tab, the target here being the button.nav-link element
    'shown.bs.tab'( event, instance ){
        //console.log( 'show.bs.tab', event );
        const id = $( event.target ).prop( 'id' ).replace( 'Nav', 'Content' );
        instance.$( '#'+id ).show();
    }
});
