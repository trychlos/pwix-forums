/*
 * /src/client/components/frs_tree_tab/frs_tree_tab.js
 *
 * The whole build of the tree relies on the frsOrderedTree singleton.
 *
 * Parms:
 */

import clone from 'just-clone';
import deepEqual from 'deep-equal';
import { jstree } from 'jstree';

//import 'jstree/dist/jstree.min.js';

import { tlTolert } from 'meteor/pwix:tolert';

import { pwiForums } from '../../js/index.js';
import { frsOrderedTree } from '../../../common/classes/frs_ordered_tree.class.js';

import '../../stylesheets/jstree-style.css';

import '../frs_category_panel/frs_category_panel.js';
import '../frs_forum_panel/frs_forum_panel.js';

import './frs_tree_tab.html';

const ST_NONE = 'jstree: waiting for the initial DOM be ready';
const ST_TREE_READY = 'jstree: initial DOM is ready';
const ST_TREE_TOBEREBUILT = 'jstree: to be rebuilt';
const ST_CATEGORIES_INSERTED = 'jstree: categories inserted, waiting for the DOM be ready';
const ST_INSERT_FORUMS = 'jstree: inserting forums';
const ST_FORUMS_INSERTED = 'jstree: forums inserted, waiting for the DOM be ready';
const ST_TREE_DONE = 'jstree: done';

