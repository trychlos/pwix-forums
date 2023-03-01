/*
 * /src/client/components/frsPosts/frsPosts.js
 *
 * The displayed thread content is available as a 'threadId' route param
 */

import { FlowRouter } from 'meteor/ostrio:flow-router-extra';
import { pwixI18n as i18n } from 'meteor/pwix:i18n';

import { pwiForums } from '../../js/index.js';

import '../../stylesheets/frs_forums.less';

import '../frs_post_moderate/frs_post_moderate.js';
import '../frs_post_tr/frs_post_tr.js';

import './frsPosts.html';
import './frsPosts.less';

Template.frsPosts.onCreated( function(){
    const self = this;
    //console.log( self );

    self.FRS = {

        // the initial post which has initiated the thread
        thread: {
            id: new ReactiveVar( null ),
            handle: new ReactiveVar( null ),
            obj: new ReactiveVar( null )
        },
        // the forum in which we post adressed from the initial post
        forum: {
            id: new ReactiveVar( null ),
            handle: new ReactiveVar( null ),
            obj: new ReactiveVar( null )
        },
        posts: {
            query: new ReactiveVar( null ),
            handle: new ReactiveVar( null ),
            cursor: new ReactiveVar( null ),
            nonDeletedCount: new ReactiveVar( 0 ),
            nonDeletedCountSet: false
        },

        // whether the current user is allowed to post in the current forum
        writer: new ReactiveVar( false ),
        reason: new ReactiveVar( null ),

        // returns the 'id' post
        post( id ){
            return pwiForums.client.collections.Posts.findOne({ _id: id });
        },

        postDeleted( post ){
            console.log( 'just deleted', post );
        },

        postModerated( post ){
            console.log( 'just moderated', post );
        }
    };

    // get the threadId as a FlowRouter param
    //  subscribe to the Posts publication to get this particular post and all others
    //  the two subscriptions overlap, but kept as first is most probably much faster than the second
    self.autorun(() => {
        const threadId = FlowRouter.getParam( 'threadId' );
        self.FRS.thread.id.set( threadId );
        self.FRS.thread.handle.set( self.subscribe( 'frsPosts.byId', threadId ));
    });

    // get the thread when ready
    self.autorun(() => {
        if( self.FRS.thread.handle.get() && self.FRS.thread.handle.get().ready()){
            const post = pwiForums.client.collections.Posts.findOne({ _id: self.FRS.thread.id.get() });
            if( post ){
                self.FRS.thread.obj.set( post );
                self.FRS.forum.id.set( post.forum );
            }
            //console.log( 'got thread', post );
        }
    });

    // subscribe to Forums publication as soon as we have got the forum identifier
    self.autorun(() => {
        const forumId = self.FRS.forum.id.get();
        if( forumId ){
            self.FRS.forum.handle.set( self.subscribe( 'frsForums.byId', forumId ));
            //console.log( 'forum subscription' );
        }
    });

    // get the forum when ready
    self.autorun(() => {
        if( self.FRS.forum.handle.get() && self.FRS.forum.handle.get().ready()){
            const forum = pwiForums.client.collections.Forums.findOne({ _id: self.FRS.forum.id.get() });
            self.FRS.forum.obj.set( forum );
            //console.log( 'got forum' );
        }
    });

    // build the query to get the posts of the thread in this forum
    self.autorun(() => {
        const forum = self.FRS.forum.obj.get();
        if( forum ){
            const threadId = self.FRS.thread.id.get();
            const userId = Meteor.userId();
            const isModerator = userId ? pwiForums.Forums.canModerate( forum, userId ) : false;
            const withModerated = isModerator ? forum.showDeletedForAdmin : false;
            const withDeleted = userId ? forum.showDeletedForUser : false;
            self.FRS.posts.query.set( pwiForums.Posts.queryReadables( forum, threadId, {
                withModerated: withModerated,
                withDeleted: withDeleted,
                userId: userId
            }));
        }
    });

    // subscribe to the Posts publication to get the available posts in this thread
    self.autorun(() => {
        const query = self.FRS.posts.query.get();
        if( query ){
            self.FRS.posts.handle.set( self.subscribe( 'frsPosts.threadPosts', query ));
        }
    });

    // get the last (most recent) 100 posts
    // has to wait for the forum to be able to honor the 'showDeletedForAdmin' property
    // get the count of non deleted posts in this thread
    self.autorun(() => {
        if( self.FRS.posts.handle.get() && self.FRS.posts.handle.get().ready()){
            const query = self.FRS.posts.query.get();
            self.FRS.posts.cursor.set( pwiForums.client.collections.Posts.find( query.selector, query.options ));
            self.FRS.posts.nonDeletedCount.set( pwiForums.client.collections.Posts.find({ $and: [ query.selector, { deletedAt: null }]}, query.options ).count());
            self.FRS.posts.nonDeletedCountSet = true;
            //console.log( 'got posts cursor' );
            //console.log(pwiForums.client.collections.Posts.find( query.selector, query.options ).fetch());
        }
    });

    // is user allowed to write in the current forum ?
    //  must be identified
    //  must be member of private list for private forum
    self.autorun(() => {
        const forum = self.FRS.forum.obj.get();
        const o = forum ? pwiForums.Forums.canWrite( forum, Meteor.user()) : { editable: false, reason: FRS_REASON_NONE };
        self.FRS.writer.set( o.editable );
        self.FRS.reason.set( o.reason );
    });

    // track the count of non deleted posts in this thread
    //  rerouting to list of threads when empty
    self.autorun(() => {
        console.log( 'non deleted count', self.FRS.posts.nonDeletedCount.get());
        if( self.FRS.posts.nonDeletedCountSet && self.FRS.posts.nonDeletedCount.get() === 0 ){
            const forum = self.FRS.forum.obj.get();
            FlowRouter.go( pwiForums.client.fn.routeThreads( forum._id ));
        }
    });
});

