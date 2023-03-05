/*
 * pwix:forums/src/client/js/badges.js
 *
 * Display badges for public/private forums.
 * 
 * Have JS functions to display badges is made mandatory as we need them when updating the objects tree (cf. frs_tree_tab.js)
 */

import { pwixI18n } from 'meteor/pwix:i18n';
import { uiLayout } from 'meteor/pwix:layout';

import { frsModerate } from '../../common/classes/frs_moderate.class.js';

// display the archived badge
//  opened forum:   color=transparent
//  archived forum: color=warning      icon=lock
//
//  f is the Forum
pwiForums.client.htmlArchivedBadge = function( f ){
    let html = '';
    if( f ){
        html += ''
        +'<span class="badge '+( f.archivedAt ? 'text-bg-warning' : 'frs-transparent' )+' frs-badge-round"'
        +'  title="'+pwiForums.fn.i18n( 'badges.'+( f.archivedAt ? 'for_ro' : 'for_rw' ))+'">'
        +'    <span class="fa-solid fa-lock"></span>'
        +'</span>';
    }
    return html;
}

// display the moderate strategy badge
//
//  f is the Forum
pwiForums.client.htmlModerationStrategyBadge = function( f ){
    const group = pwixI18n.group( FRSI18N, 'moderate.short_strategies' );
    const html = ''
        +'<span class="badge frs-bg-forum frs-badge-label"'
        +'  title="'+pwiForums.fn.i18n( 'badges.mod_strategy' )+'">'
        + frsModerate.short( f.moderation )
        +'</span>';
    return html;
}

// display a moderator badge
//
//  f is the Forum
pwiForums.client.htmlModeratorBadge = function( f ){
    let html = '';
    const userId = Meteor.userId();
    if( pwiForums.Forums.canModerate( f, userId )){
        html += ''
        +'<span class="badge frs-badge-label frs-bg-forum"'
        +'  title="'+pwiForums.fn.i18n( 'badges.moderator' )+'">'
        + pwiForums.fn.i18n( 'badges.moderator' )
        +'</span>';
    }
    return html;
}

// display a new thread badge
pwiForums.client.htmlNewThreadBadge = function(){
    const html = ''
        +'<span class="badge frs-badge-label frs-bg-post"'
        +'  title="'+pwiForums.fn.i18n( 'badges.new_thread' )+'">'
        + pwiForums.fn.i18n( 'badges.new_label' )
        +'</span>';
    return html;
}

// display the posts count badge
//  if small size: only display the count (without the label)
//
// f is the forum
pwiForums.client.htmlPostsCountBadge = function( f ){
    let html = '';
    if( f ){
        const width = uiLayout.view();
        //console.log( width );
        html += ''
            +'<span class="badge frs-badge-label frs-bg-forum">'
            +( width === UI_VIEW_SM ? f.postsCount : pwiForums.fn.i18n( 'badges.posts_count', f.pub.postsCount ))
            +'</span>';
    }
    return html;
}

// display the public/private badge
// public forum: color=info,    icon=fa-users
// pivate forum: color=warning  icon=fa-user-gear
//
// f is the forum
// opts:
//  - publicIsTransparent, default to false
pwiForums.client.htmlPrivateBadge = function( f, opts=null ){
    let html = '';
    if( f ){
        const publicIsTransparent = opts && Object.keys( opts ).includes( 'publicIsTransparent' ) ? opts.publicIsTransparent : false;
        const publicClass = publicIsTransparent ? 'frs-transparent' : 'text-bg-info';
        html += ''
            +'<span class="badge '+( f.private ? 'text-bg-warning' : publicClass )+' frs-badge-round"'
            +'  title="'+pwiForums.fn.i18n( 'badges.'+( f.private ? 'for_private' : 'for_public' ))+'">'
            +'    <span class="fa-solid '+( f.private ? 'fa-user-gear' : 'fa-users' )+'"></span>'
            +'</span>';
    }
    return html;
}

// display the threads count badge
//
// f is the forum
pwiForums.client.htmlThreadsCountBadge = function( f ){
    let html = '';
    if( f ){
        html += ''
            +'<span class="badge frs-badge-label frs-bg-forum">'
            + pwiForums.fn.i18n( 'badges.threads_count', f.pub.threadsList.length )
            +'</span>';
    }
    return html;
}
