/*
 * pwix:forums/src/cient/components/frsModerate/frsModerate.js
 */

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
            list: new ReactiveVar( [] ),            // the fetched list
            count: new ReactiveVar( 0 ),            // the count fo found forums
            ready: new ReactiveVar( false )         // ready after fetch
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

        // returns the cursor to the posts to be moderated for this forum
        postsCursor( forum ){
            return self.FRS.posts.handle.get().ready() ? pwiForums.client.collections.Posts.find({ forum: forum._id }) : [];
        },

        // set the Date date if not empty and different
        setDate( date ){
            if( date && date.getTime() !== self.FRS.date.get().getTime()){
                //console.log( 'setting date', newDate, 'previous was', self.FRS.date.get());
                self.FRS.date.set( date );
                pwiForums.client.fn.userDataWrite( 'moderationSince', date.toISOString().substring( 0,10 ));
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
            const maxHeight = 72;
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
            self.FRS.forums.count.set( list.length );
            self.FRS.forums.ready.set( true );
            self.FRS.posts.expected = 0;
        }
    });

    // subscribe to list of all posts from the moderable forums since the given date regarding the display options
    self.autorun(() => {
        if( self.FRS.forums.ready.get()){
            self.FRS.posts.handle.set( self.subscribe( 'frsPosts.moderables', {
                forums: self.FRS.forums.list.get(),
                since: self.FRS.date.get(),
                validated: self.FRS.moderationShowValidated.get(),
                moderated: self.FRS.moderationShowValidated.get()
            }));
            self.FRS.posts.ready.set( false );
            //console.log( pwiForums.Posts.queryModerables( self.FRS.forums.list.get(), self.FRS.date.get().toISOString()));
        }
    });

    // subscription is ready: we are so able to anticipate the total count of posts
    self.autorun(() => {
        if( self.FRS.posts.handle.get() && self.FRS.posts.handle.get().ready()){
            self.FRS.posts.expected = pwiForums.client.collections.Posts.find().count();
            self.FRS.posts.displayed = 0;
            self.FRS.posts.ready.set( true );
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
                    self.FRS.setDate( $.datepicker.parseDate( 'dd/mm/yy', date ));
                },
                // called on each change, either by clicking on the widget, or by manually editing the input element
                onUpdateDatepicker: function( dp ){
                    //console.log( dp );    // the datepicker instance
                    //console.log( this );  // the input DOM element
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

    // current date to initialize the input element
    date(){
        return $.datepicker.formatDate( 'dd/mm/yy', Template.instance().FRS.date.get());
    },

    // do we have something to do with the current forum ?
    forumCatch( f ){
    },

    // returns the count of forums
    forumsCount(){
        return Template.instance().FRS.forums.count.get();
    },

    // list the forums the user is allowed to moderate
    forumsList(){
        //console.log( 'forumsList' );
        return Template.instance().FRS.forums.list.get();
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
    //  install a ReactiveVar which will hold the author username
    postCatch( f, p ){
        //console.log( 'postCatch' );
        p.rvAuthorEmail = pwiForums.fn.labelById( p.owner, AC_EMAIL_ADDRESS );
        p.rvAuthorUsername = pwiForums.fn.labelById( p.owner, AC_USERNAME );
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

    // add a 'frs-first' class is first post to be moderated in the thread
    //  first post of each thread set the title in the object
    postFirst( f, p ){
        let o = f.threadsList || {};
        let first = true;
        if( o[p.threadTitle] ){
            first = false;
        } else {
            o[p.threadTitle] = true;
            f.threadsList = { ...o };
        }
        return first ? 'frs-first' : '';
    },

    // the moderation score of the author
    postScore( p ){
        const stats = p.rvStats.get();
        const percent = stats ? (( parseInt(( stats.moderated * 100 / stats.posts ) * 10 )) / 10 )+'%' : '';
        return pwiForums.fn.i18n( 'moderate.owner_score', stats ? stats.posts : 0, stats ? stats.moderated : 0, percent );
    },

    // returns the count of posts for this forum
    //  because this helper is executed before trying to display the list, we compute the cursor here
    postsCount( f ){
        const cursor = Template.instance().FRS.postsCursor( f );
        return cursor.count ? cursor.count() : 0;
    },

    // list the posts to be moderated
    postsList( f ){
        return Template.instance().FRS.postsCursor( f );
   },

    // if this post belongs to another thread (relatively to this forum) ?
    threadNew( f, p ){
        const another = ( p.threadTitle !== f.previousThread );
        f.previousThread = p.threadTitle;
        return another;
    },

    // thread title
    threadTitle( p ){
        return pwiForums.fn.i18n( 'moderate.thread_title', p.threadTitle );
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

    // moderate the message
    'click .frs-moderate-btn'( event, instance ){
    }
});