Template.frs_tree_tab.onCreated( function(){
    const self = this;

    self.FRS = {
        orderedTree: new frsOrderedTree(),                  // ordered tree
        previousTree: null,
        status: new ReactiveVar( null ),                    // the current build status
        createdNodesArray: [],                              // a flat list of all created nodes ids, used when emptying the tree
        createdNodesCount: new ReactiveVar( 0 ),
        createdNodesAsked: 0,

        // create a category node in the tree
        // self.$( '#frsTreeTabTree' ).jstree( true ).create_node( null, { "id":"frstree_"+c.id, "text":c.text, "children":[], "orig":"CAT" });
        // c is the category document read from frsOrderedTree
        /*
         * doesn't work
         * the dropdown menu is rightly shown, but unable to get the focus
        <div class="dropdown-menu frs-form show" data-popper-placement="bottom-end" style="position: absolute; inset: 0px 0px auto auto; margin: 0px; transform: translate3d(-38.5px, 36.5px, 0px);">            <form>            <table>                <tbody><tr>                    <td class="frs-right"><label for="" class="form-label form-label-sm">Title</label></td>                    <td><input type="text" class="form-control form-control-sm" id="" placeholder="Object title" value="Another one"></td>                </tr>                <tr>                    <td class="frs-right frs-top"><label for="" class="form-label form-label-sm">Description</label></td>                    <td><textarea class="form-control form-control-sm" placeholder="Object description" rows="2">Which acts as a second by the matter</textarea></td>                </tr>                <tr>                    <td colspan="2" class="frs-right"><button class="btn btn-primary btn-sm frs-edit-cat" data-frs-id="C-G2wWkDc6YcJ2MXT7p">Save</button></td>                </tr>            </tbody></table>            </form>        </div>
        */
       // actually all the 'text' of a node will goes inside of <a>..</a> tags. May perfectly be full HTML
       createCategoryNode( c ){
            //console.log( c );
            const labelCount = pwiForums.fn.i18n( 'tree_tab.for_count' );
            const titleInfo = pwiForums.fn.i18n( 'tree_tab.cat_info' );
            const titleEdit = pwiForums.fn.i18n( 'tree_tab.cat_edit', c.title );
            const titleDelete = pwiForums.fn.i18n( 'tree_tab.cat_delete', c.title );
            //console.log( titleEdit );
            const div = ''
                +'<div class="d-flex align-items-center flex-grow-1">'
                +'    <span>'+c.title+'</span>'
                +'    <span class="frs-ml1"></span>'
                +'    <span class="badge frs-badge-btn frs-ml025" title="'+pwiForums.fn.i18n( 'tree_tab.cat_color' )+'" style="background-color:'+c.color+';">&nbsp;</span>'
                +'</div>'
                +'<div class="frs-badges d-flex align-items-center frs-ml1">'
                +'    <span class="badge frs-badge-btn frs-bg-cat frs-ml025" title="'+labelCount+'">'+c.forums.length+'</span>'
                +'</div>'
                +'<div class="frs-buttons d-flex align-items-center frs-ml1">'
                +'    <button class="btn btn-sm btn-secondary frs-bg-cat frs-ml025 frs-info" data-frs-id="C-'+c._id+'" title="'+titleInfo+'"><span class="fa-solid fa-fw fa-info"></span></button>'
                +'    <button class="btn btn-sm btn-secondary frs-bg-cat frs-ml025 frs-edit-cat" data-frs-id="C-'+c._id+'" title="'+titleEdit+'"><span class="fa-solid fa-fw fa-pen-to-square"></span></button>'
                +'    <button class="btn btn-sm btn-secondary frs-bg-cat frs-ml025 frs-delete-cat" data-frs-id="C-'+c._id+'"'+( self.FRS.deletableCategory( c ) ? '' : 'disabled' )+' title="'+titleDelete+'"><span class="fa-solid fa-fw fa-trash"></span></button>'
                +'</div>'
                ;
            self.$( '#frsTreeTabTree' ).jstree( true ).create_node( null, { "id": "frstree_"+c._id, "text": div, "children": [], "orig": "CAT", "doc": c });
        },

        // create a forum node in the tree
        // self.$( '#frsTreeTabTree' ).jstree( true ).create_node( parent_node, { "id":"frstree_"+f.id, "text":f.text, "orig":"FOR" });
        // f here is the forum object from frsOrderedTree
        createForumNode( parent, f ){
            //console.log( f );
            const div = ''
                +'<span class="flex-grow-1">'+f.title+'</span>'
                +'<div class="frs-badges d-flex align-items-center frs-ml1">'
                +   pwiForums.client.htmlModerationStrategyBadge( f )
                +   '<span class="frs-ml025"></span>'
                +   pwiForums.client.htmlThreadsCountBadge( f )
                +   '<span class="frs-ml025"></span>'
                +   pwiForums.client.htmlPostsCountBadge( f )
                +   '<span class="frs-ml1"></span>'
                +   pwiForums.client.htmlPrivateBadge( f )
                +   '<span class="frs-ml025"></span>'
                +   pwiForums.client.htmlArchivedBadge( f )
                +'</div>'
                +'<div class="frs-buttons d-flex align-items-center frs-ml1">'
                +'    <button class="btn btn-sm btn-primary frs-bg-forum frs-ml025 frs-info" data-frs-id="F-'+f._id+'" title="'+pwiForums.fn.i18n( 'tree_tab.for_info' )+'"><span class="fa-solid fa-fw fa-info"></span></button>'
                +'    <button class="btn btn-sm btn-primary frs-bg-forum frs-ml025 frs-edit-for" data-frs-id="F-'+f._id+'" title="'+pwiForums.fn.i18n( 'tree_tab.for_edit', f.title )+'"><span class="fa-solid fa-fw fa-pen-to-square"></span></button>'
                +'    <button class="btn btn-sm btn-primary frs-bg-forum frs-ml025 frs-delete-for" data-frs-id="F-'+f._id+'"'+( self.FRS.deletableForum( parent, f ) ? '' : 'disabled' )+' title="'+pwiForums.fn.i18n( 'tree_tab.for_delete', f.title )+'"><span class="fa-solid fa-fw fa-trash"></span></button>'
                +'</div>';
            self.$( '#frsTreeTabTree' ).jstree( true ).create_node( parent, { "id": "frstree_"+f._id, "text": div, "orig":"FOR", "doc": f });
        },

        // whether the category can be deleted
        //  - do not delete the default category
        //  - do not delete a non-empty category
        deletableCategory( c ){
            if( c._id === pwiForums.Categories.default ){
                return false;
            }
            if( c.forums && c.forums.length ){
                return false;
            }
            return true;
        },

        // whether the forum can be deleted ?
        deletableForum( parent, f ){
            return true;
        },

        // 'data' is the object provided by the 'move_node.jstree' event
        //  it contains { node, parent, position, old parent, old position, is_foreign, is_multi, instance, new_instance, old_instance }
        saveNewCategoriesOrder( data ){
            //self.FRS.treeEnumerate( self.$( '#frsTreeTabTree' ).jstree( true ));
            //console.log( parent );
            const selector = { type: 'CAT' };
            const order = self.FRS.treeChildren( self.$( '#frsTreeTabTree' ).jstree( true ), '#' );
            //console.log( order );
            Meteor.call( 'frsOrders.upsert', selector, order, ( e, res ) => {
                if( e ){
                    tlTolert.error({ type:e.error, message:e.reason });
                } else {
                    console.log( '\''+selector.type+'\' new order array successfully saved' );
                }
            });
        },

        // 'data' is the object provided by the 'move_node.jstree' event
        //  it contains { node, parent, position, old_parent, old position, is_foreign, is_multi, instance, new_instance, old_instance }
        //  + if the category has been changed (parents are different)
        //      - set the new category forum's order
        //      - remove the forum from the old category forum's order
        //      - update the category of the forum
        //  + if the category is not changed (parents are same)
        //      - set the category forum's order
        saveNewForumsOrder( data ){
            //console.log( data );
            const parms = {
                forum: data.node.id.replace( 'frstree_', '' ),
                newcat: data.parent.replace( 'frstree_', '' ),
                newcatorder: self.FRS.treeChildren( self.$( '#frsTreeTabTree' ).jstree( true ), data.parent ),
                prevcat: data.old_parent.replace( 'frstree_', '' ),
                prevcatorder: self.FRS.treeChildren( self.$( '#frsTreeTabTree' ).jstree( true ), data.old_parent )
            };
            // have to set the new order of the current category
            // if old_parent and new_parent are different, we have to:
            //  - set the new order of the previous category
            //  - update the forum category
            Meteor.call( 'frsOrders.postMove', parms, ( e, res ) => {
                if( e ){
                    tlTolert.error({ type:e.error, message:e.reason });
                } else {
                    console.log( 'new order array successfully saved', res );
                }
            });
        },

        // returns the list of children nodes of given (by its node id) parent
        //  list is returned as an array of { id: <id> } objects
        treeChildren( $tree, parentId ){
            let children = [];
            $tree.get_node( parentId ).children.every(( id ) => {
                children.push({ id: id.replace( 'frstree_', '' )});
                return true;
            });
            return children;
        }
    };
});

