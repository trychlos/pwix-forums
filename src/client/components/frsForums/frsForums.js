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

import { pwiForums } from '../../js/index.js';
import { frsOrders } from '../../classes/frs_orders.class.js';

import '../../stylesheets/frs_forums.less';

import '../frs_breadcrumb/frs_breadcrumb.js';

import './frsForums.html';
import './frsForums.less';

Template.frsForums.onCreated( function(){
    const self = this;

    self.FRS = {
        handles: {
            forums: self.subscribe( 'frsForums.listVisible' )
        },
        orderedTree: new frsOrders()
    };
});

Template.frsForums.helpers({
    // display a archived badge if apply
    badgeArchived( f ){
        if( f.archivedAt ){
            return pwiForums.client.htmlArchivedBadge( f );
        }
    },

    // display a moderator badge
    badgeModerator( f ){
        return pwiForums.client.htmlModeratorBadge( f );
    },

    // display count of posts
    badgePosts( f ){
        return pwiForums.client.htmlPostsCountBadge( f );
    },

    // display a private badge
    badgePrivate( f ){
        return pwiForums.client.htmlPrivateBadge( f, { publicIsTransparent: false });
    },

    // display count of threads
    badgeThreads( f ){
        return pwiForums.client.htmlThreadsCountBadge( f );
    },

    // catch the current category
    //  set the background color accordingly
    catCatch( c ){
        //console.log( c );
        Template.instance().$( '.frsForums .frs-background.cat-'+c._id ).css({
            'background-color': c.color
        });
    },

    // send the list of non empty categories
    catList(){
        const self = Template.instance();
        let catList = [];
        self.FRS.orderedTree.tree.get().every(( c ) => {
            if( c.object.forumsCount > 0 ){
                catList.push( c.object );
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
        let label = '';
        if( f.lastPost ){
            const o = f.lastPost.dynOwner.get();
            label = o ? o.label : '';
        }
        return f.lastPost ? pwiForums.fn.i18n( 'forums_home.last_post', i18n.dateTime( f.lastPost.createdAt ), label ): '';
    },

    // send the list of forums for the current category
    forumList( c ){
        //console.log( 'entering forumList' );
        const self = Template.instance();
        let forums = [];
        if( self.FRS.handles.forums.ready()){
            const query = pwiForums.Forums.queryVisible();
            const fors = pwiForums.client.collections.Forums.find( query.selector );
            if( fors ){
                const fetched = fors.fetch();
                const tree = self.FRS.orderedTree.tree.get();
                for( let i=0 ; i<tree.length ; ++i ){
                    if( tree[i].id === c._id ){
                        tree[i].forums.every(( f ) => {
                            for( let j=0 ; j<fetched.length ; ++j ){
                                if( fetched[j]._id === f.id ){
                                    forums.push( fetched[j] );
                                    //console.log( fetched[j] );
                                    if( fetched[j].lastPost ){
                                        fetched[j].lastPost.dynOwner = pwiForums.fn.labelById( fetched[j].lastPost.owner, AC_USERNAME )
                                    }
                                    // set a topForum flag on all but the first forum of the category
                                    fetched[j].topForum = true;
                                    break;
                                }
                            }
                            return true;
                        });
                        break;                        
                    }
                }
            }
        }
        // remove the topForum flag from the first forum
        let f = forums[0];
        if( f ){
            f.topForum = false;
        }
        return forums;
    },

    // i18n
    i18n( opts ){
        return pwiForums.fn.i18n( 'forums_home.'+opts.hash.label );
    },

    // add a .frs-top class if not the first forum of the category
    topForum( forum ){
        return forum.topForum ? 'frs-top' : '';
    },

    // route to the threads of a forum
    route( f ){
        return pwiForums.client.fn.routeThreads( f._id );
    }
});
