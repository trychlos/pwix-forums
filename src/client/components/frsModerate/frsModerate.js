/*
 * pwix:forums/src/cient/components/frsModerate/frsModerate.js
 */

import dotdotdot from 'dotdotdot';
import printf from 'printf';

import { AccountsTools } from 'meteor/pwix:accounts-tools';
import { Modal } from 'meteor/pwix:modal';
import { pwixI18n } from 'meteor/pwix:i18n';
import { ReactiveDict } from 'meteor/reactive-dict';
import { ReactiveVar } from 'meteor/reactive-var';
import { Tolert } from 'meteor/pwix:tolert';

import '../frs_post_moderate/frs_post_moderate.js';

import './frsModerate.html';
import './frsModerate.less';

const ST_START = 'ST_START';                            // start of the work
                                                        //  wants to subscribe to all moderable forums
const ST_FORUMS_QUERY = 'ST_FORUMS_QUERY';              // have a dynamic query on forums
const ST_FORUMS_SUBSCRIBED = 'ST_FORUMS_SUBSCRIBED';    // have subscribed to moderable forums
                                                        //  waits for the subscription be ready
const ST_FORUMS_FETCHED = 'ST_FORUMS_FETCHED';          // moderables forums are fetched
                                                        //  time to subscribe to posts depending of user display options
const ST_POSTS_QUERY = 'ST_POSTS_QUERY';                // have a dynamic query on posts
const ST_POSTS_SUBSCRIBED = 'ST_POSTS_SUBSCRIBED';      // have subscribed to moderable posts
                                                        //  waits for the subscription be ready
const ST_POSTS_FETCHED = 'ST_POSTS_FETCHED';            // moderable posts to be displayed depending of user options are fetched
                                                        //  wants recompute now the displayable forums
const ST_FORUMS_RECOMPUTED = 'ST_FORUMS_RECOMPUTED';    // displayable forums have been recomputed
                                                        //  ready to go

