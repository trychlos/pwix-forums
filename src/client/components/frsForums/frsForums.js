/*
 * /src/client/components/frsForums/frsForums.js
 *
 * Forums home page.
 * 
 * Display the list of opened visible forums.
 * This page is meant to be public.
 * 
 * Params: none
 */

import { pwixI18n as i18n } from 'meteor/pwix:i18n';

import { Forums } from '../../js/index.js';
import { frsOrderedTree } from '../../../common/classes/frs_ordered_tree.class.js';

import '../../stylesheets/frs_forums.less';

import '../frs_breadcrumb/frs_breadcrumb.js';

import './frsForums.html';
import './frsForums.less';

Template.frsForums.onCreated( function(){
    const self = this;

    self.FRS = {
        orderedTree: new frsOrderedTree()
    };
});

Template.frsForums.helpers({
    // display a archived badge if apply
    badgeArchived( f ){
        if( f.archivedAt ){
            return Forums.client.htmlArchivedBadge( f );
        }
    },

    // display a moderator badge
    badgeModerator( f ){
        return Forums.client.htmlModeratorBadge( f );
    },

    // display count of posts
    badgePosts( f ){
        return Forums.client.htmlPostsCountBadge( f );
    },

    // display a private badge
    badgePrivate( f ){
        return Forums.client.htmlPrivateBadge( f, { publicIsTransparent: false });
    },

    // display count of threads
    badgeThreads( f ){
        return Forums.client.htmlThreadsCountBadge( f );
    },

    // catch the current category
    //  set the background color accordingly
    catCatch( c ){
        //console.log( c );
        const instance = Template.instance();
        if( instance.view.isRendered ){
            instance.$( '.frsForums .frs-background.cat-'+c._id ).css({
                'background-color': c.color
            });
        }
    },

    // send the list of non empty categories
    catList(){
        const self = Template.instance();
        let catList = [];
        self.FRS.orderedTree.tree().every(( c ) => {
            if( c.forums.length > 0 ){
                catList.push( c );
            }
            return true;
        });
        return catList;
    },

    // forum internal comment
    forComment( f ){
        return ''; //f.internalComment;
    },

    // forum icon
    forIcon( f ){
        return '';
    },

    // forum last post date badge
    //  take care of not publishing the email address
    forLastPost( f ){
        return f.dyn.rvLastPostOwner ? Forums.fn.i18n( 'forums_home.last_post', i18n.dateTime( f.pub.lastPost.createdAt ), f.dyn.rvLastPostOwner.get().label ) : '';
    },

    // send the list of forums for the current category
    //  catList has already filtered empty categories, we so are sure there is at least one forum
    //  add 'dynamic' fields
    //  - rvOwner, the owner of the lastPost if any
    //  - first, true for the first forum
    forumList( cat ){
        //console.log( 'entering forumList' );
        let forumsList = [];
        Template.instance().FRS.orderedTree.tree().every(( c ) => {
            if( c._id === cat._id ){
                let first = true;
                c.forums.every(( f ) => {
                    forumsList.push( f );
                    f.dyn = {
                        first: first,
                        rvLastPostOwner: f.pub.lastPost ? Forums.fn.preferredLabel( f.pub.lastPost.owner, AccountsTools.C.PreferredLabel.USERNAME ) : null
                    };
                    first = false;
                    return true;
                });
                return false;
            }
            return true;
        });
        return forumsList;
    },

    // i18n
    i18n( opts ){
        return Forums.fn.i18n( 'forums_home.'+opts.hash.label );
    },

    // add a .frs-top class if not the first forum of the category
    topForum( f ){
        return f.dyn.first ? '' : 'frs-top';
    },

    // route to the threads of a forum
    route( f ){
        return Forums.client.fn.routeThreads( f._id );
    }
});
