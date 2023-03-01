/*
 * /src/common/classes/frs_orders.class.js
 *
 * This class manages the orders or categories and forums.
 * 
 * Not only it reads and updates the Orders collection itself, but also take care of taking into account:
 *  - unordered categories
 *  - unordered and/or uncategorized forums.
 * 
 * The class exposes one public reactive var:
 * - tree: an array of objects
 *      {
 *          'id':       id,
 *          'text':     text,
 *          'object':   frsCategory object,
 *          'forums': [
 *              {
 *                  'id':       id,
 *                  'text':     text
 *                  'object':   frsForum object
 *              }
 *          ]
 *      }
 *  Per definition, the first level (at index zero) is only categories, and the second level is only forums.
 * 
 *  NB: for security reasons, and because this singleton is built on the client, it only contains the items the
 *  user is allowed to see. As a consequence, it may be incomplete. As a consequence of the consequence, there
 *  is no try to 'repair' incomplete orders if the user is not a forum administrator.
 */

import deepEqual from 'deep-equal';
import { ReactiveVar } from 'meteor/reactive-var';
import { Tracker } from 'meteor/tracker';

import { pwiRoles } from 'meteor/pwix:roles';
import { tlTolert } from 'meteor/pwix:tolert';

import { pwiForums } from '../js/index.js';

export class frsOrders {

    // static data
    //
    static Singleton = null;

    // private data
    //
    _priv = {
        categories: {
            handle: null,
            collection: new ReactiveVar( [] ),
            set: new ReactiveVar( false ),
        },
        forums: {
            handle: null,
            query: new ReactiveVar( null ),
            collection: new ReactiveVar( [] ),
            set: new ReactiveVar( false )
        },
        orders: {
            handle: null,
            collection: new ReactiveVar( [] ),
            set: new ReactiveVar( false )
        },
        handle: Meteor.subscribe( 'frsOrders.listTree' )
    };

    // private functions
    //

    /*
     * @returns {Object} a { _id, title } object for the default category
     */
    _defaultCategory(){
        const title = pwiForums.fn.i18n( 'manager.default_category_label' );
        return {
            _id: pwiForums.Categories.default,
            title: title,
            object: {
                _id: pwiForums.Categories.default,
                title: title
            },
            forums: []
        };
    }

    // whether the user is allowed to try to repair the orders
    _isAllowed(){
        if( !Meteor.userId()){
            return false;
        }
        return pwiRoles.userIsInRoles( Meteor.userId(), 'FRS_ADMIN' );
    }

    // public data
    //
    tree = new ReactiveVar( [], ( a, b ) => { return JSON.stringify( a ) === JSON.stringify( b ); });