Template.frsModerate.onCreated( function(){
    const self = this;

    self.FRS = {
        dpSelector: '.frsModerate input.frs-date',
        ellipSelector: '.frsModerate .frs-post .frs-content.ellipsis-text',
        state: new ReactiveVar( null ),
        forums: {
            handle: null,                           // a subscription to all forums moderable by the current user
            query: new ReactiveVar( null ),         // the dynamically-built query
            moderables: new ReactiveVar( [] ),      // the fetched list of all moderable forums
            displayable: new ReactiveVar( [] )      // the displayable list
        },
        posts: {
            handle: null,                           // a subscription to all moderable posts (for all forums by the user)
            query: new ReactiveVar( null ),         // the dynamically-built query
            ready: new ReactiveVar( false )         // ready after first postEnd()
        },
        opts: {
            since: new ReactiveVar( new Date()),     // Date object
            checkboxes: [
                'moderationShowEmpty',
                'moderationShowValidated',
                'moderationShowModerated'
            ]
        },
        postsPerForum: new ReactiveDict(),           // posts per forum: forum.id -> array of posts

        // ellipsize the content when DOM is ready
        ellipsizeContent( post ){
            const selector = '.frsModerate .ellipsis-wrapper#post-'+post._id+'-content .ellipsis-text';
            //console.log( 'ellipsizing', selector );
            // called for each div.ellipSelector, event if too small to be truncated
            //  - isTruncated: true|false
            //  - originalContent: the jQuery object with oroginal content
            //  - this: the DOM element with current content
            const dddCallback = function( isTruncated, originalContent ){
                if( !isTruncated ){
                    $( this ).closest( '.ellipsis-wrapper' ).find( 'a.ellipsis-more, a.ellipsis-less' ).hide();
                } else {
                    $( this ).closest( '.ellipsis-wrapper' ).find( 'a.ellipsis-less' ).hide();
                }
            }
            // height=50 -> gives two display lines (2*24)
            // height=72 -> gives three displayed lines (3*24)
            const maxHeight = 75;
            const opts = {
                height: maxHeight,
                ellipsis: '',
                callback: dddCallback
            };
            self.FRS.waitForElements( selector )
                .then(( nodes ) => {
                    //console.log( 'initializing dotdotdot', nodes );
                    self.$( selector ).dotdotdot( opts );
                    self.$( selector ).closest( '.ellipsis-wrapper' ).on( 'click', 'a', function(){
                        //console.log( this );  // 'this' is the 'a' DOM element
                        const wrapper = $( this ).closest( '.ellipsis-wrapper' );
                        if( $( this ).hasClass( 'ellipsis-more' )){
                            wrapper.find( 'a.ellipsis-more' ).hide();
                            wrapper.find( 'a.ellipsis-less' ).show();
                            wrapper.find( '.ellipsis-text' ).dotdotdot( 'restore' );
                        }
                        else {
                            wrapper.find( 'a.ellipsis-more' ).show();
                            wrapper.find( 'a.ellipsis-less' ).hide();
                            wrapper.find( '.ellipsis-text' ).dotdotdot( opts );
                        }
                    });
                });
        },

        // returns the forum
        forum( forumId ){
            let found = null;
            self.FRS.forums.moderables.get().every(( f ) => {
                if( f._id === forumId ){
                    found = f;
                    return false;
                }
                return true;
            });
            return found;
        },

        // informations about the moderation
        popoverInfo( f, p ){
            let content = '';
            if( p.deletedBecause ){
                pwixI18n.group( I18N, 'moderate.options' ).every(( it ) => {
                    if( it.id === p.deletedBecause ){
                        label = it.label;
                        return false;
                    }
                    return true;
                });
                content = pwixI18n.label( I18N, 'moderate.reason', label );
            }
            content += '<br />';
            if( p.deletedText ){
                content += pwixI18n.label( I18N, 'moderate.supplement_text', p.deletedText );
            } else {
                content += pwixI18n.label( I18N, 'moderate.no_supplement', label );
            }
            return content;
        },

        // return the post
        post( forumId, postId ){
            const posts = self.FRS.postsPerForum.get( forumId ) || [];
            let post = null;
            posts.every(( p ) => {
                if( p._id === postId ){
                    post = p;
                    return false;
                }
                return true;
            });
            return post;
        },

        postsQuery(){
            self.FRS.posts.query.set( Forums.Posts.queryModerables({
                forums: self.FRS.forums.moderables.get(),
                since: self.FRS.opts.since.get(),
                showValidated: self.FRS.opts.moderationShowValidated.get(),
                showModerated: self.FRS.opts.moderationShowModerated.get()
            }));
            self.FRS.state.set( ST_POSTS_QUERY );
        },

        postsSubscribe(){
            self.autorun(() => {
                if( self.FRS.posts.handle ){
                    self.FRS.posts.handle.stop();
                }
                self.FRS.posts.handle = self.subscribe( 'frsPosts.moderablesByQuery', self.FRS.posts.query.get());
                self.FRS.state.set( ST_POSTS_SUBSCRIBED );
            });
        },

        // as a work-around to todo #54, unset the provided list of fields in our ReactiveDict
        postsUpdate( forumId, postId, fields ){
            let posts = self.FRS.postsPerForum.get( forumId );
            posts.every(( p ) => {
                if( p._id === postId ){
                    Object.keys( fields ).every(( f ) => {
                        delete p[f];
                        return true;
                    });
                    self.FRS.postsPerForum.set( forumId, [...posts] );
                    console.log( posts );
                    return false;
                }
                return true;
            });
        },

        // set the Date date if not empty and different
        setSinceDate( date ){
            if( date && date.getTime() !== self.FRS.opts.since.get().getTime()){
                self.FRS.opts.since.set( date );
                //const dateStr = new Date( date.getTime() - ( date.getTimezoneOffset() * 60000 )).toISOString().split( 'T' )[0];
                const dateStr = date.toISOString().split( 'T' )[0];
                //console.log( 'setSinceDate', date, dateStr );
                Forums.client.fn.userDataWrite( 'moderationSince', dateStr );
            }
        },

        // https://stackoverflow.com/questions/5525071/how-to-wait-until-an-element-exists
        //  only initialize datepicker when the DOM element is available
        waitForElements( selector, count=1 ){
            return new Promise(( resolve ) => {
                const nodeList = document.querySelectorAll( selector );
                if( nodeList.length === count ){
                    return resolve( document.querySelectorAll( selector ));
                }
                const observer = new MutationObserver(( mutations ) => {
                    const nodeList = document.querySelectorAll( selector );
                    if( nodeList.length === count ){
                        resolve( document.querySelectorAll( selector ));
                        observer.disconnect();
                    }
                });
                observer.observe( document.body, {
                    childList: true,
                    subtree: true
                });
            });
        }
    };

    // initialize date with yesterday unless a date is found in user profile
    const str = Forums.client.fn.userDataRead( 'moderationSince' );
    let initialDate = new Date();
    if( str ){
        initialDate.setTime( Date.parse( str ));
    } else {
        const today = new Date();
        initialDate.setTime( today.getTime()-( 24*3600000 ));
    }
    self.FRS.setSinceDate( initialDate );

    // creates and initialize ReactiveVar's from user data for checkboxes settings
    self.FRS.opts.checkboxes.every(( data ) => {
        self.FRS.opts[data] = new ReactiveVar( Forums.client.fn.userDataRead( data ) === 'true' );
        return true;
    });

    // initialize the start of the work
    self.FRS.state.set( ST_START );

    // trace the dynamic status
    self.autorun(() => {
        console.log( self.FRS.state.get());
    });

    // build the moderable forums query
    self.autorun(() => {
        self.FRS.forums.query.set( Forums.Forums.queryModerables( Meteor.userId()));
        self.FRS.state.set( ST_FORUMS_QUERY );
    });

    // subscribe to list of moderable forums
    self.autorun(() => {
        if( !self.FRS.forums.handle ){
            self.FRS.forums.handle = self.subscribe( 'frsForums.byQuery', self.FRS.forums.query.get());
            self.FRS.state.set( ST_FORUMS_SUBSCRIBED );
        }
    });

    // get the moderable forums when ready
    //  *all* moderables forums are returned, whatever be the user display options
    self.autorun(() => {
        if( self.FRS.forums.handle.ready()){
            const query = self.FRS.forums.query.get();
            self.FRS.forums.moderables.set( Forums.client.collections.Forums.find( query.selector, query.options ).fetch());
            self.FRS.state.set( ST_FORUMS_FETCHED );
        }
    });

    // build the moderable posts query
    self.autorun(() => {
        self.FRS.postsQuery();
    });

    // subscribe to list of all posts from the moderable forums since the given date regarding the display options
    //  as part of an autorun inside of the function
    self.FRS.postsSubscribe();

    // posts subscription is ready: we are so able to anticipate the total count of posts
    //  also:
    //  - count posts per forum to build displayable list
    //  - set thread breaks
    //  - set first thread of the forum
    //  - set first post of the thread 
    self.autorun(() => {
        if( self.FRS.posts.handle.ready()){
            self.FRS.postsPerForum.clear();
            let previousThread = null;
            let previousForum = null;
            let posts = [];
            //console.log( 'fetching published posts' );
            const query = self.FRS.posts.query.get();
            const allPosts = Forums.client.collections.Posts.find( query.selector, query.options ).fetch();
            //console.log( allPosts );
            allPosts.every(( p ) => {
                p.dyn = {
                    threadDifferent: ( p.threadId !== previousThread ),
                    firstThread: ( previousForum !== p.forum )
                };
                p.dyn.firstPost = p.dyn.threadDifferent;
                if( p.dyn.firstThread && previousForum ){
                    self.FRS.postsPerForum.set( previousForum, [ ...posts ]);
                    posts = [];
                }
                previousForum = p.forum;
                previousThread = p.threadId;
                //console.log( p );
                posts.push( p );
                return true;
            });
            if( previousForum ){
                self.FRS.postsPerForum.set( previousForum, [ ...posts ]);
            }
            console.log( 'expected posts', allPosts.length );
            console.log( 'postsPerForum', self.FRS.postsPerForum.all());
            self.FRS.posts.ready.set( true );
            self.FRS.state.set( ST_POSTS_FETCHED );
        }
    });

    // after posts have been received, we are able to compute a list of the displayable forums
    self.autorun(() => {
        if( self.FRS.posts.ready.get()){
            //console.log( 'recompute displayable forums' );
            let displayable = [];
            let first = true;
            self.FRS.forums.moderables.get().every(( f ) => {
                const posts = self.FRS.postsPerForum.get( f._id );
                const count = posts ? posts.length : 0;
                if( self.FRS.opts.moderationShowEmpty.get() || count ){
                    f.firstForum = first;
                    f.postsCount = count;
                    displayable.push( f );
                    first = false;
                }
                return true;
            });
            self.FRS.forums.displayable.set( displayable );
            self.FRS.state.set( ST_FORUMS_RECOMPUTED );
        }
    });
});

