/*
 * /src/client/components/frs_post_moderate/frs_post_moderate.js
 *
 * About to "moderate" a post (.i.e. to mark it deleted with a reason).
 * 
 * Parms:
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
    // the post id
    id(){
        const post = this.post;
        return post ? post._id : '';
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
            if( post ){
                post.deletedAt = new Date();
                post.deletedBy = Meteor.userId();
                post.deletedBecause = instance.$( '.frs-reason' ).find( ':selected' ).val();
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
                            reason: instance.$( '.frs-reason' ).find( ':selected' ).val(),
                            stats: post.rvStats.get(),
                            post: post
                        };
                        const target = Template.currentData().target;
                        if( target ){
                            instance.data.target.trigger( 'frs-post-moderate-moderated', result );
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
