/*
 * /src/client/components/frs_post_tr/frs_post_tr.js
 *
 * Displays a post in a <tr> table row on three <td> columns
 * 
 * Parms
 *  - forum: the forum
 *  - post: the post to be displayed
 *  - writer: a ReactiveVar which contains whether the current user is allowed to write in this forum
 * 
 * Actions
 *  - sends a message 'frs-post-tr-close' to itself when asking for close
 *    provides { post: <post> } object data
 *  - sends a message 'frs-post-tr-deleted' to itself when the post has been deleted by the user
 *    provides { post: <post> } object data
 */

import { pwixBootbox } from 'meteor/pwix:bootbox';
import { pwixI18n as i18n } from 'meteor/pwix:i18n';
import { pwixModal } from 'meteor/pwix:modal';

import { Forums } from '../../js/index.js';

import '../../stylesheets/frs_forums.less';
import '../frsPosts/frsPosts.less';

import './frs_post_tr.html';

Template.frs_post_tr.onCreated( function(){
    const self = this;
    //console.log( self );

    self.FRS = {
        // if the provided post has been moderated
        //  and is displayed as part of the honor of 'showDeletedForAdmin' forum property
        moderated(){
            const post = Template.currentData().post;
            return post.deletedAt && post.deletedBecause;
        },

        // if the provided post has been deleted by its owner
        //  and is displayed as part of the honor of 'showDeletedForUser' forum property
        userDeleted(){
            const post = Template.currentData().post;
            return post.deletedAt && !post.deletedBecause && post.deletedBy === Meteor.userId();
        },

        // toggling / activation / disactivation of the Edit toggle button
        //  only one 'Edit' operation is allowed at same time
        //  when an 'Edit' operation is current, no reply is allowed
        // 
        activatedEdit: null,

        // Reply button activation
        editOn( postId ){
            if( self.FRS.activatedEdit ){
                self.FRS.editOff();
            }
            self.FRS.jqEditComponent( postId ).trigger( 'frs-post-edit-edition' );
            self.FRS.activatedEdit = postId;
        },

        // Reply button disactivation
        //  hide the editor, repassing it in standard mode
        editOff(){
            self.FRS.jqEditButton( self.FRS.activatedEdit ).removeClass( 'active' ).prop( 'aria-pressed', false );
            self.FRS.jqEditComponent( self.FRS.activatedEdit ).trigger( 'frs-post-edit-end' );
            self.FRS.activatedEdit = null;
        },

        // toggle a Reply button
        //  note that the button has readly its new state (thanks to Bootstrap framework)
        editToggle( postId ){
            if( self.FRS.jqEditButton( postId ).hasClass( 'active' )){
                self.FRS.editOn( postId );
            } else {
                self.FRS.editOff( postId );
            }
        },

        // some jQuery selectors
        jqEditButton( postId ){
            return self.$( 'tr.frs-post-tr[data-post-id="'+postId+'"] button.frs-edit-btn' );
        },
        jqEditComponent( postId ){
            return self.$( 'tr.frs-post-tr[data-post-id="'+postId+'"] .frs-post-edit' );
        },
        jqReplyButton( postId ){
            return self.$( 'tr.frs-post-tr[data-post-id="'+postId+'"] button.frs-reply-btn' );
        },
        jqReplyComponent( postId ){
            return self.$( 'tr.frs-reply-tr[data-post-id="'+postId+'"] .frs-post-edit' );
        },

        // toggling / activation / disactivation of the Reply toggle button
        // this is needed because we have here two toggle buttons whose views must share the same visual space
        // 
        activatedReply: null,

        // Reply button activation
        replyOn( postId ){
            //console.log( 'replyOn', postId );
            if( self.FRS.activatedReply ){
                self.FRS.replyOff();
            }
            self.FRS.jqReplyComponent( postId ).trigger( 'frs-post-edit-start' );
            self.FRS.activatedReply = postId;
        },

        // Reply button disactivation
        //  hide the editor, repassing it in standard mode
        replyOff(){
            //console.log( 'replyOff', self.FRS.activatedReply );
            self.FRS.jqReplyButton( self.FRS.activatedReply ).removeClass( 'active' ).prop( 'aria-pressed', false );
            self.FRS.jqReplyComponent( self.FRS.activatedReply ).trigger( 'frs-post-edit-end' );
            self.FRS.activatedReply = null;
        },

        // toggle a Reply button
        //  note that the button has readly its new state (thanks to Bootstrap framework)
        replyToggle( postId ){
            //console.log( 'toggling', postTr, self.FRS );
            if( self.FRS.jqReplyButton( postId ).hasClass( 'active' )){
                self.FRS.replyOn( postId );
            } else {
                self.FRS.replyOff();
            }
        }
    };

    // get the owner username
    self.autorun(() => {
        let post = Template.currentData().post;
        post.rvAuthor = Forums.fn.labelById( post.owner, AccountsTools.C.PreferredLabel.USERNAME );
    })
});

Template.frs_post_tr.onRendered( function(){
    const self = this;

    // whether the post has been moderated (or deleted by the user) ?
    if( self.FRS.moderated()){
        if( self.view.isRendered ){
            self.$( 'tr.frs-post-tr' ).addClass( 'frs-moderated-post frs-hidden' );
        }
    }
});