Template.frsModerate.onRendered( function(){
    const self = this;
    //console.log( 'onRendered', self );

    // initialize the datepicker when available
    //  https://api.jqueryui.com/datepicker/
    self.FRS.waitForElements( self.FRS.dpSelector )
        .then(( nodes ) => {
            //console.log( 'initializing datepicker', nodes );
            const toUTC = function( str ){
                const local = $.datepicker.parseDate( 'dd/mm/yy', str );
                const utc = new Date( Date.UTC( local.getFullYear(), local.getMonth(), local.getDate(), 0, 0, 0 ));
                //console.log( 'local', local, 'utc', utc );
                return utc;
            };
            const res = self.$( nodes[0] ).datepicker({
                format: 'dd/mm/yyyy',
                todayHighlight: true,
                onClose: function( date, dp ){
                    // dp is the datepicker instance - not a JQuery object
                    // date is the date as text 'jj/mm/aaaa' - may be empty according to the doc
                    //console.log( date );
                    self.FRS.setSinceDate( toUTC( date ));
                },
                // called on each change, either by clicking on the widget, or by manually editing the input element
                onUpdateDatepicker: function( dp ){
                    //console.log( dp );    // the datepicker instance
                    //console.log( this );  // the input DOM element
                    //console.log( dp.lastVal );
                    self.FRS.setSinceDate( toUTC( dp.lastVal ));
                }
            });
            //console.log( 'datepicker', res );
        });

    // setup the checkboxes settings depending of the corresponding ReactiveVar
    self.autorun(() => {
        self.FRS.opts.checkboxes.every(( data ) => {
            self.$( 'input[type="checkbox"][data-frs-field="'+data+'"]' ).prop( 'checked', self.FRS.opts[data].get());
            return true;
        });
    });
});

