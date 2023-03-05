/*
 * pwix:forums/src/client/components/frsThreads/frsThreads.js
 *
 * The displayed forum content is available as a 'forumId' route param
 */

import { FlowRouter } from 'meteor/ostrio:flow-router-extra';
import { pwixI18n as i18n } from 'meteor/pwix:i18n';
import { ReactiveDict } from 'meteor/reactive-dict';

import { frsOrderedTree } from '../../../common/classes/frs_ordered_tree.class.js';

import '../../stylesheets/frs_forums.less';

import '../frs_breadcrumb/frs_breadcrumb.js';
import '../frs_post_edit/frs_post_edit.js';

import './frsThreads.html';
import './frsThreads.less';

Template.frsThreads.onCreated( function(){
    const self = this;
    //console.log( self );

    self.FRS = {
        orderedTree: new frsOrderedTree(),
        forum: new ReactiveVar( null ),

        // frsPosts collection
        posts: {
            query: new ReactiveVar( null ),
            handle: new ReactiveVar( null ),
            leaders: new ReactiveVar( [] )
        },

        // opening a new thread
        newThread: {
            title: new ReactiveVar( '' ),
            content: new ReactiveVar( '' )
        },

        // whether the current user is allowed to create a new thread in the current forum
        writer: new ReactiveVar( false ),
        reason: new ReactiveVar( null ),

        // whether the 'new discussion' toggle is active or not ?
        //  thanks to Bootstrap framework, the button already holds its state here and we shouldn't have to take care of that
        newThreadToggle(){
            //const active = self.FRS.newThreadOn.get();
            const active = self.$( '.frs-thread-new-btn' ).hasClass( 'active' );
            const newThreadDiv = self.$( '.frs-new-thread' );
            // activate the creation panel
            if( active ){
                console.log( 'frsThreads sends frs-post-edit-start' );
                newThreadDiv.find( '.frs-post-edit' ).trigger( 'frs-post-edit-start' );
                self.$( '.frs-empty' ).addClass( 'frs-hidden' );
            // disactivate the creation panel
            } else {
                newThreadDiv.find( '.frs-post-edit' ).trigger( 'frs-post-edit-end' );
                self.$( '.frs-empty' ).removeClass( 'frs-hidden' );
            }
        }
    };

    // get the forum identifier, so the forum document
    self.autorun(() => {
        const forumId = FlowRouter.getParam( 'forumId' );
        if( forumId ){
            self.FRS.forum.set( self.FRS.orderedTree.forum( forumId ));
        }
    });

    // the forum gives us the list of threads readable by the user
    //  subscribe to all the Posts...
    self.autorun(() => {
        const forum = self.FRS.forum.get();
        if( forum ){
            self.FRS.posts.query.set( pwiForums.Posts.queryReadables( forum, Meteor.userId()));
            self.FRS.posts.handle.set( self.subscribe( 'frsPosts.byQuery', self.FRS.posts.query.get()));
        }
    });

    // get the thread leaders when subscription is ready
    self.autorun(() => {
        const handle = self.FRS.posts.handle.get();
        if( handle && handle.ready()){
            const forum = self.FRS.forum.get();
            let list = [];
            forum.pub.threadsList.every(( id ) => {
                const selector = self.FRS.posts.query.get().selector;
                const post = pwiForums.client.collections.Posts.find({ $and: [{ threadId: id }, selector ]}, { sort: { createdAt: -1 }, limit: 1 }).fetch()[0];
                if( post ){
                    post.dyn = {
                        rvLastPostOwner: pwiForums.fn.labelById( forum.pub.lastPost.owner, AC_USERNAME ),
                        rvOwner: pwiForums.fn.labelById( post.owner, AC_USERNAME ),
                        rvPostsCount: new ReactiveVar( 0 )
                    };
                    pwiForums.client.collections.Posts.countDocuments({ $and: [{ threadId: id }, selector ]}).then(( count ) => { post.dyn.rvPostsCount.set( count ); });
                    list.push( post );
                }
                return true;
            });
            self.FRS.posts.leaders.set( list );
        }
    });

    // is user allowed to write in the current forum ?
    //  must be identified
    //  must be member of private list for private forum
    self.autorun(() => {
        const forum = self.FRS.forum.get();
        const o = forum ? pwiForums.Forums.canWrite( forum, Meteor.user()) : { editable: false, reason: FRS_REASON_NONE };
        self.FRS.writer.set( o.editable );
        self.FRS.reason.set( o.reason );
        //console.log( 'writer', self.FRS.writer.get());
    });
});