Template.frs_post_tr.helpers({
    // whether the user can edit this post (if he is the owner) ?
    canEdit( it ){
        const id = Meteor.userId();
        const owner = it && id ? it.owner === id : false;
        return owner && Template.currentData().writer.get() && !Template.instance().FRS.moderated() && !Template.instance().FRS.userDeleted();
    },

    // whether the post can be deleted (by its owner)
    //  only while it has not yet been replied to
    canDelete( it ){
        return it.repliesCount === 0 && it.owner === Meteor.userId() && Template.currentData().writer.get() && !Template.instance().FRS.moderated() && !Template.instance().FRS.userDeleted();
    },

    // whether the current post is replyable ?
    canReply( it ){
        const replyable = it && it.replyable ? true : false;
        return replyable && Template.currentData().writer.get() && !Template.instance().FRS.moderated() && !Template.instance().FRS.userDeleted();
    },

    // whether the post has been moderated or deleted by its owner?
    deleted(){
        return Template.instance().FRS.moderated() || Template.instance().FRS.userDeleted();
    },

    // label translation
    i18n( opts ){
        return Forums.fn.i18n( 'threads.'+opts.hash.label );
    },

    // whether the current user is a moderator of this forum ?
    isModerator(){
        return Forums.Forums.canModerate( Template.currentData().forum, Meteor.userId());
    },

    // let the owner edit his own post
    parmsPostEdit( it ){
        const allowed = Template.currentData().writer.get();
        return {
            mode: 'EDIT',
            allowed: Template.currentData().writer,
            object: it
        };
    },

    // let a user reply to a post
    parmsPostReply( it ){
        if( !it.reactiveReply ){
            it.reactiveReply = new ReactiveVar( '' );
        }
        const allowed = Template.currentData().writer.get();
        if( false ){
            console.log( 'parmsPostEdit allowed', allowed );
        }
        return {
            mode: 'REPLY',
            allowed: Template.currentData().writer,
            object: it,
            autostart: false
        };
    },

    postOwner( it ){
        const rv = it ? it.rvAuthor.get() : null;
        return Forums.fn.i18n( 'threads.posted_by', rv ? rv.label : '' );
    },

    posted( it ){
        return Forums.fn.i18n( 'threads.posted_on', i18n.dateTime( it.createdAt ));
    }
});

Template.frs_post_tr.events({
    // let the user delete his own post
    'click .frs-delete-btn'( event, instance ){
        const post = Template.currentData().post;
        const postId = post._id;
        pwixBootbox.confirm(
            Forums.fn.i18n( 'threads.delete_confirm' ), function( ret ){
                if( ret ){
                    const target = instance.$( 'tr.frs-post-tr' ).closest( '.frs-body' );
                    Meteor.call( 'frsPosts.delete', post, ( err, res ) => {
                        if( err ){
                            console.error( err );
                            tlTolert.error( Forums.fn.i18n( 'threads.delete_error' ));
                        } else {
                            tlTolert.success( Forums.fn.i18n( 'threads.delete_success' ));
                            target.trigger( 'frs-post-tr-deleted', { post: post });
                        }
                    });
                }
            }
        );
        return false;
    },

    // let the user edit his own post
    'click .frs-edit-btn'( event, instance ){
        const postId = Template.currentData().post._id;
        instance.FRS.editToggle( postId );
        return false;
    },

    // moderate (delete) the post
    'click .frs-moderate-btn'( event, instance ){
        const post = Template.currentData().post;
        const forum = Template.currentData().forum;
        pwixModal.run({
            mdBody: 'frs_post_moderate',
            mdClasses: 'modal-lg',
            mdTitle: Forums.fn.i18n( 'moderate.modal_title' ),
            mdButtons: [ MD_BUTTON_CANCEL, MD_BUTTON_OK ],
            forum: forum,
            post: post
        });
        return false;
    },

    // when the frs-post-edit component closes itself
    'frs-post-edit-closed .frs-post-tr'( event, instance, data ){
        if( data.reason !== 'REQCALLER' ){
            const postId = Template.currentData().post._id;
            instance.FRS.jqEditButton( postId ).removeClass( 'active' ).prop( 'aria-pressed', false );
            instance.FRS.activatedEdit = null;
        }
        return false;
    },

    // when the user clicks on a moderated message, then ask for toggling
    //  silently ignore if not a moderated message
    'click .frs-edit-td'( event, instance ){
        if( instance.FRS.moderated()){
            instance.$( 'tr.frs-post-tr' ).trigger( 'frs-post-tr-close', { post: Template.currentData().post });
        }
        return false;
    },

    // activate / unactivate Reply toggle button
    //  note that the Bootstrap framework has already worked here (button's state has already changed)
    'click .frs-reply-btn'( event, instance ){
        const postId = Template.currentData().post._id;
        instance.FRS.replyToggle( postId );
        return false;
    },

    // when the 'reply' frs-post-edit component closes itself
    'frs-post-edit-closed .frs-reply-tr'( event, instance, data ){
        if( data.reason !== 'REQCALLER' ){
            const postId = Template.currentData().post._id;
            instance.FRS.jqReplyButton( postId ).removeClass( 'active' ).prop( 'aria-pressed', false );
        }
    }
});