Template.frsModerate.helpers({

    // display the moderation badge
    badgeModeration( f ){
        return Forums.client.htmlModerationStrategyBadge( f );
    },

    // whether this is a new thread (created after the date)
    badgeNew( p ){
        const threadDate = new Date( p.pub.orig.createdAt );
        return threadDate > Template.instance().FRS.opts.since.get() ? Forums.client.htmlNewThreadBadge() : '';
    },

    // display a private badge
    badgePrivate( f ){
        return Forums.client.htmlPrivateBadge( f, { publicIsTransparent: false });
    },

    // do we have something to do with the current forum ?
    forumCatch( f ){
        //console.log( f );
    },

    // if we are the first forum of the list ?
    forumFirstClass( f ){
        //console.log( 'forumFirst', f.firstForum );
        return f.firstForum ? 'frs-first' : '';
    },

    // returns the count of displayable forums
    forumsCount(){
        return Template.instance().FRS.forums.displayable.get().length;
    },

    // list the forums the user is allowed to moderate
    forumsList(){
        //console.log( 'forumsList' );
        return Template.instance().FRS.forums.displayable.get();
    },

    // whether we have a moderate button ?
    //  yes if message not yet moderated nor validated in a forum moderated a priori
    //  and not self-deleted (these posts are read-only when displayed)
    haveModerate( f, p ){
        const selfDeleted = ( p.deletedAt && !p.deletedBecause );
        const validated = ( f.moderation === Forums.C.Moderation.APRIORI && p.validatedAt );
        const moderated = ( p.deletedAt && p.deletedBecause );
        return !selfDeleted && !validated && !moderated;
    },

    // whether we have a validate button ?
    //  yes if message not yet validated in a forum moderated a priori, and not already moderated
    //  and not self-deleted (these posts are read-only when displayed)
    haveValidate( f, p ){
        const selfDeleted = ( p.deletedAt && !p.deletedBecause );
        const waitValidation = ( f.moderation === Forums.C.Moderation.APRIORI && !p.validatedAt );
        const moderated = ( p.deletedAt && p.deletedBecause );
        return !selfDeleted && waitValidation && !moderated;
    },

    // whether we have an unmoderate button ?
    //  yes if post has been moderated
    haveUnmoderate( f, p ){
        const selfDeleted = ( p.deletedAt && !p.deletedBecause );
        const moderated = ( p.deletedAt && p.deletedBecause );
        return !selfDeleted && moderated;
    },

    // whether we have an unvalidate button ?
    //  yes if post have been validated
    haveUnvalidate( f, p ){
        const selfDeleted = ( p.deletedAt && !p.deletedBecause );
        const validated = ( f.moderation === Forums.C.Moderation.APRIORI && p.validatedAt );
        return !selfDeleted && validated;
    },

    // i18n
    i18n( opts ){
        return Forums.fn.i18n( 'moderate.'+opts.hash.label );
    },

    // popover initialization
    popoverInit( f, p ){
        const FRS = Template.instance().FRS;
        FRS.waitForElements( 'a#popover-'+p._id ).then(( nodes ) => {
            $( nodes[0] ).popover({
                html: true,
                content: FRS.popoverInfo( f, p )
            });
        });
    },

    // the posts has been moderated by who and when ?
    moderatedBy( p ){
        return Forums.fn.i18n( 'moderate.moderated_by', p.dyn.rvModerator ? p.dyn.rvModerator.get().label : '', pwixI18n.dateTime( p.deletedAt ));
    },

    // no moderable forum
    noForum(){
        return Forums.fn.i18n( 'moderate.noforum' );
    },

    // no new post
    noNewPost(){
        return Forums.fn.i18n( 'moderate.nonewpost', pwixI18n.date( Template.instance().FRS.opts.since.get()));
    },

    // the author of the post
    postAuthor( p ){
        return Forums.fn.i18n( 'moderate.author', p.dyn.rvAuthorEmail.get().label, p.dyn.rvAuthorUsername.get().label );
    },

    // catch each rendered post
    //  install a ReactiveVar which will hold the needed labels
    postCatch( f, p ){
        //console.log( 'postCatch' );
        p.dyn.rvAuthorEmail = AccountsTools.preferredLabelRV( p.owner, AccountsTools.C.PreferredLabel.EMAIL_ADDRESS );
        p.dyn.rvAuthorUsername = AccountsTools.preferredLabelRV( p.owner, AccountsTools.C.PreferredLabel.USERNAME );
        p.dyn.rvValidator = p.validatedBy ? AccountsTools.preferredLabelRV( p.validatedBy, AccountsTools.C.PreferredLabel.USERNAME ) : null;
        p.dyn.rvModerator = p.deletedBy && p.deletedBecause ? AccountsTools.preferredLabelRV( p.deletedBy, AccountsTools.C.PreferredLabel.USERNAME ) : null;
        p.dyn.rvStats = new ReactiveVar( null );
        Meteor.callPromise( 'frsPosts.userStats', p.owner ).then(( res ) => { p.dyn.rvStats.set( res ); });
    },

    // when the post has it been created ?
    postDate( p ){
        return Forums.fn.i18n( 'moderate.moderate_date', pwixI18n.dateTime( p.createdAt ));
    },

    // end of a post
    postEnd( p ){
        Template.instance().FRS.ellipsizeContent( p );
    },

    // add a 'frs-first' class to first post to be moderable in the thread
    //  first post of each thread set the title in the object
    postFirstClass( f, p ){
        //console.log( 'postFirst', p.firstPost );
        return p.dyn.firstPost ? 'frs-first' : '';
    },

    // the moderation score of the author
    postScore( p ){
        const stats = p.dyn.rvStats.get();
        const percent = stats ? (( parseInt(( stats.moderated * 100 / stats.posts ) * 10 )) / 10 )+'%' : '';
        return Forums.fn.i18n( 'moderate.owner_score', stats ? stats.posts : 0, stats ? stats.moderated : 0, percent );
    },

    // list the posts displayed in this forum
    postsList( f ){
        //console.log( 'postsList' );
        return Template.instance().FRS.postsPerForum.get( f._id ) || [];
    },

    // current since date to initialize the input element
    since(){
        return $.datepicker.formatDate( 'dd/mm/yy', Template.instance().FRS.opts.since.get());
    },

    // if this post belongs to another thread (relatively to this forum) ?
    threadDifferent( f, p ){
        //console.log( 'threadDifferent', p.threadDifferent );
        return p.dyn.threadDifferent;
    },

    // if this thread the first in the forum ?
    threadFirstClass( f, p ){
        return p.dyn.firstThread ? 'frs-first' : '';
    },

    // thread title
    threadTitle( p ){
        return Forums.fn.i18n( 'moderate.thread_title', p.pub.orig.title );
    },

    // the posts has been validated by who and when ?
    validatedBy( p ){
        return Forums.fn.i18n( 'moderate.validated_by', p.dyn.rvValidator ? p.dyn.rvValidator.get().label : '', pwixI18n.dateTime( p.validatedAt ));
    }
});

