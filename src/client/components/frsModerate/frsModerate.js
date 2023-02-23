/*
 * pwix:forums/src/cient/components/frsModerate/frsModerate.js
 */

import { ReactiveDict } from 'meteor/reactive-dict';
import { ReactiveVar } from 'meteor/reactive-var';
import { pwixI18n } from 'meteor/pwix:i18n';
import { tlTolert } from 'meteor/pwix:tolert';

import dotdotdot from 'dotdotdot';

import './frsModerate.html';
import './frsModerate.less';

Template.frsModerate.onCreated( function(){
    const self = this;

    self.FRS = {
        dpSelector: '.frsModerate input.frs-date',
        ellipSelector: '.frsModerate .frs-post .frs-content.ellipsis-text',
        date: new ReactiveVar( new Date()),         // Date object
        forums: {
            handle: null,                           // a subscription to all forums moderable by the current user
            list: new ReactiveVar( [] ),            // the fetched list of all moderable forums
            displayable: new ReactiveVar( [] ),     // the displayable list
            ready: new ReactiveVar( false ),        // ready after fetch
            posts: new ReactiveDict()               // posts per forum: forum.id -> array of posts
        },
        posts: {
            handle: new ReactiveVar( null ),        // a global subscription (for all forums by the user)
            expected: 0,                            // total expected posts 
            displayed: 0,                           // total displayed posts
            ready: new ReactiveVar( false )         // ready after first postEnd()
        },
        checkboxes: [
            'moderationShowEmpty',
            'moderationShowValidated',
            'moderationShowModerated'
        ],

        // clear the fields added by the helpers each time the postsList is re-run
        clearForums(){
            let list = self.FRS.forums.list.get();
            list.every(( f ) => {
                f.previousThread = null;
                f.threadsList = null;
                return true;
            });
            self.FRS.forums.list.set( list );
            self.FRS.posts.expected = 0;
            self.FRS.posts.displayed = 0;
        },

        // set the Date date if not empty and different
        setDate( date ){
            if( date && date.getTime() !== self.FRS.date.get().getTime()){
                self.FRS.date.set( date );
                const dateStr = new Date( date.getTime() - ( date.getTimezoneOffset() * 60000 )).toISOString().split( 'T' )[0];
                pwiForums.client.fn.userDataWrite( 'moderationSince', dateStr );
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
        },

        // we have displayed as posts as expected (though maybe the last is still being building)
        //  apply ellipsize when DOM is ready
        waitForPostsDom(){
            //console.log( 'waitForPostsDom' );
            // called for each div.ellipSelector, event if too small to be truncated
            //  - isTruncated: true|false
            //  - originalContent: the jQuery object with oroginal content
            //  - this: the DOM element with current content
            const dddCallback = function( isTruncated, originalContent ){
                //console.log( 'ddddcb', arguments );
                //console.log( 'dddcb', this );
                //console.log( $( 'a', this ));
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
            self.FRS.waitForElements( self.FRS.ellipSelector, self.FRS.posts.expected )
                .then(( nodes ) => {
                    //console.log( 'initializing dotdotdot', nodes );
                    self.$( self.FRS.ellipSelector ).dotdotdot( opts );
                    self.$( self.FRS.ellipSelector ).closest( '.ellipsis-wrapper' ).on( 'click', 'a', function(){
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
            }
    };

    // initialize date with yesterday unless a date is found in user profile
    const str = pwiForums.client.fn.userDataRead( 'moderationSince' );
    let initialDate = new Date();
    if( str ){
        initialDate.setTime( Date.parse( str ));
        console.log( 'str', str, 'initialDate', initialDate );
    } else {
        const today = new Date();
        initialDate.setTime( today.getTime()-( 24*3600000 ));
    }
    console.log( 'setting date since', initialDate );
    self.FRS.setDate( initialDate );

    // creates and initialize ReactiveVar's from user data for checkboxes settings
    self.FRS.checkboxes.every(( data ) => {
        self.FRS[data] = new ReactiveVar( pwiForums.client.fn.userDataRead( data ) === 'true' );
        return true;
    });

    // subscribe to list of moderable forums
    self.autorun(() => {
        console.log( 'subscribe frsForums.listModerables' );
        self.FRS.forums.handle = self.subscribe( 'frsForums.listModerables' );
    });

    // get the moderable forums when ready
    //  *all* moderables forums are returned, whatever be the user display options
    self.autorun(() => {
        if( self.FRS.forums.handle.ready()){
            const query = pwiForums.Forums.queryModerables();
            const list = pwiForums.client.collections.Forums.find( query.selector ).fetch();
            self.FRS.forums.list.set( list );
            self.FRS.forums.ready.set( true );
        }
    });

    // subscribe to list of all posts from the moderable forums since the given date regarding the display options
    self.autorun(() => {
        if( self.FRS.forums.ready.get()){
            self.FRS.posts.handle.set( self.subscribe( 'frsPosts.moderables', {
                forums: self.FRS.forums.list.get(),
                since: self.FRS.date.get(),
                showValidated: self.FRS.moderationShowValidated.get(),
                showModerated: self.FRS.moderationShowValidated.get()
            }));
            /*
            console.log( pwiForums.Posts.queryModerables({
                forums: self.FRS.forums.list.get(),
                since: self.FRS.date.get(),
                showValidated: self.FRS.moderationShowValidated.get(),
                showModerated: self.FRS.moderationShowValidated.get()
            }));
            */
            self.FRS.posts.ready.set( false );
        }
    });

    // posts subscription is ready: we are so able to anticipate the total count of posts
    //  also:
    //  - count posts per forum to build displayable list
    //  - set thread breaks
    //  - set first thread of the forum
    //  - set first post of the thread 
    self.autorun(() => {
        if( self.FRS.posts.handle.get() && self.FRS.posts.handle.get().ready()){
            self.FRS.posts.expected = 0;
            self.FRS.forums.posts.clear();
            let previousSortKey = null;
            let previousForum = null;
            let posts = [];
            console.log( 'fetching published posts' );
            pwiForums.client.collections.Posts.find().fetch().every(( p ) => {
                self.FRS.posts.expected += 1;
                p.threadDifferent = ( p.threadSort !== previousSortKey );
                p.firstPost = p.threadDifferent;
                p.firstThread = ( previousForum !== p.forum );
                if( p.firstThread && previousForum ){
                    self.FRS.forums.posts.set( previousForum, posts );
                    posts = [];
                }
                previousForum = p.forum;
                previousSortKey = p.threadSort;
                //console.log( p );
                posts.push( p );
                return true;
            });
            if( previousForum ){
                self.FRS.forums.posts.set( previousForum, posts );
            }
            console.log( 'posts.expected', self.FRS.posts.expected );
            self.FRS.posts.displayed = 0;
            self.FRS.posts.ready.set( true );
        }
    });

    // after posts have been received, we are able to compute a list of the displayable forums
    self.autorun(() => {
        if( self.FRS.posts.ready.get()){
            console.log( 'recompute displayable forums' );
            let displayable = [];
            let first = true;
            self.FRS.forums.list.get().every(( f ) => {
                const posts = self.FRS.forums.posts.get( f._id );
                const count = posts ? posts.length : 0;
                if( self.FRS.moderationShowEmpty.get() || count ){
                    f.firstForum = first;
                    f.postsCount = count;
                    displayable.push( f );
                    first = false;
                }
                return true;
            });
            self.FRS.forums.displayable.set( displayable );
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
            const res = self.$( nodes[0] ).datepicker({
                format: 'dd/mm/yyyy',
                todayHighlight: true,
                onClose: function( date, dp ){
                    // dp is the datepicker instance - not a JQuery object
                    // date is the date as text 'jj/mm/aaaa' - may be empty according to the doc
                    //console.log( date );
                    self.FRS.setDate( $.datepicker.parseDate( 'dd/mm/yy', date ));
                },
                // called on each change, either by clicking on the widget, or by manually editing the input element
                onUpdateDatepicker: function( dp ){
                    //console.log( dp );    // the datepicker instance
                    //console.log( this );  // the input DOM element
                    //console.log( dp.lastVal );
                    self.FRS.setDate( $.datepicker.parseDate( 'dd/mm/yy', dp.lastVal ));
                }
            });
            //console.log( 'datepicker', res );
        });

    // setup the checkboxes settings depending of the corresponding ReactiveVar
    self.autorun(() => {
        self.FRS.checkboxes.every(( data ) => {
            self.$( 'input[type="checkbox"][data-frs-field="'+data+'"]' ).prop( 'checked', self.FRS[data].get());
            return true;
        });
    });
});

Template.frsModerate.helpers({

    // display the moderation badge
    badgeModeration( f ){
        return pwiForums.client.htmlModerationStrategyBadge( f );
    },

    // whether this is a new thread (created after the date)
    badgeNew( p ){
        const threadDate = new Date( p.threadSort );
        return threadDate > Template.instance().FRS.date.get() ? pwiForums.client.htmlNewThreadBadge() : '';
    },

    // display a private badge
    badgePrivate( f ){
        return pwiForums.client.htmlPrivateBadge( f, { publicIsTransparent: false });
    },

    // do we have something to do with the current forum ?
    forumCatch( f ){
    },

    // if we are the first forum of the list ?
    forumFirst( f ){
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

    // i18n
    i18n( opts ){
        return pwiForums.fn.i18n( 'moderate.'+opts.hash.label );
    },

    // no moderable forum
    noForum(){
        return pwiForums.fn.i18n( 'moderate.noforum' );
    },

    // no new post
    noNewPost(){
        return pwiForums.fn.i18n( 'moderate.nonewpost', pwixI18n.date( Template.instance().FRS.date.get()));
    },

    // the author of the post
    postAuthor( p ){
        return pwiForums.fn.i18n( 'moderate.author', p.rvAuthorEmail.get().label, p.rvAuthorUsername.get().label );
    },

    // catch each rendered post
    //  install a ReactiveVar which will hold the needed labels
    postCatch( f, p ){
        //console.log( 'postCatch' );
        p.rvAuthorEmail = pwiForums.fn.labelById( p.owner, AC_EMAIL_ADDRESS );
        p.rvAuthorUsername = pwiForums.fn.labelById( p.owner, AC_USERNAME );
        p.rvValidator = p.validatedBy ? pwiForums.fn.labelById( p.validatedBy, AC_USERNAME ) : null;
        p.rvStats = new ReactiveVar( null );
        Meteor.callPromise( 'frsPosts.userStats', p.owner ).then(( res ) => { p.rvStats.set( res ); });
    },

    // when the post has it been created ?
    postDate( p ){
        return pwiForums.fn.i18n( 'moderate.moderate_date', pwixI18n.dateTime( p.createdAt ));
    },

    // end of a post
    postEnd(){
        const FRS = Template.instance().FRS;
        FRS.posts.displayed += 1;
        //console.log( 'expected', FRS.posts.expected, 'displayed', FRS.posts.displayed );
        if( FRS.posts.displayed === FRS.posts.expected ){
            FRS.waitForPostsDom();
        }
    },

    // add a 'frs-first' class to first post to be moderable in the thread
    //  first post of each thread set the title in the object
    postFirst( f, p ){
        //console.log( 'postFirst', p.firstPost );
        return p.firstPost ? 'frs-first' : '';
    },

    // the moderation score of the author
    postScore( p ){
        const stats = p.rvStats.get();
        const percent = stats ? (( parseInt(( stats.moderated * 100 / stats.posts ) * 10 )) / 10 )+'%' : '';
        return pwiForums.fn.i18n( 'moderate.owner_score', stats ? stats.posts : 0, stats ? stats.moderated : 0, percent );
    },

    // list the posts displayed in this forum
    postsList( f ){
        //console.log( 'postsList' );
        return Template.instance().FRS.forums.posts.get( f._id ) || [];
    },

    // current since date to initialize the input element
    since(){
        return $.datepicker.formatDate( 'dd/mm/yy', Template.instance().FRS.date.get());
    },

    // if this post belongs to another thread (relatively to this forum) ?
    threadDifferent( f, p ){
        //console.log( 'threadDifferent', p.threadDifferent );
        return p.threadDifferent;
    },

    // if this thread the first in the forum ?
    threadFirst( f, p ){
        return p.firstThread ? 'frs-first' : '';
    },

    // thread title
    threadTitle( p ){
        return pwiForums.fn.i18n( 'moderate.thread_title', p.threadTitle );
    },

    // the posts has been validated by who and when ?
    validatedBy( p ){
        return pwiForums.fn.i18n( 'moderate.validated_by', p.rvValidator ? p.rvValidator.get().label : '', pwixI18n.dateTime( p.validatedAt ));
    },

    // whether the forum be moderated a priori ?
    wantValidate( f ){
        return f.moderation === FRS_MODERATE_APRIORI;
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
        instance.FRS[field].set( checked );
        pwiForums.client.fn.userDataWrite( field, checked ? 'true' : 'false' );
    },

    // validate the message
    'click .frs-validate-btn'( event, instance ){
        const postId = instance.$( event.currentTarget ).attr( 'data-frs-post' );
        //console.log( 'postId', postId );
        Meteor.call( 'frsPosts.validate', postId, ( err, res ) => {
            if( err ){
                tlTolert.error({ type:err.error, message:err.reason });
            } else {
                tlTolert.success( pwiForums.fn.i18n( 'moderate.validated' ));
            }
        });
        // last user action
        const today = new Date();
        pwiForums.client.fn.userDataWrite( 'moderationLastDate', today.toISOString().substring( 0,10 ));
    },

    // unvalidate the message
    //  this is not same than moderated - just post waits for an approbation
    'click .frs-unvalidate-btn'( event, instance ){
        const postId = instance.$( event.currentTarget ).attr( 'data-frs-post' );
        //console.log( 'postId', postId );
        Meteor.call( 'frsPosts.unvalidate', postId, ( err, res ) => {
            if( err ){
                tlTolert.error({ type:err.error, message:err.reason });
            } else {
                tlTolert.success( pwiForums.fn.i18n( 'moderate.unvalidated' ));
            }
        });
        // last user action
        const today = new Date();
        pwiForums.client.fn.userDataWrite( 'moderationLastDate', today.toISOString().substring( 0,10 ));
    },

    // moderate the message
    'click .frs-moderate-btn'( event, instance ){
    }
});
