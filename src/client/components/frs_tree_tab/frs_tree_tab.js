/*
 * /src/client/components/frs_tree_tab/frs_tree_tab.js
 *
 * The whole build of the tree is make the easyest possible with the frsOrders class which provides a reactive var which holds
 * all the data for the tree.
 * Unfortunately, the DOM updates are not instantaneous, and so we have to wait for each level be actually built into the DOM
 * before asking for the creation of sublevels nodes of the tree.$
 * This is athe reason for why we need a status management.
 * 
 * Params:
 * - language: 'en-US'
 *      If specified and exists, overrides the configuration value
 */
import clone from 'just-clone';
import deepEqual from 'deep-equal';
import { jstree } from 'jstree';

//import 'jstree/dist/jstree.min.js';

import { tlTolert } from 'meteor/pwix:tolert';

import { pwiForums } from '../../js/index.js';
import { frsOrders } from '../../classes/frs_orders.class.js';

import '../../stylesheets/jstree-style.css';

import '../frs_category_panel/frs_category_panel.js';
import '../frs_forum_panel/frs_forum_panel.js';

import './frs_tree_tab.html';

Template.frs_tree_tab.onCreated( function(){
    const self = this;

    self.FRS = {
        // ordered tree as an instance of the class
        orderedTree: new frsOrders( self.data.language ),

        // the dynamic of the tree load, which is status-driven
        status: {
            // 1. the status is defined as initially null as the javascript definition inside of an object cannot auto-reference itself
            // 2. the status is managed via a dedicated autorun whose first action is moving 'null' to 'WFTR' waiting for the tree be ready from the DOM point of view
            // 3. the 'ready.jstree' event reception triggers the 'WFTR'-to-'TR' transition
            //      when the tree is DOM-ready, we are able to load the first level of the tree, here the ordered categories
            //      thanks to the frsOrders reactive class, we always have something available
            // 4. as soon as we start with creating categories, the status becomes 'CLG'
            // 5. the status becomes 'CLW' when we have finished with categories creation, waiting for the DOM says it is ready
            // 6. and so the status may become 'CR': categories are ready
            // 7-8-9. the same scenario is reproduced for the forums: CR -> FLG -> FLW -> FR
            //      actually the 'FR' status (forums are ready) is just defined for the sake of consistence with categories
            //      as it is immediately transitionned to 'DONE'
            // 10. DONE
            WFTR: 'waiting_for_tree_ready',     // waiting for the tree to be ready
            TR: 'tree_ready',
            CLG: 'categories_being_loaded',     // categories are being loaded
            CLW: 'categories_loaded',           // categories have been loaded, waiting for nodes be created
            CR: 'categories_are_ready',         // categories are loaded, all nodes created
            FLG: 'forums_being_loaded',
            FLW: 'forums_loaded',
            FR: 'forums_are_ready',             // forums are loaded, all nodes created
            DONE: 'done'
        },
        workStatus: new ReactiveVar( null ),    // will be initialized in first autorun

        // keep a trace of last orderedCategories received
        lastOrderedTree: null,

        // an array of created node id's to be able to remove all
        nodesIds: [],

        // when creating the nodes, be sure we finished all the nodes we have asked for are actually created
        nodesAsked: 0,
        nodesCreated: new ReactiveVar( 0 ),

        // create a category node in the tree
        // self.$( '#frsTreeTabTree' ).jstree( true ).create_node( null, { "id":"frstree_"+c.id, "text":c.text, "children":[], "orig":"CAT" });
        // c is the category object from frsOrderedTree
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
            const titleEdit = pwiForums.fn.i18n( 'tree_tab.cat_edit', c.text );
            const titleDelete = pwiForums.fn.i18n( 'tree_tab.cat_delete', c.text );
            //console.log( titleEdit );
            const div = ''
                +'<span class="flex-grow-1">'+c.text+'</span>'
                +'<div class="frs-badges d-flex align-items-center">'
                +'    <span class="badge frs-tree-badge frs-bg-cat" title="'+labelCount+'">'+c.forums.length+'</span>'
                +'</div>'
                +'<div class="frs-buttons d-flex align-items-center">'
                +'    <button class="btn btn-sm btn-secondary frs-tree-btn frs-bg-cat frs-info" data-frs-id="C-'+c.id+'" title="'+titleInfo+'"><span class="fa-solid fa-fw fa-info"></span></button>'
                +'    <button class="btn btn-sm btn-secondary frs-tree-btn frs-bg-cat frs-edit-cat" data-frs-id="C-'+c.id+'" title="'+titleEdit+'"><span class="fa-solid fa-fw fa-pen-to-square"></span></button>'
                +'    <button class="btn btn-sm btn-secondary frs-tree-btn frs-bg-cat frs-delete-cat" data-frs-id="C-'+c.id+'"'+( self.FRS.deletableCategory( c ) ? '' : 'disabled' )+' title="'+titleDelete+'"><span class="fa-solid fa-fw fa-trash"></span></button>'
                +'</div>'
                ;
            self.$( '#frsTreeTabTree' ).jstree( true ).create_node( null, { "id":"frstree_"+c.id, "text":div, "children":[], "orig":"CAT" });
        },

        // create a forum node in the tree
        // self.$( '#frsTreeTabTree' ).jstree( true ).create_node( parent_node, { "id":"frstree_"+f.id, "text":f.text, "orig":"FOR" });
        // f here is the forum object from frsOrderedTree
        createForumNode( parent, f ){
            const div = ''
                +'<span class="flex-grow-1">'+f.text+'</span>'
                +'<div class="frs-badges d-flex align-items-center">'
                + pwiForums.client.htmlThreadsCountBadge( f.object )
                + pwiForums.client.htmlPostsCountBadge( f.object )
                +'<span class="frs-ml1"></<span>'
                + pwiForums.client.htmlPrivateBadge( f.object )
                + pwiForums.client.htmlArchivedBadge( f.object )
                +'</div>'
                +'<div class="frs-buttons d-flex align-items-center">'
                +'    <button class="btn btn-sm btn-primary frs-tree-btn frs-bg-forum frs-info" data-frs-id="F-'+f.id+'" title="'+pwiForums.fn.i18n( 'tree_tab.for_info' )+'"><span class="fa-solid fa-fw fa-info"></span></button>'
                +'    <button class="btn btn-sm btn-primary frs-tree-btn frs-bg-forum frs-edit-for" data-frs-id="F-'+f.id+'" title="'+pwiForums.fn.i18n( 'tree_tab.for_edit', f.text )+'"><span class="fa-solid fa-fw fa-pen-to-square"></span></button>'
                +'    <button class="btn btn-sm btn-primary frs-tree-btn frs-bg-forum frs-delete-for" data-frs-id="F-'+f.id+'"'+( self.FRS.deletableForum( parent, f ) ? '' : 'disabled' )+' title="'+pwiForums.fn.i18n( 'tree_tab.for_delete', f.text )+'"><span class="fa-solid fa-fw fa-trash"></span></button>'
                +'</div>';
            self.$( '#frsTreeTabTree' ).jstree( true ).create_node( parent, { "id":"frstree_"+f.id, "text":div, "orig":"FOR" });
        },

        // whether the category can be deleted
        //  - do not delete the default category
        //  - do not delete a non-empty category
        deletableCategory( c ){
            if( c.id === pwiForums.Categories.default ){
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

        // returns the list of children nodes of given (by its node id) parent
        treeChildren( $tree, id ){
            let children = [];
            //console.log( 'id', id );
            //console.log( 'node', $tree.get_node( id ));
            //console.log( 'children_dom', $tree.get_children_dom( id ));
            $tree.get_children_dom( id ).each( function( index ){
                children.push( $tree.get_node( $( this ).prop( 'id' )));
                return true;
            });
            return children;
        },

        // enumerate the nodes of the jsTree
        //  $tree: the target tree JQuery DOM element: self.$( '#frsTreeTabTree' ).jstree( true )
        //  data: {
        //      display: an optional display function
        // }
        treeEnumerate( $tree, data ){
            function f_display( level, index, node ){
                if( data && data.display && typeof data.display === 'function' ){
                    data.display( level, index, node );
                } else {
                    let prefix = '';
                    for( let i=0 ; i<level ; ++i ){
                        prefix += '  ';
                    }
                    console.log( level, index, prefix+node.text+' ('+node.id+')' );
                }
            }
            function f_rec( index, li, level=0 ){
                const $li = $( li );
                const node = $tree.get_node( $li.prop( 'id' ));
                f_display( level, index, node );
                $tree.get_children_dom( $li.prop( 'id' )).each( function( index ){
                    f_rec( index, this, 1+level );
                    return true;
                });
            }
            // li#frstree_NfYCYFqfR23M6Nuh4.jstree-node.jstree-leaf
            // li#frstree_NfYCYFqfR23M6Nuh4.jstree-node.jstree-open
            // li#frstree_NfYCYFqfR23M6Nuh4.jstree-node.jstree-closed
            //console.log( $tree.get_children_dom( '#' ));
            // have to use 'function' keyword (not an anonymous one) in order to have a local 'this'
            $tree.get_children_dom( '#' ).each( function( index ){
                f_rec( index, this );
                return true;
            });
        },

        // 'data' is the object provided by the 'move_node.jstree' event
        //  it contains { node, parent, position, old parent, old position, is_foreign, is_multi, instance, new_instance, old_instance }
        saveNewCategoriesOrder( data ){
            //self.FRS.treeEnumerate( self.$( '#frsTreeTabTree' ).jstree( true ));
            //console.log( parent );
            const selector = { type:'CAT' };
            let order = [];
            self.FRS.treeChildren( self.$( '#frsTreeTabTree' ).jstree( true ), '#' ).every(( node ) => {
                order.push({ id:node.id.replace( 'frstree_', '' ) });
                return true;
            });
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
            //self.FRS.treeEnumerate( self.$( '#frsTreeTabTree' ).jstree( true ));
            //console.log( data );
            // if old_parent and new_parent are different, we have to update the two orders
            const nodeid = data.node.id.replace( 'frstree_', '' );
            const parentid = data.parent.replace( 'frstree_', '' );
            let order = [];
            if( data.old_parent !== data.parent ){
                const found = self.FRS.orderedTree.find( nodeid, self.FRS.lastOrderedTree );
                const oldparentid = data.old_parent.replace( 'frstree_', '' );
                self.FRS.lastOrderedTree.every(( c ) => {
                    if( c.id === oldparentid ){
                        c.forums.every(( f ) => {
                            if( f.id !== nodeid ){
                                order.push({ id:f.id });
                            }
                            return true;
                        });
                        return false;
                    }
                    return true;
                });
                const selector = { type:'FOR', category:oldparentid };
                Meteor.call( 'frsOrders.upsert', selector, order, ( e, res ) => {
                    if( e ){
                        tlTolert.error({ type:e.error, message:e.reason });
                    } else {
                        console.log( '\''+selector.type+':'+selector.category+'\' new order array successfully saved' );
                        //tlTolert.success( 'New order array successfully saved' );
                    }
                });
                // change the forum's category
                Meteor.call( 'frsForums.setCategory', nodeid, parentid, ( e, res ) => {
                    if( e ){
                        tlTolert.error({ type:e.error, message:e.reason });
                    } else {
                        console.log( ' forums\'s category successfully changed' );
                    }
                });
                //console.log( self.FRS.lastOrderedTree );
                //console.log( found );
            }
            // now update new (or same)  parent order
            order = [];
            const parent_node = self.$( '#frsTreeTabTree' ).jstree( true ).get_node( data.parent );
            parent_node.children.every(( id ) => {
                order.push({ id:id.replace( 'frstree_', '' ) });
                return true;
            });
            const selector = { type:'FOR', category:parentid };
            Meteor.call( 'frsOrders.upsert', selector, order, ( e, res ) => {
                if( e ){
                    tlTolert.error({ type:e.error, message:e.reason });
                } else {
                    console.log( '\''+selector.type+':'+selector.category+'\' new order array successfully saved' );
                    //tlTolert.success( 'New order array successfully saved' );
                }
            });
        }
    };
});

Template.frs_tree_tab.onRendered( function(){
    const self = this;

    self.$( '#frsTreeTabTree' ).jstree({
        core: {
            check_callback( operation, node, node_parent, node_position, more ){
                switch( operation ){
                    case 'create_node':
                    case 'delete_node':
                        return true;
                    // a category can only be moved while its parent is 'root'
                    // while a forum cannot only be moved while it keeps a 'CAT' parent
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
        if( self.FRS.workStatus.get() === self.FRS.status.WFTR ){
            self.FRS.workStatus.set( self.FRS.status.TR );
        }
    })
    // 'create_node.jstree' data = { node, parent, position, jsTree instance }
    .on( 'create_node.jstree', ( event, data ) => {
        //console.log( 'create_node', event, data );
        //console.log( 'create_node', data.node );
        self.FRS.nodesIds.push( data.node.id );
        self.FRS.nodesCreated.set( 1+self.FRS.nodesCreated.get());
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

    // manage the status
    self.autorun(() => {
        const status = self.FRS.workStatus.get();
        //console.log( 'workStatus '+status );
        if( !status ){
            self.FRS.workStatus.set( self.FRS.status.WFTR );
        } else {
            switch( status ){
                // 2. wait for the tree be DOM-ready (transitionned by 'ready.jstree' event)
                case self.FRS.status.WFTR:
                // 3. tree is ready: the autorun will reset it and load the categories
                case self.FRS.status.TR:
                // 4. categories are being loaded, work in progress...
                case self.FRS.status.CLG:
                    break;
                // 5. categories are loaded, wait for all nodes be created in the DOM
                case self.FRS.status.CLW:
                    if( self.FRS.nodesCreated.get() === self.FRS.nodesAsked ){
                        self.FRS.workStatus.set( self.FRS.status.CR );
                    }
                    break;
                // 6. categories are ready, start with forums
                case self.FRS.status.CR:
                // 7. forums are being loaded, work in progress...
                case self.FRS.status.FLG:
                    break;
                // 8. forums are loaded, wait for all nodes be created in the DOM
                case self.FRS.status.FLW:
                    if( self.FRS.nodesCreated.get() === self.FRS.nodesAsked ){
                        self.FRS.workStatus.set( self.FRS.status.FR );
                    }
                    break;
                // 9. forums are ready, will be opened
                case self.FRS.status.FR:
                    break;
                // 10. work is all done
                // but may restart if categories are another time modified
                case self.FRS.status.DONE:
                    console.log( 'treeTab status '+status );
                    break;
            }
        }
    });

    // detect a new set of categories to reset the tree
    self.autorun(() => {
        if( self.FRS.workStatus.get() === self.FRS.status.DONE ){
            const tree = self.FRS.orderedTree.tree.get();
            if( !deepEqual( self.FRS.lastOrderedTree, tree )){
                self.FRS.workStatus.set( self.FRS.status.TR );
            }
        }
    });

    // load the ordered categories
    //  note that we must wait for the nodes be actually created to continue with the forums
    //  note also that creating the categories in the tree actually means a full reset of this same tree
    self.autorun(() => {
        if( self.FRS.workStatus.get() === self.FRS.status.TR ){
            // categories are being loaded
            self.FRS.workStatus.set( self.FRS.status.CLG );
            // reset the counters
            self.FRS.nodesAsked = 0;
            self.FRS.nodesCreated.set( 0 );
            // reset the tree
            self.$( '#frsTreeTabTree' ).jstree( true ).delete_node( self.FRS.nodesIds );
            self.FRS.nodesIds = [];
            // one parent node per category
            self.FRS.lastOrderedTree = clone( self.FRS.orderedTree.tree.get());
            self.FRS.lastOrderedTree.every(( c ) => {
                //console.log( 'loading category', cat );
                //console.log( 'category '+cat.title );
                self.FRS.nodesAsked += 1;
                // data defined at the node creation is available as node.original object
                self.FRS.createCategoryNode( c );
                return true;
            });
            // categories are loaded, waiting for nodes creation
            self.FRS.workStatus.set( self.FRS.status.CLW );
        }
    });

    // when forums are ready, attach them to the categories
    //  if we do not find the category of the forum, then attach it to the uncategorized one
    //  but this has already been taken care by the frsOrders class
    self.autorun(() => {
        if( self.FRS.workStatus.get() === self.FRS.status.CR ){
            // forums are being loaded
            self.FRS.workStatus.set( self.FRS.status.FLG );
            // reset the counters
            self.FRS.nodesAsked = 0;
            self.FRS.nodesCreated.set( 0 );
            // one child node per forum
            self.FRS.lastOrderedTree.every(( c ) => {
                //console.log( 'c', c );
                //console.log( 'c.text', c.text );
                const parent_node = self.$( '#frsTreeTabTree' ).jstree( true ).get_node( 'frstree_'+c.id );
                //console.log( 'parent_node', parent_node );
                c.forums.every(( f ) => {
                    //console.log( 'f', f );
                    //console.log( 'f.text', f.text );
                    self.FRS.nodesAsked += 1;
                    // data defined at the node creation is available as node.original object
                    self.FRS.createForumNode( parent_node, f );
                    return true;
                });
                return true;
            });
            // forums are loaded, waiting for nodes creation
            self.FRS.workStatus.set( self.FRS.status.FLW );
        }
    });

    // at the end of the initial creation of the nodes, then open all parents
    self.autorun(() => {
        if( self.FRS.workStatus.get() === self.FRS.status.FR ){
            //console.log( 'open all' );
            self.$( '#frsTreeTabTree' ).jstree( true ).open_all();
            self.FRS.workStatus.set( self.FRS.status.DONE );
        }
    })
});

Template.frs_tree_tab.helpers({
    // a label with the count of categories
    categoriesCount(){
        const self = Template.instance();
        const count = self.FRS.orderedTree.categoriesCount();
        return pwiForums.fn.i18n( count > 1 ? 'tree_tab.catcount_plural' : ( count ? 'tree_tab.catcount_singular' : 'tree_tab.catcount_none' ), count );
    },

    // a label with the count of forums
    forumsCount(){
        const self = Template.instance();
        const count = self.FRS.orderedTree.forumsCount();
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
        const o = instance.FRS.orderedTree.category( ids[1] );
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
