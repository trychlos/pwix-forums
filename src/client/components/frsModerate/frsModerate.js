/*
 * pwix:forums/src/cient/components/frsModerate/frsModerate.js
 *
 * TODO:
 * - have an option to show already moderated posts
 * - have an option to show empty forums (forums with to-be-moderated posts)
 * - for forum:
 *      - add a public/private badge
 * - for post:
 *      - display the creation date
 *      - ellipsize the content + have 'plus' button/link
 *      - identify the author + add already moderated count and percent
 *      - have a checkbox for validate if moderation is a priori
 *      - have a button for moderate which goes to the moderation dialog
 *      - if already moderated, say by who and why and when ?
 *      - if have unmoderator role, then have a button unmoderate (+ reason ?)
 */

import { ReactiveVar } from 'meteor/reactive-var';
import { pwixI18n } from 'meteor/pwix:i18n';

import './frsModerate.html';
import './frsModerate.less';

Template.frsModerate.onCreated( function(){
    const self = this;

    self.FRS = {
        dpSelector: '.frsModerate input.frs-date',
        date: new ReactiveVar( null ),  // Date object
        forums: {
            handle: null,
            list: new ReactiveVar( [] )
        },
        posts: {
            handle: null,
            list: new ReactiveVar( null )
        },

        // clear the fields added by the helpers each time the postsList is re-run
        clearForums(){
            let list = self.FRS.forums.list.get();
            list.every(( f ) => {
                f.previousThread = null;
                f.threadsList = null;
                return true;
            });
            self.FRS.forums.list.set( list );
        },

        // returns a cursor on the Posts for this forum
        postsCursor( forum ){
            return self.FRS.posts.handle.ready() ? pwiForums.client.collections.Posts.find({ forum: forum._id }) : [];
        },

        // set the 'dd/mm/yyyy' date if not empty and different
        setDate( date ){
            if( date ){
                const newDate = $.datepicker.parseDate( 'dd/mm/yy', date );
                if( newDate.getTime() !== self.FRS.date.get().getTime()){
                    //console.log( 'setting date', newDate, 'previous was', self.FRS.date.get());
                    self.FRS.date.set( newDate );
                }
            }
        },

        // https://stackoverflow.com/questions/5525071/how-to-wait-until-an-element-exists
        //  only initialize datepicker when the DOM element is available
        waitForElm( selector ){
            return new Promise(( resolve ) => {
                if( document.querySelector( selector )){
                    return resolve( document.querySelector( selector ));
                }
                const observer = new MutationObserver(( mutations ) => {
                    if( document.querySelector( selector )){
                        resolve( document.querySelector( selector ));
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

    // initialize date with yesterday
    const today = new Date();
    const initialDate = new Date();
    initialDate.setTime( today.getTime()-( 24*3600000 ));
    //console.log( 'initialDate', initialDate );
    self.FRS.date.set( initialDate );

    // subscribe to list of moderable forums
    self.autorun(() => {
        self.FRS.forums.handle = self.subscribe( 'frsForums.listModerables' );
    });

    // get the moderable forums when ready
    self.autorun(() => {
        if( self.FRS.forums.handle.ready()){
            const query = pwiForums.Forums.queryModerables();
            self.FRS.forums.list.set( pwiForums.client.collections.Forums.find( query.selector ).fetch());
        }
    });

    // subscribe to list of all posts from the moderable forums since the given date
    self.autorun(() => {
        //console.log( 'autorun', self.FRS.date.get());
        self.FRS.posts.handle = self.subscribe( 'frsPosts.moderables', self.FRS.forums.list.get(), self.FRS.date.get());
        //console.log( pwiForums.Posts.queryModerables( self.FRS.forums.list.get(), self.FRS.date.get().toISOString()));
    });
});

Template.frsModerate.onRendered( function(){
    const self = this;

    // initialize the datepicker when available
    //  https://api.jqueryui.com/datepicker/
    self.FRS.waitForElm( self.FRS.dpSelector )
        .then(( elem ) => {
            //console.log( 'initializing datepicker' );
            const res = self.$( self.FRS.dpSelector ).datepicker({
                format: 'dd/mm/yyyy',
                todayHighlight: true,
                onClose: function( date, dp ){
                    // dp is the datepicker instance - not a JQuery object
                    // date is the date as text 'jj/mm/aaaa' - may be empty according to the doc
                    self.FRS.setDate( date );
                },
                // called on each change, either by clicking on the widget, or by manually editing the input element
                onUpdateDatepicker: function( dp ){
                    //console.log( dp );    // the datepicker instance
                    //console.log( this );  // the input DOM element
                    self.FRS.setDate( dp.lastVal );
                }
            });
            //console.log( 'datepicker', res );
        });
});

Template.frsModerate.helpers({

    // whether this is a new thread (created after the date)
    badgeNew( p ){
        const threadDate = new Date( p.threadSort );
        return threadDate > Template.instance().FRS.date.get() ? pwiForums.client.htmlNewThreadBadge() : '';
    },

    // current date to initialize the input element
    date(){
        //console.log( 'helper', Template.instance().FRS.date.get());
        //console.log( 'helper', $.datepicker.formatDate( 'dd/mm/yy', Template.instance().FRS.date.get()));
        return $.datepicker.formatDate( 'dd/mm/yy', Template.instance().FRS.date.get());
    },

    // do we have something to do with the current forum ?
    forumCatch( f ){
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

    // no new post
    noNewPost(){
        return pwiForums.fn.i18n( 'moderate.nonewpost', pwixI18n.date( Template.instance().FRS.date.get()));
    },

    // catch each rendered post
    postCatch( p ){
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

    // list the posts to be moderated
    postsList( f ){
        //console.log( 'postsList' );
        const FRS = Template.instance().FRS;
        FRS.clearForums();
        return FRS.postsCursor( f );
    },

    // returns the count of document in the cursor for this forum
    postsListCount( f ){
        const cursor = Template.instance().FRS.postsCursor( f );
        return cursor.count ? cursor.count() : 0;
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

});
