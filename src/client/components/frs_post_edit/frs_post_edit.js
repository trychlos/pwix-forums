/*
 * /src/client/components/frs_post_edit/frs_post_edit.js
 *
 *  This is a multi-usage component:
 *
 *      - start a new thread
 *              mode=NEW (new post non replying to anything -> new thread)
 *              the 'object' is expected to be a Forum object
 *              a title will be made mandatory for the user
 *              the 'frs-post-edit-start' message will initialize the EDITION mode
 * 
 *      - reply to a post
 *              mode=REPLY
 *              the 'object' is the Post object to be replied to
 *              the 'frs-post-edit-start' message will initialize the EDITION mode
 * 
 *      - edit a post
 *              mode=EDIT
 *              the 'object' is the Post object to be edited
 *              the 'frs-post-edit-start' message will initialize the STANDARD mode
 *              waits for an 'frs-post-edit-edition' to switch to edition mode
 *              Note that the edited Post may be a thread starter, and so may have a title.
 * 
 *  The component is created hidden (with 'frs-hidden' class).
 *  It waits for a startup message to show itself and run.
 * 
 * Parms:
 * 
 *  - mode          Mandatory
 *                  String
 *                  Value: NEW|REPLY|EDIT
 * 
 *  - allowed       Mandatory
 *                  ReactiveVar
 *                  Should be true to let the current user edit the post
 * 
 *  - object        Mandatory
 *                  An object whose semantic depends of the requested mode
 *                  - NEW: the Forum object in which we want open a new thread
 *                  - EDIT: the Post object we want to edit
 *                  - REPLY: the Post object we want to reply to
 * 
 *  - autostart     Opt.
 *                  Boolean
 *                  When true, autostart itself instead of waiting for a 'frs-post-edit-start' message.
 *                  Defaults to true (autostart).
 * 
 * Notes:
 * 
 *  1. This component sends (to itself and bubble):
 * 
 *      - the 'frs-post-edit-closed' message, with { reason: <reason> } data, after having closed the view
 *      - the 'frs-post-edit-success' message, with { post: <post> } data, after having successfully recorded a new post
 *      - the 'frs-post-edit-error' message, with { err: <err> } data, if case of an error
 * 
 *  2. This component is able to deal with following messages:
 * 
 *      - 'frs-post-edit-start' starts up the component, switching to the mode depending of its usage
 *      - 'frs-post-edit-edition' activates the edition mode
 *      - 'frs-post-edit-end' ends up the view (maybe auto-hiding itself, or going back to startup mode)
 */

import { pwiForums } from '../../js/index.js';

import '../../stylesheets/frs_forums.less';

import './frs_post_edit.html';
import './frs_post_edit.less';