Template.frs_tree_tab.onRendered( function(){
    const self = this;

    self.FRS.status.set( ST_NONE );

    // trace the successive status
    self.autorun(() => {
        console.log( self.FRS.status.get());
    });

    self.$( '#frsTreeTabTree' ).jstree({
        core: {
            check_callback( operation, node, node_parent, node_position, more ){
                switch( operation ){
                    case 'create_node':
                    case 'delete_node':
                        return true;
                    // a category can only be moved while its parent is 'root'
                    // while a forum can only be moved while it keeps a 'CAT' parent
                    case 'move_node':
                        //console.log( 'check_callback', arguments );
                        switch( node.original.orig ){
                            case 'CAT':
                                return node_parent.id === '#';
                            case 'FOR':
                                if( node_parent.id === '#' ){
                                    return false;
                                }
                                //console.log( 'check_callback', node.original.orig, node_parent.original ? 'orig:'+node_parent.original.orig : 'id:'+node_parent.id );
                                return node_parent.original.orig === 'CAT';
                        }
                        return true;
                    default:
                        return false;
                }
            }
        },
        plugins: [
            'dnd',
            'wholerow'
        ]
    })
    // 'ready.jstree' data = jsTree instance
    .on( 'ready.jstree', ( event, data ) => {
        //console.log( 'jstree ready', event, data );
        if( self.FRS.status.get() === ST_NONE ){
            self.FRS.status.set( ST_TREE_READY );
        }
    })
    // 'create_node.jstree' data = { node, parent, position, jsTree instance }
    .on( 'create_node.jstree', ( event, data ) => {
        self.FRS.createdNodesArray.push( data.node.id );
        self.FRS.createdNodesCount.set( 1+self.FRS.createdNodesCount.get());
        //console.log( 'asked', self.FRS.createdNodesAsked, 'count', self.FRS.createdNodesCount.get());
    })
    // 'move_node.jstree' data = { node, parent, position, old parent, old position, is_foreign, is_multi, instance, new_instance, old_instance }
    .on( 'move_node.jstree', ( event, data ) => {
        //console.log( 'move_node', event, data );
        if( data.node.original.orig === 'CAT' ){
            self.FRS.saveNewCategoriesOrder( data );
        }
        if( data.node.original.orig === 'FOR' ){
            self.FRS.saveNewForumsOrder( data );
        }
    });

    // rebuild the whole tree each time the ordered tree is changed
    self.autorun(() => {
        if( self.FRS.status.get() === ST_TREE_READY || self.FRS.status.get() === ST_TREE_DONE ){
            const tree = self.FRS.orderedTree.tree();
            if( !deepEqual( tree, self.FRS.previousTree )){
                self.FRS.previousTree = clone( tree );
                self.FRS.status.set( ST_TREE_TOBEREBUILT );
            }
        }
    });

    // rebuild the whole tree each time the ordered tree is changed
    self.autorun(() => {
        if( self.FRS.status.get() === ST_TREE_TOBEREBUILT ){
            // reset the tree
            self.$( '#frsTreeTabTree' ).jstree( true ).delete_node( self.FRS.createdNodesArray );
            self.FRS.createdNodesArray = [];
            // rebuild the tree
            self.FRS.createdNodesAsked = self.FRS.previousTree.length;
            self.FRS.createdNodesCount.set( 0 );
            self.FRS.previousTree.every(( c ) => {
                self.FRS.createCategoryNode( c );
                return true;
            });
            self.FRS.status.set( ST_CATEGORIES_INSERTED );
        }
    });

    // after categories have been inserted at the first level, time to insert the forums
    self.autorun(() => {
        if( self.FRS.status.get() === ST_CATEGORIES_INSERTED && self.FRS.createdNodesCount.get() === self.FRS.createdNodesAsked ){
            self.FRS.status.set( ST_INSERT_FORUMS );
            self.FRS.createdNodesAsked = 0;
            self.FRS.createdNodesCount.set( 0 );
            self.FRS.previousTree.every(( c ) => {
                self.FRS.createdNodesAsked += c.forums.length;
                const parent_node = self.$( '#frsTreeTabTree' ).jstree( true ).get_node( 'frstree_'+c._id );
                //console.log( parent_node );
                c.forums.every(( f ) => {
                    self.FRS.createForumNode( parent_node, f );
                    return true;
                });
                return true;
            });
            self.FRS.status.set( ST_FORUMS_INSERTED );
        }
    });

    // when forums have been successfully inserted
    self.autorun(() => {
        if( self.FRS.status.get() === ST_FORUMS_INSERTED && self.FRS.createdNodesCount.get() === self.FRS.createdNodesAsked ){
            self.$( '#frsTreeTabTree' ).jstree( true ).open_all();
            self.FRS.status.set( ST_TREE_DONE );
        }
    });
});