Template.frsPosts.helpers({
    // archived forum badge
    badgeArchived(){
        const forum = Template.instance().FRS.forum.obj.get();
        return pwiForums.client.htmlArchivedBadge( forum );
    },

    // display a moderator badge
    badgeModerator(){
        const forum = Template.instance().FRS.forum.obj.get();
        return pwiForums.client.htmlModeratorBadge( forum );
    },

    // private forum badge
    badgePrivate(){
        const forum = Template.instance().FRS.forum.obj.get();
        return pwiForums.client.htmlPrivateBadge( forum, { publicIsTransparent: false });
    },

    // writes a small label to says that a post has been deleted
    deletedLabel( it ){
        return pwiForums.fn.i18n( 'threads.deleted_label', i18n.dateTime( it.deletedAt ));
    },

    // the forum title
    forumTitle(){
        const forum = Template.instance().FRS.forum.obj.get();
        return forum ? forum.title : '';
    },

    // the identifier of the current forum (to display the opened threads)
    forumId(){
        return Template.instance().FRS.forum.id.get();
    },

    // writes a small label to says that a post is moderated and not visible
    moderatedLabel( it ){
        return pwiForums.fn.i18n( 'threads.moderated_label', i18n.dateTime( it.deletedAt ), it.dynModerated.get().label, it.deletedBecause );
    },

    // whether the current post has been moderated ?
    moderatedPost( it ){
        const moderated = it.deletedAt && it.deletedBecause;
        if( moderated ){
            it.dynModerated = pwiForums.fn.labelById( it.deletedBy, AC_USERNAME );
        }
        return moderated;
    },

    postsList(){
        return Template.instance().FRS.posts.cursor.get();
    },

    // the parms for the frs_post_tr component
    postTr( it ){
        return {
            forum: Template.instance().FRS.forum.obj.get(),
            post: it,
            writer: Template.instance().FRS.writer
        }
    },

    // whether we want show the deleted posts ?
    showDeleted(){
        const forum = Template.instance().FRS.forum.obj.get();
        return forum.showDeletedForUser;
    },

    // whether we want show the moderated posts ?
    showModerated(){
        const forum = Template.instance().FRS.forum.obj.get();
        return forum.showDeletedForAdmin;
    },

    // thread title
    threadTitle(){
        const obj = Template.instance().FRS.thread.obj.get();
        return obj ? obj.title : '';
    },

    // whether this post has been deleted by its owner and this is the current user ?
    userDeleted( it ){
        const userId = Meteor.userId();
        return ( it.owner === userId && it.deletedAt && it.deletedBy === userId && !it.deletedBecause );
    },

    // the reason for why the user cannot post in this forum (if any)
    writableReason(){
        if( Template.instance().FRS.writer.get()){
            return '';
        }
        const reason = Template.instance().FRS.reason.get();
        const group = i18n.group( FRSI18N, 'unwritable' );
        return pwiForums.fn.i18n( 'posts.not_writable', group[reason] );
    }
});

Template.frsPosts.events({

    // toggle (on) the display of the underlying moderated post
    'click .frs-moderated-label'( event, instance ){
        const postId = instance.$( event.currentTarget ).closest( 'tr.frs-moderated-tr' ).data( 'post-id' );
        $( 'tbody tr.frs-moderated-tr[data-post-id="'+postId+'"]' ).addClass( 'frs-hidden' );
        $( 'tbody tr.frs-moderated-post[data-post-id="'+postId+'"]' ).removeClass( 'frs-hidden' );
        return false;
    },

    // toggle (off) the display of the underlying moderated post
    'frs-post-tr-close .frs-body'( event, instance, data ){
        console.log( 'frs-post-tr-close', data );
        $( 'tbody tr.frs-moderated-post[data-post-id="'+data.post._id+'"]' ).addClass( 'frs-hidden' );
        $( 'tbody tr.frs-moderated-tr[data-post-id="'+data.post._id+'"]' ).removeClass( 'frs-hidden' );
        return false;
    },

    // a message has been deleted by the user
    'frs-post-tr-deleted .frs-body'( event, instance, data ){
        //console.log( 'frs-post-tr-deleted', data, 'postId', data.post._id );
        instance.FRS.postDeleted( data.post );
    },

    // a message has been moderated (by a moderator)
    'frs-post-moderate-moderated .frs-body'( event, instance, data ){
        //console.log( 'frs-post-moderate-moderated', data );
        instance.FRS.postModerated( data.post );
    }
});
