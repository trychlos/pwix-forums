/*
 * /components/frs_forum_panel/frs_forum_panel.js
 *
 * Forum properties edition.
 * 
 * It is expected that the application take care of only rendering this template for identified users with role 'FRS_FORUMS_ADMIN'.
 * 
 * Parms:
 * - forum: the edited object, or null
 */
import { ReactiveVar } from 'meteor/reactive-var';

import { tlTolert } from 'meteor/pwix:tolert';

import { pwiForums } from '../../js/index.js';

import '../../stylesheets/frs_forums.less';

import '../frs_forum_tab/frs_forum_tab.js';

import './frs_forum_panel.html';

Template.frs_forum_panel.onCreated( function(){
    const self = this;

    self.FRS = {

        tabItems: [
            {
                tab_id: 'props_tab',
                tab_label: 'props_tab',
                pane_id: 'props_pane',
                aria: 'Properties',
                template: 'frs_forum_tab',
                datafn: 'dataProperties'
            },
            {
                tab_id: 'privusers_tab',
                tab_label: 'privusers_tab',
                pane_id: 'privusers_pane',
                aria: 'PrivateUsers',
                template: 'acSelect',
                datafn: 'dataPrivate'
            },
            {
                tab_id: 'moderators_tab',
                tab_label: 'moderators_tab',
                pane_id: 'moderators_pane',
                aria: 'Moderators',
                template: 'acSelect',
                datafn: 'dataModerators'
            }
        ],

        // the passed-in forum
        //  is reactive to enable / disable the 'Save' button
        forum: new ReactiveVar( null ),

        // acSelect requires to get its data from a ReactiveVar
        privUsers: new ReactiveVar( [] ),
        moderators: new ReactiveVar( [] ),

        // the active tab id
        activeTab: new ReactiveVar( 'props_tab' ),

        // provides the data context for the moderators tab
        dataModerators( it ){
            return {
                selection: self.FRS.moderators,
                text: new ReactiveVar( pwiForums.fn.i18n( 'forum_edit.moderators_text' ))
            };
        },

        // provides the data context for the private tab
        //  here the private users
        dataPrivate( it ){
            return {
                selection: self.FRS.privUsers,
                text: new ReactiveVar( pwiForums.fn.i18n( 'forum_edit.privusers_text' ))
            };
        },

        // provides the data context for the properties tab
        //  here the forum ReactiveVar
        dataProperties( it ){
            return { forum: self.FRS.forum };
        }
    };
});

Template.frs_forum_panel.onRendered( function(){
    const self = this;

    pwixModal.setTarget( self.$( '.frs-forum-panel' ));

    // set our variables as soon as we get the forum
    //  - private users
    self.autorun(() => {
        const f = Template.currentData().forum;
        if( f ){
            self.FRS.forum.set( f );
            self.FRS.privUsers.set( f.privateUsers || [] );
            self.FRS.moderators.set( f.moderators || [] );
        }
    });

    // enable / disable the 'Save' button depending of the forum title
    self.autorun(() => {
        const f = self.FRS.forum.get();
        let title = f && f.title ? f.title : '';
        title = title.trim();
        self.$( 'button.frs-save' ).prop( 'disabled', title.length === 0 );
    });

    // enable/disable the private users tab depending of the private checkbox
    self.autorun(() => {
        const f = self.FRS.forum.get();
        const priv = f ? f.private : false;
        self.$( 'button#privusers_tab' ).prop( 'disabled', !priv );
    });
});

Template.frs_forum_panel.helpers({
    // get a translated label
    i18n( opts ){
        return pwiForums.fn.i18n( 'forum_edit.'+opts.hash.label );
    },
    // modal title
    modalTitle(){
        const f = Template.instance().FRS.forum.get();
        return pwiForums.fn.i18n( 'forum_edit.'+( f && f._id ? 'modal_edit' : 'modal_new' ));
    },
    // whether the pane is active ?
    paneActive( it ){
        return Template.instance().FRS.activeTab.get() === it.tab_id ? 'show active' : '';
    },
    // whether the tab is active ?
    tabActive( it ){
        return Template.instance().FRS.activeTab.get() === it.tab_id ? 'active' : '';
    },
    // the data context of the dynamic tab template
    //  the datafn is the name of a function in self.FRS
    tabData( it ){
        return Template.instance().FRS[it.datafn]( it );
    },
    // whether the tab is enabled ?
    //  at the moment, only relevant for privateUsers
    tabEnable( it ){
        return Template.instance().FRS.activeTab.get() === it.tab_id ? 'active' : '';
    },
    // returns the list of tabs
    tabItems(){
        return Template.instance().FRS.tabItems;
    },
    // the tab label
    tabLabel( it ){
        return pwiForums.fn.i18n( 'forum_edit.'+it.tab_label );
    },
    // the aria label for an active tab
    tabSelected( it ){
        return Template.instance().FRS.activeTab.get() === it.tab_id ? 'true' : 'false';
    },
    // a link to the target tab
    tabTargetLink( it ){
        return '#'+it.id;
    }
});

Template.frs_forum_panel.events({
    'md-click .frs-forum-panel'( event, instance, data ){
        //console.log( event, instance, data );
        if( data.button === MD_BUTTON_SAVE ){
            let f = instance.FRS.forum.get();
            if( !f.category ){
                f.category = pwiForums.Categories.default;
            }
            f.privateUsers = instance.FRS.privUsers.get();
            f.moderators = instance.FRS.moderators.get();
            //console.log( f );
            Meteor.call( 'frsForums.upsert', f, ( err, res ) => {
                if( err ){
                    console.error( err );
                    tlTolert.error( 'message_error' );
                } else {
                    console.log( res );
                    tlTolert.success( pwiForums.fn.i18n( 'forum_edit.'+( f._id ? 'message_updated' : 'message_created' ), res.upserted.title ));
                    pwixModal.close();
                }
            });
        }
    }
    /*
    // submit the updates to the db
    'click button.frs-save'( event, instance ){
        console.log( event, instance );
        return true;
        let f = instance.FRS.forum.get();
        if( !f.category ){
            f.category = pwiForums.Categories.default;
        }
        f.privateUsers = instance.FRS.privUsers.get();
        f.moderators = instance.FRS.moderators.get();
        //console.log( f );
        Meteor.call( 'frsForums.upsert', f, ( err, res ) => {
            if( err ){
                console.error( err );
                tlTolert.error( 'message_error' );
            } else {
                console.log( res );
                tlTolert.success( pwiForums.fn.i18n( 'forum_edit.'+( f._id ? 'message_updated' : 'message_created' ), res.upserted.title ));
            }
            instance.$( '.frs-modal' ).modal( 'hide' );
        });
        return false;
    }
    */
});