Template.frs_post_edit.onCreated( function(){
    const self = this;
    //console.log( self );

    self.FRS = {

        // why the 'closed' message is it sent
        //  either because our caller as asked that
        //  or because we have ourselves decide it
        cr: {
            REQCALLER: 'REQCALLER',                 // a request from our caller
            CANCEL: 'CANCEL',                   // the user asks us to close the component
            SUCCESS: 'SUCCESS'                  // successful post
        },

        // behavior configuration
        //  for the different use cases
        behavior: {
            EDIT: {
                startMode: TE_MODE_STANDARD,
                endMode: TE_MODE_STANDARD,
                hideOnClose: false,
                setContent( post ){ return post.content; },
                setTitle( post ){ return post.title; },
                wantTitle( post ){ return self.FRS.editorMode.get() === TE_MODE_EDITION && !post.threadId; }
            },
            NEW: {
                startMode: TE_MODE_EDITION,
                endMode: TE_MODE_HIDDEN,
                hideOnClose: true,
                setContent( post ){ return ''; },
                setTitle( post ){ return ''; },
                wantTitle( post ){ return true; }
            },
            REPLY: {
                startMode: TE_MODE_EDITION,
                endMode: TE_MODE_HIDDEN,
                hideOnClose: true,
                setContent( post ){ return ''; },
                setTitle( post ){ return ''; },
                wantTitle( post ){ return false; }
            }
        },

        // the requested mode
        //  will be set with the corresponding behavior object (e.g. behavior.NEW, or so on)
        mode: new ReactiveVar( null ),

        // a ReactiveVar to be provided by the caller
        allowed: null,

        // whether this component auto-starts itself ?
        autostart: true,

        // our new post
        edited: {
            title: new ReactiveVar( '' ),
            content: new ReactiveVar( '' )
        },

        // whether the component has been started up by the caller
        startedUp: new ReactiveVar( false ),
        startedDone: false,
        focusedDone: false,

        // the current edition mode as reported by underlying teEditor
        editorMode: new ReactiveVar( null ),

        // activating the edition
        // open the editor and gain the focus
        activates(){
            if( self.FRS.allowed.get()){
                self.$( '.teEditor' ).trigger( 'te-mode-set', { mode: TE_MODE_EDITION });

            } else {
                console.error( 'edition refused as user is not allowed' );
            }
        },

        // close the view after either:
        //  - a successfull post
        //  - or on Cancel click
        //  - or on caller request via 'frs-post-edit-end' message
        actionEnd( reason ){
            if( self.FRS.startedUp.get()){
                //console.log( 'actionEnd' );
                const mode = self.FRS.mode.get();
                self.$( '.frs-post-edit' ).removeClass( 'frs-EDITION' );
                // hide the editor, emptying our edited var
                if( mode.hideOnClose ){
                    self.$( '.frs-post-edit' ).addClass( 'frs-hidden' );
                    self.FRS.edited.title.set( '' );
                    self.FRS.edited.content.set( '' );
                    //self.$( '.teEditor' ).trigger( 'te-content-reset' );
                }
                // disactivate the preview button before setting the end mode
                self.FRS.previewOff( mode.endMode );
                // a canceled edition must be reverted (aka resetted)
                if( reason === self.FRS.cr.CANCEL ){
                    const object = Template.currentData().object;
                    self.FRS.edited.content.set( mode.setContent( object ));
                    //self.$( '.teEditor' ).trigger( 'te-content-reset' );
                }
                // and advertise others
                self.$( '.frs-post-edit' ).trigger( 'frs-post-edit-closed', { reason: reason });
                //console.log( 'setting startedUp to false' );
                self.FRS.startedUp.set( false );
                // last re-start if auto
                if( self.FRS.autostart ){
                    self.FRS.actionStart();
                }
            }
        },

        // start actions for this component
        actionStart(){
            //console.log( 'actionStart' );
            self.FRS.startedUp.set( true );
            self.FRS.startedDone = false;
            self.FRS.focusedDone = false;
            if( self.view.isRendered ){
                self.$( '.teEditor' ).trigger( 'te-content-reset' );
            }
        },

        // is this component autostart ?
        autostart(){
            let autostart = true;
            console.log( Template.currentData());
            if( Object.keys( Template.currentData()).includes( 'autostart' )){
                autostart = Template.currentData().autostart;
            }
            return autostart;
        },

        /*
         * togging / activation / disactivation of the Preview toggle button
         */

        // Preview button activation
        previewOn(){
            self.$( '.teEditor' ).trigger( 'te-mode-set', { mode: TE_MODE_PREVIEW });
            self.$( '.frs-message' ).removeClass( 'frs-hidden' ).text( pwiForums.fn.i18n( 'post_edit.preview_mode' ));
        },

        // Preview button disactivation
        //  we want explicitely toggle off the button when the view is cancel'ed
        previewOff( editorMode=TE_MODE_EDITION ){
            self.$( 'button.frs-preview-btn' ).removeClass( 'active' ).prop( 'aria-pressed', false );
            self.$( '.frs-message' ).addClass( 'frs-hidden' ).text( '' );
            self.$( '.teEditor' ).trigger( 'te-mode-set', { mode: editorMode });
        },

        // toggle a Preview button
        //  note that the button has already its new state (thanks to Bootstrap framework)
        previewToggle(){
            if( self.$( 'button.frs-preview-btn' ).hasClass( 'active' )){
                self.FRS.previewOn();
            } else {
                self.FRS.previewOff();
            }
        },

        // whether we want a title input field ?
        //  either in NEW mode
        //  or in EDIT mode when the edited post in a thread leader and in edition mode
        wantTitle(){
            const mode = self.FRS.mode.get();
            const object = Template.currentData().object;
            return mode && object && mode.wantTitle( object );
        }
    };

    // parms
    //  get the requested mode
    self.autorun(() => {
        if( !self.FRS.mode.get()){
            const mode = Template.currentData().mode;
            if( mode && Object.keys( self.FRS.behavior ).includes( mode )){
                self.FRS.behavior[mode].label = mode;
                self.FRS.mode.set( self.FRS.behavior[mode] );
            }
        }
    });

    // parms
    //  get the allowed reactive var
    self.autorun(() => {
        if( !self.FRS.allowed ){
            const allowed = Template.currentData().allowed;
            if( allowed && typeof allowed === 'object' ){
                self.FRS.allowed = allowed;
                //console.log( 'set allowed', allowed );
            }
        }
    });
});

