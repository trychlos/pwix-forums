/*
 * pwix:forums/src/client/components/frsThreads/frsThreads.js
 *
 * The displayed forum content is available as a 'forumId' route param
 */

import { FlowRouter } from 'meteor/ostrio:flow-router-extra';
import { pwixI18n as i18n } from 'meteor/pwix:i18n';

import { pwiForums } from '../../js/index.js';

import '../../stylesheets/frs_forums.less';

import '../frs_breadcrumb/frs_breadcrumb.js';
import '../frs_post_edit/frs_post_edit.js';

import './frsThreads.html';
import './frsThreads.less';

Template.frsThreads.onCreated( function(){
    const self = this;
    //console.log( self );

    self.FRS = {

        // frsForums collection (one element here)
        forum: {
            id: new ReactiveVar( null ),
            handle: new ReactiveVar( null ),
            object: new ReactiveVar( null )
        },

        // frsThreads collection
        threads: {
            handle: new ReactiveVar( null ),
            cursor: new ReactiveVar( null ),
            hash: {}
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

    // get the forum identifier
    self.autorun(() => {
        self.FRS.forum.id.set( FlowRouter.getParam( 'forumId' ));
    });

    // subscribe to the Forums publication
    self.autorun(() => {
        const forumId = self.FRS.forum.id.get();
        if( forumId ){
            self.FRS.forum.handle.set( self.subscribe( 'frsForums.listOne', forumId ));
        }
    });

    // get the forum when ready
    self.autorun(() => {
        if( self.FRS.forum.handle.get() && self.FRS.forum.handle.get().ready()){
            const forumId = self.FRS.forum.id.get();
            self.FRS.forum.object.set( pwiForums.client.collections.Forums.findOne({ _id: forumId }));
            //console.log( 'got forum' );
        }
    });

    // subscribe to Posts when we have got the forum id in order to get the threads opened on this forum
    self.autorun(() => {
        const id = self.FRS.forum.id.get();
        if( id ){
            self.FRS.threads.handle.set( self.subscribe( 'frsPosts.threads', id, pwiForums.conf.posts.limit ));
        }
    });

    // get the last (most recent) 100 threads
    self.autorun(() => {
        const handle = self.FRS.threads.handle.get();
        if( handle && handle.ready()){
            const forumId = self.FRS.forum.id.get();
            const query = pwiForums.Posts.queryThreads( forumId, pwiForums.conf.posts.limit );
            self.FRS.threads.cursor.set( pwiForums.client.collections.Posts.find( query.selector, query.options ));
        }
    });

    // is user allowed to write in the current forum ?
    //  must be identified
    //  must be member of private list for private forum
    self.autorun(() => {
        const forum = self.FRS.forum.object.get();
        const o = forum ? pwiForums.Forums.canWrite( forum, Meteor.user()) : { editable: false, reason: FRS_REASON_NONE };
        self.FRS.writer.set( o.editable );
        self.FRS.reason.set( o.reason );
        //console.log( 'writer', self.FRS.writer.get());
    });
});

Template.frsThreads.helpers({
    // archived forum badge
    badgeArchived(){
        const forum = Template.instance().FRS.forum.object.get();
        return pwiForums.client.htmlArchivedBadge( forum );
    },

    // display a moderator badge
    badgeModerator(){
        const forum = Template.instance().FRS.forum.object.get();
        return pwiForums.client.htmlModeratorBadge( forum );
    },

    // private forum badge
    badgePrivate(){
        const forum = Template.instance().FRS.forum.object.get();
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
        const forum = self.FRS.forum.object.get();
        return forum ? forum.displayableDescription : '';
    },

    forumTitle(){
        const self = Template.instance();
        const forum = self.FRS.forum.object.get();
        return forum ? forum.title : '';
    },

    // whether there is at least one thread ?
    hasThreads(){
        const cursor = Template.instance().FRS.threads.cursor.get();
        return cursor ? cursor.count() > 0 : false;
    },

    // i18n
    i18n( opts ){
        return pwiForums.fn.i18n( 'threads.'+opts.hash.label );
    },

    // params for frs_post_edit when wanting create a new thread
    //  have to 'get()' our reactive vars to make this helper reactive itself
    parmsPostEdit(){
        const forum = Template.instance().FRS.forum.object.get();
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

    // store the current post
    push( it ){
        Template.instance().FRS.threads.hash[it._id] = it;
        const post = it.lastPost ? it.lastPost : it;
        it.dynLastPost = pwiForums.fn.labelById( post.owner, AC_USERNAME );
        it.dynOwner = pwiForums.fn.labelById( it.owner, AC_USERNAME );
    },

    threadContent( it ){
        return it.content;
    },

    threadLast( it ){
        let post = it.lastPost ? it.lastPost : it;
        return pwiForums.fn.i18n( 'threads.last_post', i18n.dateTime( post.createdAt ), it.dynLastPost.get().label );
    },

    threadOwner( it ){
        return it.dynOwner.get().label;
    },

    threadStarted( it ){
        return i18n.date( it.createdAt );
    },

    threadTooltip( it ){
        return pwiForums.fn.i18n( 'threads.tooltip', pwiForums.client.fn.routePosts( it._id ));
    },

    threadsList(){
        return Template.instance().FRS.threads.cursor.get();
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
        const postId = $( event.currentTarget ).data( 'row-id' );
        FlowRouter.go( pwiForums.client.fn.routePosts( postId ));
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