Template.frsModerate.events({
    // open the datepicker when clicking the icon
    'click .calendar-icon'( event, instance ){
        const selector = instance.FRS.dpSelector; 
        if( instance.$( selector ).datepicker( 'widget' ).is( ':visible' )){
            instance.$( selector ).datepicker( 'hide' );
        } else {
            instance.$( selector ).datepicker( 'show' );
        }
        return false;
    },

    // manage settings change
    'change input[type="checkbox"]'( event, instance ){
        const checked = instance.$( event.currentTarget ).prop( 'checked' );
        const field = $( event.currentTarget ).data( 'frs-field' );
        instance.FRS.opts[field].set( checked );
        Forums.client.fn.userDataWrite( field, checked ? 'true' : 'false' );
    },

    // moderate the message
    'click .frs-moderate-btn'( event, instance ){
        const forumId = instance.$( event.currentTarget ).data( 'frs-forum' );
        const postId = instance.$( event.currentTarget ).data( 'frs-post' );
        //console.log( 'postId', postId, 'forumId', forumId, 'post', post );
        Modal.run({
            mdBody: 'frs_post_moderate',
            mdClasses: 'modal-lg',
            mdTitle: Forums.fn.i18n( 'moderate.modal_title' ),
            mdButtons: [ Modal.C.Button.CANCEL, Modal.C.Button.OK ],
            forum: instance.FRS.forum( forumId ),
            post: instance.FRS.post( forumId, postId ),
            target: instance.$( '.frsModerate' )
        });
    },

    // unmoderate the message
    'click .frs-unmoderate-btn'( event, instance ){
        const forumId = instance.$( event.currentTarget ).data( 'frs-forum' );
        const postId = instance.$( event.currentTarget ).data( 'frs-post' );
        //console.log( 'postId', postId );
        Meteor.call( 'frsPosts.unmoderate', instance.FRS.post( forumId, postId ), ( err, res ) => {
            if( err ){
                Tolert.error({ type:err.error, message:err.reason });
            } else {
                Tolert.success( Forums.fn.i18n( 'moderate.unmoderated' ));
            }
            // work-around to todo #54: stop and relaunch the subscription
            instance.FRS.postsSubscribe();
            // last user action
            const today = new Date();
            Forums.client.fn.userDataWrite( 'moderationLastDate', today.toISOString().substring( 0,10 ));
        });
    },

    // unvalidate the message
    //  this is not same than moderated - just post waits for an approbation
    'click .frs-unvalidate-btn'( event, instance ){
        const postId = instance.$( event.currentTarget ).data( 'frs-post' );
        //console.log( 'postId', postId );
        Meteor.call( 'frsPosts.unvalidate', postId, ( err, res ) => {
            if( err ){
                Tolert.error({ type:err.error, message:err.reason });
            } else {
                Tolert.success( Forums.fn.i18n( 'moderate.unvalidated' ));
            }
            // work-around to todo #54: stop and relaunch the subscription
            instance.FRS.postsSubscribe();
            // last user action
            const today = new Date();
            Forums.client.fn.userDataWrite( 'moderationLastDate', today.toISOString().substring( 0,10 ));
        });
    },

    // validate the post
    'click .frs-validate-btn'( event, instance ){
        const postId = instance.$( event.currentTarget ).data( 'frs-post' );
        //console.log( 'postId', postId );
        Meteor.call( 'frsPosts.validate', postId, ( err, res ) => {
            if( err ){
                Tolert.error({ type:err.error, message:err.reason });
            } else {
                Tolert.success( Forums.fn.i18n( 'moderate.validated' ));
            }
            // last user action
            const today = new Date();
            Forums.client.fn.userDataWrite( 'moderationLastDate', today.toISOString().substring( 0,10 ));
        });
    },

    // a post has been moderated
    'frs-post-moderate-moderated .frsModerate'( event, instance, data ){
        console.log( event, data );
        // last user action
        const today = new Date();
        Forums.client.fn.userDataWrite( 'moderationLastDate', today.toISOString().substring( 0,10 ));
    }
});