    /**
     * Constructor
     * @returns {frsOrders}
     */
    constructor(){
        if( frsOrders.Singleton ){
            return frsOrders.Singleton;
        }

        const self = this;

        // subscribe to our collections at instanciation time
        Tracker.autorun(() => {
            self._priv.categories.handle = Meteor.subscribe( 'frsCategories.listAll' );
            self._priv.forums.query.set( pwiForums.Forums.queryReadables( Meteor.userId()));
            self._priv.forums.handle = Meteor.subscribe( 'frsForums.byQuery', self._priv.forums.query.get());
            self._priv.orders.handle = Meteor.subscribe( 'frsOrders.listAll' );
        })

        // we keep as intern reactive vars the records read from our collections
        Tracker.autorun(() => {
            if( self._priv.categories.handle.ready()){
                self._priv.categories.collection.set( pwiForums.client.collections.Categories.find().fetch() || [] );
                console.log( 'frsCategories', self._priv.categories.collection.get());
                self._priv.categories.set.set( true );
            }
        });
        Tracker.autorun(() => {
            if( self._priv.forums.handle.ready()){
                const query = pwiForums.Forums.queryReadables( Meteor.userId());
                self._priv.forums.collection.set( pwiForums.client.collections.Forums.find( query.selector ).fetch() || [] );
                console.log( 'frsForums', self._priv.forums.collection.get());
                self._priv.forums.set.set( true );
            }
        });
        Tracker.autorun(() => {
            if( self._priv.orders.handle.ready()){
                self._priv.orders.collection.set( pwiForums.client.collections.Orders.find().fetch() || [] );
                console.log( 'frsOrders', self._priv.orders.collection.get());
                self._priv.orders.set.set( true );
            }
        });

        // as soon as a category, a forum or an order has been updated, we rebuild all our ordered tree
        // this is a full (re)build of both:
        //  - the ordered tree as an array of { id, text, forums } objects
        //  - the list of updates to be done in our collections:
        //      + maybe the categories must be reorderd
        //      + maybe a forum must be attached to another category (in this case, always to 'uncategorized')
        //      + maybe the 'Uncategorized' category must be added to the collection
        Tracker.autorun(() => {
            if( self._priv.categories.set.get() && self._priv.forums.set.get() && self._priv.orders.set.get()){
                let build = { tree:[], orders:[], forums:[], defaultFound:false };

                // build the ordered list of categories, including existing categories, plus the default category, plus the unordered categories at the end
                // the recorded order of categories is the master of the order, though it may be uncomplete or super-complete
                // (for example not contain some new categories, or contain no more existing categories)
                //  - catsOrder: the 'order' field of the CAT record from the Orders collection
                //  - catsCollection: the fetched Categories collection
                //  > updates the function-global 'build' object
                function f_buildFromCategories( catsOrder, catsCollection ){

                    // push a new category both in the tree and in the merge
                    function f_pushCat( cat ){
                        const o = { id:cat._id, text:cat.title, object:cat, forums: [] };
                        build.tree.push({ ...o });
                    }
                    // build from ordered existing categories
                    //console.log( 'catsOrder', catsOrder );
                    //console.log( 'catsCollection', catsCollection );
                    catsOrder.every(( ord ) => {
                        if( cat = f_findCategory( catsCollection, ord.id )) {
                            //console.log( 'found cat', cat );
                            cat.ordered = true;
                            f_pushCat( cat );
                        }
                        return true;
                    });
                    // add unordered categories
                    catsCollection.every(( cat ) => {
                        if( !cat.ordered ){
                            f_pushCat( cat );
                        }
                        return true;
                    });
                    // make sure the default category is included
                    build.tree.every(( c ) => {
                        if( c.id === pwiForums.Categories.default ){
                            build.defaultFound = true;
                            return false;
                        }
                        return true;
                    });
                    if( !build.defaultFound ){
                        f_pushCat( self._defaultCategory());
                    }
                }
    
                // starting from the first step build with categories, increment it with the forums list
                // the category set in the forum itself is the first indicator of the category rattachment
                // if the forum is not orderd, it is then attached at the end of list of the category
                //  - orders: the fetched Orders collection
                //  - forums: the fetched Forums collection
                //  > updates the function-global 'build' object
                function f_buildFromForums( orders, forums ){
                    // list of forums and forums orders which need to be fixed
                    let orderErrs = {};
                    let forumErrs = {};
                    // iterate through the already ordered categories
                    build.tree.every(( c ) => {
                        let errs = 0;
                        // find the forums attached to each category
                        let catForums = [];
                        forums.every(( f ) => {
                            if( f.category === c.id ){
                                catForums.push( f );
                            }
                            return true;
                        });
                        // and then, each found forum must be attached in the expected order
                        const forumsOrder = f_findOrder( orders, 'FOR', c.id );
                        // and attach forums in that order
                        forumsOrder.every(( ord ) => {
                            const forum = f_findForum( catForums, ord.id );
                            if( forum ){
                                c.forums.push({ id:forum._id, text:forum.title, object:forum });
                                forum.ordered = true;
                            } else {
                                orderErrs[c.id] = true;     // the ordered list contains a no more existing forum -> to be rewritten
                            }
                            return true;
                        });
                        // and verify that each forums attached to the category is ordered
                        catForums.every(( f ) => {
                            if( !f.ordered ){
                                c.forums.push({ id:f._id, text:f.title, object:f });
                                f.ordered = true;
                                orderErrs[c.id] = true;     // a forum is not ordered in the list -> to be rewritten
                            }
                            return true;
                        });
                        //console.log( c.id, c.text, 'catForums', catForums, 'forumsOrder', forumsOrder, 'errs='+orderErrs[c.id] );
                        return true;
                    });
                    // all forums attached to an existing category have been dealt with
                    //  others forums (attached to a no more existing category or not attached at all) are set to Uncategorized
                    //  implies that both these forums and the Uncategorized category have to be changed
                    build.tree.every(( c ) => {
                        if( c.id === pwiForums.Categories.default ){
                            //console.log( 'forums', forums );
                            forums.every(( f ) => {
                                if( !f.ordered ){
                                    //console.log( f );
                                    f.category = pwiForums.Categories.default;
                                    c.forums.push({ id:f._id, text:f.title, object:f });
                                    orderErrs[c.id] = true;
                                    forumErrs[f._id] = true;
                                }
                                return true;
                            });
                        }
                        return true;
                    });
                    //console.log( 'forums not ordered', notOrdered );
                    //console.log( 'forums bad category', badCategory );
                    //console.log( 'orderErrs', Object.keys( orderErrs ).length );
                    //console.log( 'forumErrs', Object.keys( forumErrs ).length );
                    // at the and, we have to prepare new orders and forums records to fix the detected errors
                    Object.keys( orderErrs ).every(( k ) => {
                        build.orders.push({ selector: { type:'FOR', category:k }, modifier:f_forumsOrder( k ) });
                        return true;
                    });
                    Object.keys( forumErrs ).every(( k ) => {
                        build.forums = Object.keys( forumErrs ).slice();
                        return true;
                    });
                }
    
                /*
                // clean up the built tree, removing the empty categories
                //  + set a forumsCount on remaining (non empty) categories
                function f_cleanUpInvisible(){
                    let newTree = [];
                    build.tree.every(( c ) => {
                        if( c.forums.length > 0 ){
                            c.object.forumsCount = c.forums.length;
                            newTree.push( c );
                        }
                        return true;
                    });
                    build.tree = [ ...newTree ];
                }
                */

                // return the category specified as a Category record, or null
                function f_findCategory( categories, id ){
                    let found = null;
                    categories.every(( cat ) => {
                        if( cat._id === id ){
                            found = cat;
                            return false;
                        }
                        return true;
                    });
                    return found;
                }
    
                // return the forum specified as a Forum record, or null
                function f_findForum( forums, id ){
                    let found = null;
                    forums.every(( f ) => {
                        if( f._id === id ){
                            found = f;
                            return false;
                        }
                        return true;
                    });
                    return found;
                }

                // return the order field of the found Order record
                function f_findOrder( orders, type, cat ){
                    let found = null;
                    orders.every(( ord ) => {
                        if( ord.type === type && ( type === 'CAT' || ord.category === cat )){
                            found = ord;
                            return false;
                        }
                        return true;
                    });
                    return found ? found.order : [];
                }

                // return the built forums order for the 'id' category
                //  > as a list of { id:id } suitable to go to Orders collection
                function f_forumsOrder( id ){
                    let ret = [];
                    build.tree.every(( o ) => {
                        if( o.id === id ){
                            o.forums.every(( f ) => {
                                ret.push({ id:f.id });
                                return true;
                            });
                            return false;
                        }
                        return true;
                    });
                    return ret;
                }

                // set the forumsCount on the Categories object
                // this is actually a dynamic variable which mainly depends of the user permissions
                function f_setForumsCount(){
                    build.tree.every(( c ) => {
                        c.object.forumsCount = c.forums.length;
                        return true;
                    });
                }

                // update the categories if the default if not yet recorded
                //  this is safe, but at least requires a connected user
                function f_updateCategories( found ){
                    if( !found && Meteor.userId()){
                        const o = self._defaultCategory();
                        Meteor.call( 'frsCategories.upsert', o, ( err, res ) => {
                            if( err ){
                                console.error( err );
                            } else {
                                console.log( 'frsCategories.upsert successful', o, 'res', res );
                            }
                        })
                    }
                }

                // update the forums to setup the category we have modified to go into the tree
                // either because the initial category no more exists, or because there is not yet any category registered
                // in all case, the new category is the 'Uncategorized' default one
                function f_updateForums( updates ){
                    //console.log( updates );
                    if( self._isAllowed()){
                        updates.every(( id ) => {
                            Meteor.call( 'frsForums.setCategory', id, ( err, res ) => {
                                if( err ){
                                    console.error( err );
                                } else {
                                    console.log( 'frsForums.setCategory id='+id, 'res', res );
                                }
                            })
                            return true;
                        });
                    }
                }
    
                // update the orders to setup new order we may have to rebuild
                //  - origOrder: the original order for the 'CAT' type as read from the Orders collection
                //  - forumsOrders: an array of updates to do in 'FOR' forums orders for their respective category
                function f_updateOrders( origOrder, forumsOrders ){
                    if( self._isAllowed()){
                        let newOrder = [];
                        build.tree.every(( c ) => {
                            //console.log( c );
                            newOrder.push({ id:c.id });
                            return true;
                        });
                        if( !deepEqual( newOrder, origOrder )){
                            //console.log( "Meteor.call( 'frsOrders.upsert', { type:'CAT' }", newOrder );
                            Meteor.call( 'frsOrders.upsert', { type:'CAT' }, newOrder, ( err, res ) => {
                                if( err ){
                                    console.error( err );
                                } else {
                                    console.log( 'frsOrders.upsert \'CAT\' modifier', newOrder, 'res', res );
                                }
                            });
                        }
                        forumsOrders.every(( o ) => {
                            Meteor.call( 'frsOrders.upsert', o.selector, o.modifier, ( err, res ) => {
                                if( err ){
                                    console.error( err );
                                } else {
                                    console.log( 'frsOrders.upsert', 'selector', o.selector, 'modifier', o.modifier, 'res', res );
                                }
                            });
                            return true;
                        });
                    }
                }
    
                //console.log( 'frsOrders.tree full rebuild begin')
                const ordersCollection = self._priv.orders.collection.get();            // read orders from collection
                const catsOrder = f_findOrder( ordersCollection, 'CAT' );               // the categories order (from collection)
                f_buildFromCategories( catsOrder, self._priv.categories.collection.get());
                f_buildFromForums( ordersCollection, self._priv.forums.collection.get());
                f_setForumsCount();
                console.log( 'build', build );
                self.tree.set( build.tree );
                f_updateCategories( build.defaultFound );
                f_updateForums( build.forums );
                f_updateOrders( catsOrder, build.orders );
                //console.log( 'frsOrders.tree full rebuild end')
            }
        });

        frsOrders.Singleton = this;
        return this;
    }