Template.frs_post_edit.onRendered( function(){
    const self = this;

    // on startup, setup the editor initial mode
    self.autorun(() => {
        if( self.FRS.startedUp.get() && !self.FRS.startedDone ){
            const mode = self.FRS.mode.get();
            //console.log( 'mode', mode );
            //console.log( self );
            if( mode ){
                self.$( '.teEditor' ).trigger( 'te-mode-set', { mode: mode.startMode });
                self.$( '.frs-post-edit' ).removeClass( 'frs-hidden' );
                self.FRS.startedDone = true;
            }
        }
    })

    // set the new edited content depending both of the mode and the object received
    self.autorun(() => {
        const mode = self.FRS.mode.get();
        const object = Template.currentData().object;
        if( mode && object ){
            const edited = self.FRS.edited;
            //console.log( 'mode', mode, 'object', object );
            edited.title.set( mode.setTitle( object ));
            edited.content.set( mode.setContent( object ));
        }
    });

    // follow the editor mode
    self.autorun(() => {
        const editorMode = self.FRS.editorMode.get();
        switch( editorMode ){
            case TE_MODE_STANDARD:
                break;
            case TE_MODE_PREVIEW:
                break;
            case TE_MODE_EDITION:
                break;
        }
    });

    // either start now, or wait for 'frs-post-edit-start' message
    if( Object.keys( Template.currentData()).includes( 'autostart' )){
        self.FRS.autostart = Template.currentData().autostart;
    }
    if( self.FRS.autostart ){
        self.FRS.actionStart();
    }
});

Template.frs_post_edit.helpers({
    // enable / disable the Post button
    //  content must be set
    //  in NEW mode, title must also be set
    disablePost(){
        const edited = Template.instance().FRS.edited;
        const enabled = edited.content.get().length > 0 && ( !Template.instance().FRS.wantTitle() || edited.title.get().length > 0 );
        return enabled ? '' : 'disabled';
    },

    // enable / disable the Preview button
    //  content must be set
    disablePreview(){
        const edited = Template.instance().FRS.edited;
        let enabled = edited.content.get().length > 0;
        return enabled ? '' : 'disabled';
    },

    // label translation
    i18n( opts ){
        return pwiForums.fn.i18n( 'post_edit.'+opts.hash.label );

    },

    parmsEditor(){
        const allowed = Template.instance().FRS.allowed;
        //console.log( 'parmsEditor with allowed', allowed );
        //console.log( Template.instance().FRS.edited.content );
        return {
            content: Template.instance().FRS.edited.content,
            editAllowed: allowed,
            withNamePanel: false,
            withHTMLBtn :false,
            withFullScreenBtn: false
        };
    },

    // buttons are shown in edition and preview modes
    showButtons(){
        const editorMode = Template.instance().FRS.editorMode.get();
        return editorMode && editorMode !== TE_MODE_STANDARD;
    },

    // in NEW mode, a title is mandatory (edited post title)
    //  in EDIT mode, have a title if original Post had one and we are in edition mode
    showTitle(){
        return Template.instance().FRS.wantTitle();
    },

    // title value
    title(){
        return Template.instance().FRS.edited.title.get();
    }
});

