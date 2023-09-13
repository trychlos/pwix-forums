/*
 * /src/client/components/frs_post_moderate/frs_post_moderate.js
 *
 * About to "moderate" a post (.i.e. to mark it deleted with a reason).
 * 
 * Parms:
 *  - forum: the originating Forum
 *  - post: the Post to be 'moderated'
 *  - target: the jQuery target of the message sent when the moderation is confirmed
 * 
 * Actions:
 *  - send a 'frs-post-moderate-moderated' message with a data object:
 *      - post: the moderated post
 *      - inform: whether to inform the user
 *      - stats: user stats
 *      - reason: reason
 * 
 * Note: this dialog doesn't take care of informing the user, but send the ad-hoc message when the moderator
 *  confirms the dialog.
 */

import { pwixI18n as i18n } from 'meteor/pwix:i18n';

import { Forums } from '../../js/index.js';

import '../../stylesheets/frs_forums.less';

import './frs_post_moderate.html';
import './frs_post_moderate.less';

Template.frs_post_moderate.onCreated( function(){
    const self = this;

    // get the stats and other dynamic vars
    //  attaching them to 'post'
    self.autorun(() => {
        const post = Template.currentData().post;
        post.dyn = {
            rvStats: new ReactiveVar( null ),
            rvAuthorEmail: AccountsTools.preferredLabel( post.owner, AccountsTools.C.PreferredLabel.EMAIL_ADDRESS ),
            rvAuthorUsername: AccountsTools.preferredLabel( post.owner, AccountsTools.C.PreferredLabel.USERNAME )
        };
        if( post ){
            Meteor.call( 'frsPosts.userStats', post.owner, ( err, res ) => {
                if( err ){
                    console.error( err );
                } else {
                    //console.log( res );
                    post.dyn.rvStats.set( res )
                }
            });
        }
    });
});

Template.frs_post_moderate.onRendered( function(){
    const self = this;
    pwixModal.setTarget( self.$( '.frs-post-moderate' ));
});

Template.frs_post_moderate.helpers({
    // display the post content
    content(){
        return this.post ? this.post.content : '';
    },

    // the count of owner's message which have already been deleted
    deletedCount(){
        const post = this.post;
        const stats = post ? post.dyn.rvStats.get() : null;
        const percent = stats ? (( parseInt(( stats.moderated * 100 / stats.posts ) * 10 )) / 10 )+'%' : '';
        return Forums.fn.i18n( 'moderate.owner_posted', stats ? stats.posts : 0, stats ? stats.moderated : 0, percent );
    },

    // email of user
    email(){
        const post = this.post;
        //return post ? post.dynOwnerEmail.get().label : '';
        return post ? post.dyn.rvAuthorEmail.get().label : '';
    },

    // label translation
    i18n( opts ){
        return Forums.fn.i18n( 'moderate.'+opts.hash.label );
    },

    // whether we can or must inform the author ?
    informAuthor(){
        return this.forum.inform !== Forums.C.Information.NONE;
    },

    // whether the moderator can choose to inform the author or not ?
    //  disable the checkbox if information is mandatory
    informEnabled(){
        this.forum.inform = this.forum.inform || Forums._defaults.forums.inform;
        return this.forum.inform === Forums.C.Information.MUST ? 'disabled': '';
    },

    // display the information option as a long (HTML) text
    informText(){
        const options = i18n.group( I18N, 'forum_edit.informs_long' );
        const id = this.forum && this.forum.inform ? this.forum.inform : Forums._defaults.forums.inform;
        let label = '';
        options.every(( it ) => {
            if( it.id === id ){
                label = it.label;
                return false;
            }
            return true;
        });
        return label;
    },

    // returns the list of predefined reasons
    reasons(){
        return i18n.group( I18N, 'moderate.options' );
    },

    // preselect the 'gtu' 'option
    selected( it ){
        return it.id === 'gtu' ? 'selected' : '';
    }
});

Template.frs_post_moderate.events({

    // confirm the operation
    'md-click .frs-post-moderate'( event, instance, data ){
        if( data.button === MD_BUTTON_OK ){
            let post = Template.currentData().post;
            const target = Template.currentData().target;
            if( post ){
                post.deletedAt = new Date();
                post.deletedBy = Meteor.userId();
                post.deletedBecause = instance.$( '.frs-reason' ).find( ':selected' ).val() || 'Forums.C.Reason.NONE';
                post.deletedText = instance.$( '.frs-supplement' ).val().replace( '<', '' ).trim() || '';
                let options = {
                    inform: instance.$( 'input.frs-inform' ).prop( 'checked' ),
                    stats: post.dyn.rvStats.get()
                };
                Meteor.call( 'frsPosts.moderate', post, options, ( err, res ) => {
                    if( err ){
                        console.error( err );
                        tlTolert.error( 'message_error' );
                    } else {
                        //console.log( res );
                        tlTolert.success( Forums.fn.i18n( 'moderate.message_success' ));
                        pwixModal.close();
                        if( target ){
                            target.trigger( 'frs-post-moderate-moderated', { post, ...options });
                        }
                    }
                });
            }
        }
    }
});