    /*
     * Save the result of a move up/down
     */
    _saveMove( isCategory, parentId, order ){
        const selector = isCategory ? { type:'CAT' } : { type:'FOR', category:parentId };
        Meteor.call( 'frsOrders.upsert', selector, order, ( e, res ) => {
            if( e ){
                tlTolert.error({ type:e.error, message:e.reason });
            } else {
                console.log( '\''+selector.type+'\' order array successfully saved' );
            }
        });
    }

    /*
     * Recursively search for the given id inside of the ordered tree
     * @returns {Object} { found, array, pos, index, rec, parent }
     *  if not found:
     *      - found is false
     *      - array is null
     *      - pos is zero
     *      - index is -1
     *      - rec is undefined
     *  if found:
     *      - pos = -1 for the first, +1 for the last, 0 else
     */
    _searchRec( id, tree=null ){
        // the recursive search function
        function f_search( array, id ){
            let ret = { found:false, array:null, pos:0, index:-1 };
            for( let idx=0 ; idx<array.length ; ++idx ){
                if( array[idx].id === id ){
                    ret.found = true;
                    ret.index = idx;
                    ret.array = array.slice();
                    if( idx === 0 ){
                        ret.pos = -1;
                    } else if( idx === array.length-1 ){
                        ret.pos = 1;
                    } else {
                        ret.pos = 0;
                    }
                    break;
                }
            }
            return ret;
        }
        // search inside of categories
        if( !tree ){
            tree = this.tree.get();
        }
        //console.log( tree );
        let rec = 0;
        let parent = null;
        let ret = f_search( tree, id );
        if( !ret.found ){
            // search in each category children for forums id's
            rec += 1;
            tree.every(( o ) => {
                if( o.forums ){
                    parent = o;
                    ret = f_search( o.forums, id );
                    if( ret.found ){
                        return false;
                    }
                }
                return true;
            });
        }
        if( !ret.found ){
            //console.error( 'frsOrders:searchRec() id \''+id+'\' not found' );   // may be expected after a delete
            console.log( 'frsOrders:searchRec() id \''+id+'\' not found' );
        }
        ret.rec = rec;          // recursivity count
        ret.parent = parent;    // the parent object
        return ret;
    }