Template.frs_post_edit.events({
    // enable the 'Save' button when there is something here
    'input .frs-title'( event, instance ){
        instance.FRS.edited.title.set( instance.$( event.currentTarget ).val());
    },

    'click .frs-cancel-btn'( event, instance ){
        instance.FRS.actionEnd( instance.FRS.cr.CANCEL );
        return false;
    },

    // publishing the post
    'click .frs-post-btn'( event, instance ){
        // in EDIT mode, first initialize the object from its origin

        let o = {};
        const object = Template.currentData().object;
        const mode = instance.FRS.mode.get();
        switch( mode.label ){
            // edit post:
            //  - object parm is expected to be the original to-be-edited Post object
            case 'EDIT':
                o = { ...object };
                if( object.title && object.title.length ){
                    o.title = instance.FRS.edited.title.get();
                }
                break;
            // new thread:
            //  - have a title
            //  - object parm is expected to be the Forum object
            case 'NEW':
                o.title = instance.FRS.edited.title.get();
                o.forum = object._id;
                o.owner = Meteor.userId();
                break;
            case 'REPLY':
                o.forum = object.forum;
                o.replyTo = object._id;
                o.threadId = object.threadId || object._id;
                o.owner = Meteor.userId();
                break;
        }
        o.content = instance.FRS.edited.content.get();

        Meteor.call( 'frsPosts.upsert', o, ( err, res ) => {
            if( err ){
                console.error( err );
                tlTolert.error( pwiForums.fn.i18n( 'post_edit.msg_error' ));
                instance.$( '.frs-post-edit' ).trigger( 'frs-post-edit-error', { err: err });

            } else {
                tlTolert.success( pwiForums.fn.i18n( 'post_edit.msg_success' ));
                instance.$( '.frs-post-edit' ).trigger( 'frs-post-edit-success', { post: res.upserted });
                // close this component
                instance.FRS.actionEnd( instance.FRS.cr.SUCCESS );
            }
        });
        return false;
    },

    'click .frs-preview-btn'( event, instance ){
        instance.FRS.previewToggle();
        return false;
    },

    // the edition mode is requested
    'frs-post-edit-edition .frs-post-edit'( event, instance ){
        if( instance.FRS.startedUp.get()){
            instance.$( '.teEditor' ).trigger( 'te-mode-set', { mode: TE_MODE_EDITION });
        }
    },

    // startup the component
    'frs-post-edit-start .frs-post-edit'( event, instance ){
        instance.FRS.actionStart();
    },

    // ends up the component on caller request
    'frs-post-edit-end .frs-post-edit'( event, instance ){
        instance.FRS.actionEnd( instance.FRS.cr.REQCALLER );
    },

    // the editor is initialized: go with the focus
    //  but the first time only
    'te-initialized .frs-post-edit'( event, instance ){
        console.log( 'te-initialized' );
        if( !instance.FRS.focusedDone ){
            if( instance.FRS.wantTitle()){
                instance.$( 'input.frs-title' ).focus();
            }
            instance.FRS.focusedDone = true;
        }
    },

    // the editor mode has been changed: update our internal ReactiveVar
    'te-mode-changed .frs-post-edit'( event, instance, data ){
        instance.FRS.editorMode.set( data.new );
    }
});