Template.frsThreads.helpers({
    // archived forum badge
    badgeArchived(){
        const forum = Template.instance().FRS.forum.get();
        return pwiForums.client.htmlArchivedBadge( forum );
    },

    // display a moderator badge
    badgeModerator(){
        const forum = Template.instance().FRS.forum.get();
        return pwiForums.client.htmlModeratorBadge( forum );
    },

    // private forum badge
    badgePrivate(){
        const forum = Template.instance().FRS.forum.get();
        return pwiForums.client.htmlPrivateBadge( forum, { publicIsTransparent: false });
    },

    // whether the 'new' button is enabled ?
    disableNew(){
        return Template.instance().FRS.writer.get() ? '' : 'disabled';
    },

    // enable tooltips when all have been created
    enableToolstips(){
        // https://getbootstrap.com/docs/5.2/components/tooltips/
        const tooltipTriggerList = document.querySelectorAll( '.frsThreads [data-bs-toggle="tooltip"]' );
        const tooltipList = [...tooltipTriggerList].map( tooltipTriggerEl => new bootstrap.Tooltip( tooltipTriggerEl ));
    },

    forumDescription(){
        const self = Template.instance();
        const forum = self.FRS.forum.get();
        return forum ? forum.displayableDescription : '';
    },

    forumTitle(){
        const self = Template.instance();
        const forum = self.FRS.forum.get();
        return forum ? forum.title : '';
    },

    // whether there is at least one thread ?
    hasThreads(){
        const self = Template.instance();
        const forum = self.FRS.forum.get();
        return forum ? forum.pub.threadsList.length > 0 : false;
    },

    // i18n
    i18n( opts ){
        return pwiForums.fn.i18n( 'threads.'+opts.hash.label );
    },

    // params for frs_post_edit when wanting create a new thread
    //  have to 'get()' our reactive vars to make this helper reactive itself
    parmsPostEdit(){
        const forum = Template.instance().FRS.forum.get();
        const allowed = Template.instance().FRS.writer.get();
        if( false ){
            console.log( 'parmsPostEdit allowed', allowed, 'forum', forum );
        }
        return {
            mode: 'NEW',
            allowed: Template.instance().FRS.writer,
            object: forum,
            autostart: false
        };
    },

    // get the current thread leader
    threadCatch( it ){
    },

    threadContent( it ){
        return it.content;
    },

    threadId( it ){
        return it.threadId;
    },

    threadLast( it ){
        const forum = Template.instance().FRS.forum.get();
        const lastPost = forum ? forum.pub.lastPost : null;
        return lastPost ? pwiForums.fn.i18n( 'threads.last_post', i18n.dateTime( lastPost.createdAt ), it.dyn.rvLastPostOwner.get().label ) : '';
    },

    threadOwner( it ){
        return it.dyn.rvOwner.get().label;
    },

    // count of readable posts in this thread
    threadPostsCount( it ){
        return it.dyn.rvPostsCount.get();
    },

    threadStarted( it ){
        return i18n.date( it.createdAt );
    },

    threadTitle( it ){
        return it.title;
    },

    threadTooltip( it ){
        return pwiForums.fn.i18n( 'threads.tooltip', pwiForums.client.fn.routePosts( it._id ));
    },

    threadsList(){
        return Template.instance().FRS.posts.leaders.get();
    },

    // display the reason for why the user is not allowed
    writableReason(){
        const reason = Template.instance().FRS.reason.get();
        const group = i18n.group( FRSI18N, 'unwritable' );
        return pwiForums.fn.i18n( 'threads.not_writable', group[reason] );
    },

    // whether the current user is allowed to create a thread in this forum ?
    writableTrue(){
        return Template.instance().FRS.writer.get();
    }
});

Template.frsThreads.events({

    // start/close a new discussion
    'click .frs-thread-new-btn'( event, instance ){
        instance.FRS.newThreadToggle();
        return false;
    },

    // click on a row to open the thread
    'click .frs-thread-tr'( event, instance ){
        const threadId = $( event.currentTarget ).data( 'row-id' );
        FlowRouter.go( pwiForums.client.fn.routePosts( threadId ));
        return false;
    },

    // a new thread has been posted -> go to the Posts page
    'frs-post-edit-success .frs-new-thread'( event, instance, data ){
        //console.log( data.post );
        FlowRouter.go( pwiForums.client.fn.routePosts( data.post._id ));
    },

    // when the panel is closed by itself
    'frs-post-edit-closed .frs-new-thread'( event, instance, data ){
        if( data.reason !== 'REQCALLER' ){
            instance.$( '.frs-thread-new-btn' ).removeClass( 'active' ).prop( 'aria-pressed', false );
            instance.FRS.newThreadToggle();
        }
    }
});