    /*
     * Convert an array of tree nodes to an array of orders suitable for the Orders collection
     */
    _toOrder( array ){
        let ret = [];
        array.every(( o ) => {
            ret.push({ id:o.id });
            return true;
        });
        return ret;
    }

    /**
     * @returns {Array} the list of registered categories
     */
    categories(){
        return this._priv.categories.collection.get();
    }

    /**
     * @returns {Integer} the count of registered categories
     *  Note that some categories may appear as unused by the user depending of his permissions
     */
    categoriesCount(){
        return this.tree.get().length;
    }

    /**
     * @param {String} id the identifier of the requested object
     * @returns {Object} the requested Category object.
     */
    category( id ){
        return pwiForums.client.collections.Categories.findOne({ _id: id });
    }

    /**
     * Recursively search for the given id inside of the ordered tree
     * @param {String} id the searched identifier
     * @param {Array} tree array to be searched to, defaulting to public tree reactive var
     * @returns {Object} a composite object { found, array, pos, index, rec, parent } which describes the result of the research
     *  if not found:
     *      - found is false
     *      - array is null
     *      - pos is zero
     *      - index is -1
     *      - rec is undefined
     *  if found:
     *      - pos = -1 for the first, +1 for the last, 0 else
     */
    find( id, tree=null ){
        if( !tree ){
            tree = this.tree.get();
        }
        return this._searchRec( id, tree );
    }

