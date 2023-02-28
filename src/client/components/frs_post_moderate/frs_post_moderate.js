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

import { pwiForums } from '../../js/index.js';

import '../../stylesheets/frs_forums.less';

import './frs_post_moderate.html';
import './frs_post_moderate.less';

Template.frs_post_moderate.onCreated( function(){
    const self = this;

    // get the stats and other dynamic vars
    //  attaching them to 'post'
    self.autorun(() => {
        const post = Template.currentData().post;
        post.rvStats = new ReactiveVar( null );
        post.rvAuthorEmail = pwiForums.fn.labelById( post.owner, AC_EMAIL_ADDRESS );
        post.rvAuthorUsername = pwiForums.fn.labelById( post.owner, AC_USERNAME );
        if( post ){
            Meteor.call( 'frsPosts.userStats', post.owner, ( err, res ) => {
                if( err ){
                    console.error( err );
                } else {
                    //console.log( res );
                    post.rvStats.set( res )
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
        const stats = post ? post.rvStats.get() : null;
        const percent = stats ? (( parseInt(( stats.moderated * 100 / stats.posts ) * 10 )) / 10 )+'%' : '';
        return pwiForums.fn.i18n( 'moderate.owner_posted', stats ? stats.posts : 0, stats ? stats.moderated : 0, percent );
    },

    // email of user
    email(){
        const post = this.post;
        //return post ? post.dynOwnerEmail.get().label : '';
        return post ? post.rvAuthorEmail.get().label : '';
    },

    // label translation
    i18n( opts ){
        return pwiForums.fn.i18n( 'moderate.'+opts.hash.label );
    },

    // whether we can or must inform the author ?
    informAuthor(){
        return this.forum.inform !== FRS_INFORM_NONE;
    },

    // whether the moderator can choose to inform the author or not ?
    //  disable the checkbox if information is mandatory
    informEnabled(){
        this.forum.inform = this.forum.inform || defaults.common.forums.inform;
        return this.forum.inform === FRS_INFORM_MUST ? 'disabled': '';
    },

    // display the information option as a long (HTML) text
    informText(){
        const options = i18n.group( FRSI18N, 'forum_edit.informs_long' );
        const id = this.forum && this.forum.inform ? this.forum.inform : defaults.common.forums.inform;
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
        return i18n.group( FRSI18N, 'moderate.options' );
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
                post.deletedBecause = instance.$( '.frs-reason' ).find( ':selected' ).val() || 'FRS_REASON_NONE';
                post.deletedText = instance.$( '.frs-supplement' ).val().replace( '<', '' ).trim();
                Meteor.call( 'frsPosts.upsert', post, ( err, res ) => {
                    if( err ){
                        console.error( err );
                        tlTolert.error( 'message_error' );
                    } else {
                        //console.log( res );
                        tlTolert.success( pwiForums.fn.i18n( 'moderate.message_success' ));
                        pwixModal.close();
                        let result = {
                            inform: instance.$( 'input.frs-inform' ).prop( 'checked' ),
                            stats: post.rvStats.get(),
                            post: post
                        };
                        if( target ){
                            target.trigger( 'frs-post-moderate-moderated', result );
                        }
                        Meteor.call( 'frsPosts.postModerate', result, ( err, res ) => {
                            if( err ){
                                console.error( err );
                            }
                        });
                    }
                });
            }
        }
    }
});