Template.frs_tree_tab.helpers({
    // a label with the count of categories
    categoriesCount(){
        const self = Template.instance();
        const count = self.FRS.orderedTree.categoriesCount();
        return pwiForums.fn.i18n( count > 1 ? 'tree_tab.catcount_plural' : ( count ? 'tree_tab.catcount_singular' : 'tree_tab.catcount_none' ), count );
    },

    // a label with the total count of forums
    forumsCount(){
        const self = Template.instance();
        const count = self.FRS.orderedTree.forumsCountAll();
        return pwiForums.fn.i18n( count > 1 ? 'tree_tab.forcount_plural' : ( count ? 'tree_tab.forcount_singular' : 'tree_tab.forcount_none' ), count );
    },

    // get a translated label
    i18n( opts ){
        return pwiForums.fn.i18n( 'tree_tab.'+opts.hash.label );
    }
});

Template.frs_tree_tab.events({
    'click .frs-delete-cat'( event, instance ){
        const ids = instance.$( event.currentTarget ).data( 'frs-id' ).split( '-' );
        const o = instance.FRS.orderedTree.category( ids[1] );
        //console.log( 'frs-delete', ids );
        pwixBootbox.confirm(
            pwiForums.fn.i18n( 'tree_tab.cat_confirm_delete', o.title ), function( ret ){
                if( ret ){
                    console.log( 'calling frsCategories.delete for \''+o.title+'\' category' );
                    Meteor.call( 'frsCategories.delete', o._id, ( e, res ) => {
                        if( e ){
                            tlTolert.error({ type:e.error, message:e.reason });
                        } else {
                            tlTolert.success( pwiForums.fn.i18n( 'tree_tab.cat_deleted', o.title ) );
                        }
                    });
                }
            }
        );
    },

    'click .frs-delete-for'( event, instance ){
        const ids = instance.$( event.currentTarget ).data( 'frs-id' ).split( '-' );
        const o = instance.FRS.orderedTree.forum( ids[1] );
        //console.log( 'frs-delete', ids );
        pwixBootbox.confirm(
            pwiForums.fn.i18n( 'tree_tab.for_confirm_delete', o.title ), function( ret ){
                if( ret ){
                    console.log( 'calling frsForums.delete for \''+o.title+'\' forum' );
                    Meteor.call( 'frsForums.delete', o._id, ( e, res ) => {
                        if( e ){
                            tlTolert.error({ type:e.error, message:e.reason });
                        } else {
                            tlTolert.success( pwiForums.fn.i18n( 'tree_tab.for_deleted', o.title ) );
                        }
                    });
                }
            }
        );
    },

    // edit a category
    'click .frs-edit-cat'( event, instance ){
        const ids = instance.$( event.currentTarget ).data( 'frs-id' ).split( '-' );
        console.log( ids, instance.FRS.orderedTree.category( ids[1] ));
        //let o = instance.FRS.orderedTree.category( ids[1] );
        //Blaze.renderWithData( Template.frs_category_panel, { cat: o }, $( 'body' )[0] );
        pwixModal.run({
            mdBody: 'frs_category_panel',
            mdTitle: pwiForums.fn.i18n( 'category_edit.modal_edit' ),
            mdButtons: [ MD_BUTTON_CANCEL, MD_BUTTON_SAVE ],
            cat: instance.FRS.orderedTree.category( ids[1] )
        });
        return false;
    },

    // edit a forum
    'click .frs-edit-for'( event, instance ){
        const ids = instance.$( event.currentTarget ).data( 'frs-id' ).split( '-' );
        //let o = instance.FRS.orderedTree.forum( ids[1] );
        //Blaze.renderWithData( Template.frs_forum_panel, { forum: o }, $( 'body' )[0] );
        pwixModal.run({
            mdBody: 'frs_forum_panel',
            mdTitle: pwiForums.fn.i18n( 'forum_edit.modal_edit' ),
            mdButtons: [ MD_BUTTON_CANCEL, MD_BUTTON_SAVE ],
            mdClasses: "modal-lg",
            forum: instance.FRS.orderedTree.forum( ids[1] )
        });
        return false;
    },

    // object standard informations
    'click .frs-info'( event, instance ){
        const ids = instance.$( event.currentTarget ).data( 'frs-id' ).split( '-' );
        let object = null;
        let title = null;
        //console.log( 'frs-info', ids );
        switch( ids[0] ){
            case 'C':
                object = instance.FRS.orderedTree.category( ids[1] );
                title = pwiForums.fn.i18n( 'tree_tab.cat_info' );
                break;
            case 'F':
                object = instance.FRS.orderedTree.forum( ids[1] );
                title = pwiForums.fn.i18n( 'tree_tab.for_info' );
                break;
        }
        if( object ){
            //console.log( object );
            Blaze.renderWithData( Template.miDialog, { object: object, name: object.title, title: title }, $( 'body' )[0] );
        }
        return false;
    },

    // new category
    'click .frs-new-category'( event, instance ){
        pwixModal.run({
            mdBody: 'frs_category_panel',
            mdTitle: pwiForums.fn.i18n( 'category_edit.modal_new' ),
            mdButtons: [ MD_BUTTON_CANCEL, MD_BUTTON_SAVE ],
            cat: null
        });
        return false;
    },

    // new forum
    'click .frs-new-forum'( event, instance ){
        pwixModal.run({
            mdBody: 'frs_forum_panel',
            mdTitle: pwiForums.fn.i18n( 'forum_edit.modal_new' ),
            mdButtons: [ MD_BUTTON_CANCEL, MD_BUTTON_SAVE ],
            mdClasses: "modal-lg",
            forum: null
        });
        return false;
    },
});