    /**
     * @param {String} id the identifier of the requested object
     * @returns {Object} the requested Forum object.
     */
    forum( id ){
        return pwiForums.client.collections.Forums.findOne({ _id: id });
    }

    /**
     * @returns {Integer} the count of registered forums
     */
    forumsCount(){
        return pwiForums.client.collections.Forums.find().count();
    }

    /**
     * Change categories/forum order, moving the given id down of one place
     * Note that we do not change here the categry of a forum: when a forum is last inside of the category it is attached to,
     *  then it cannot be moved down one place.
     * @param {String} id the category identifier to be moved
     */
    moveDown( id ){
        //console.log( 'id='+id );
        const ret = this._searchRec( id );
        if( ret.found ){
            if( ret.pos === 1 ){
                console.error( 'frsOrders:moveDown() unable to move the \''+id+'\' element down as already at the last position' );
            } else {
                console.log( ret );
                let array = ret.array.slice();
                const obj = { ...array[ret.index] };
                array[ret.index] = { ...array[ret.index+1] };
                array[ret.index+1] = { ...obj };
                this._saveMove( ret.rec === 0, ret.parent ? ret.parent.id : null, this._toOrder( array ));
            }
        }
    }

    /**
     * Change categories/forum order, moving the given id up of one place
     * @param {String} id the category identifier to be moved
     */
    moveUp( id ){
        //console.log( 'id='+id );
        const ret = this._searchRec( id );
        if( ret.found ){
            if( ret.pos === -1 ){
                console.error( 'frsOrders:moveUp() unable to move the \''+id+'\' element up as already at the first position' );
            } else {
                let array = ret.array.slice();
                const obj = { ...array[ret.index] };
                array[ret.index] = { ...array[ret.index-1] };
                array[ret.index-1] = { ...obj };
                this._saveMove( ret.rec === 0, ret.parent ? ret.parent.id : null, this._toOrder( array ));
            }
        }
    }

    /**
     * Computes the position of the given category into the order, or of the forum inside its own category
     * As a consequence, we have to search first into the categories themselves, then inside each of the categories children
     * @param {String} id the category or forum identifier
     * @returns {Integer} -1 for the first, +1 for the last, 0 else (or not found)
     */
    position( id ){
        //console.log( 'id='+id );
        const ret = this._searchRec( id );
        return ret.pos;
    }
}
