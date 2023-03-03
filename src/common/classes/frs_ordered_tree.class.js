/*
 * /src/common/classes/frs_ordered_tree.class.js
 *
 * This class manages the orders or categories and forums, as displayed to the current user:
 *  - all categories are visible
 *  - only readable forums are shown.
 * 
 * If the user has enough permissions, this class makes its best effort to update the Orders collection itself when needed.
 * 
 * The class exposes one tree() reactive data source which provides the ordered tree of categories and forums.
 * Per definition, the first level (at index zero) is only categories, and the second level is only forums.
 * 
 * NB: for security reasons, and because this singleton is built on the client, it only contains the items the
 * user is allowed to see. As a consequence, it may be incomplete. As a consequence of the consequence, there
 * is no try to 'repair' incomplete orders if the user is not a forum administrator.
 */

import { ReactiveVar } from 'meteor/reactive-var';
import { Tracker } from 'meteor/tracker';

import { pwiRoles } from 'meteor/pwix:roles';

import '../js/index.js';

const CAT = 'CAT';
const FOR = 'FOR';
const FORUM_ADMIN = 'FRS_ADMIN';

export class frsOrderedTree {

    // static data
    //
    static Singleton = null;

    // private data
    //
    _priv = {
        categories: {
            handle: null,
            collection: new ReactiveVar( [] ),
            got: new ReactiveVar( false )
        },
        forums: {
            handle: null,
            query: new ReactiveVar( null ),
            collection: new ReactiveVar( [] ),
            got: new ReactiveVar( false )
        },
        orders: {
            handle: null,
            collection: new ReactiveVar( [] ),
            got: new ReactiveVar( false )
        },
        build: {
            tree: [],
            catOrderYesCollecNo: 0,
            catOrderNoCollecYes: 0,
            catDefaultFound: false,
            catUpdateOrders: new ReactiveVar( false ),
            catUpdateCollection: new ReactiveVar( false ),
            forOrders: {},
            forUpdated: {},
            forUpdateOrders: new ReactiveVar( false ),
            forUpdateCollection: new ReactiveVar( false ),
        },
        dep: new Tracker.Dependency()
    };

    // private functions
    //

    /*
     * build the ordered list of categories, including existing categories, plus the default category, plus the unordered categories at the end in title alpha order
     * the recorded order of categories is the master of the order, though it may be uncomplete or super-complete
     * (for example not contain some new categories, or contain no more existing categories)
     *  - catsOrder: the Order document from the Orders collection with type='CAT' -> aka the registered categories order, may be null
     *  - catsCollection: the fetched Categories collection
     *  > updates the function-global 'build' object
     * At the end, we have:
     * - in tree, the ordered list of all the categories as to be displayed to the user
     * - counts of found in Categories but not in Orders, and found in Orders but not in Categories
     *      detail is not relevant here as the single record is fully rewritten in the two cases
     * - whether we have found the default category in the collection
     */
    _buildFromCategories( catsOrder, catsCollection ){

        //console.log( '_buildFromCategories in', catsOrder, catsCollection );

        const self = this;
        let _defaultFound = false;

        // category id registered in the order, but not found in the collection
        // category found in the collection, but not in the order
        // in these two cases, a repair of the order is to be computed
        self._priv.build.tree = [];
        self._priv.build.catOrderYesCollecNo = 0;
        self._priv.build.catOrderNoCollecYes = 0;
        self._priv.build.catDefaultFound = true;
        self._priv.build.catUpdateOrders.set( false );
        self._priv.build.catUpdateCollection.set( false );

        // push a new category in the tree
        function f_pushCat( cat ){
            cat.forums = [];
            self._priv.build.tree.push( cat );
            if( cat._id === pwiForums.Categories.default ){
                _defaultFound = true;
            }
        }

        // build from ordered existing categories
        const _order = catsOrder ? catsOrder.order || [] : [];
        _order.every(( o ) => {
            const cat = self._findCategory( catsCollection, o.id );
            if( cat ){
                cat.d_ordered = true;
                f_pushCat( cat );
            } else {
                self._priv.build.catOrderYesCollecNo += 1;
            }
            return true;
        });

        // add unordered categories
        catsCollection.every(( c ) => {
            if( !c.d_ordered ){
                f_pushCat( c );
                self._priv.build.catOrderNoCollecYes += 1;
            }
            return true;
        });

        // make sure the default category is included in the collection
        if( !_defaultFound ){
            f_pushCat( self._defaultCategory());
            self._priv.build.catDefaultFound = false;
        }

        if( self._isAllowed()){
            self._priv.build.catUpdateOrders.set( self._priv.build.catOrderYesCollecNo + self._priv.build.catOrderNoCollecYes > 0 );
            self._priv.build.catUpdateCollection.set( self._priv.build.catDefaultFound === false );
        }

        //console.log( 'builtFromCategories out', self._priv );
    }

    /*
     * starting from the first step build with categories, increment it with the forums list
     * the category set in the forum itself is the first indicator of the category rattachment
     * if the forum is not ordered, it is then attached at the end of list of the default category
     *  - ordsCollection: the fetched Orders collection
     *  - forsCollection: the fetched Forums collection (only whose who are readable by the current user)
     *  > updates the function-global 'build' object
     */
    _buildFromForums( ordsCollection, forsCollection ){

        //console.log( '_buildFromForums in', ordsCollection, forsCollection );

        const self = this;
        self._priv.build.forOrders = {};          // a list of categories whose 'FOR' order should be rewritten
        self._priv.build.forUpdated = {};         // a list of forums whose category has been modified
        self._priv.build.forUpdateOrders.set( false );
        self._priv.build.forUpdateCollection.set( false );

        let _catDefault = null;

        // iterate through the (already ordered) categories
        self._priv.build.tree.every(( c ) => {
    
            // trying to attach already ordered forums
            //  this is not an error if an ordered forum is not found in the collection: maybe the user is not allowed to see it
            //  nonetheless we count them here as - if the user is a forum admin - these are actual errors we can try to fix
            const forOrder = self._findOrder( ordsCollection, FOR, c._id );
            if( forOrder ){
                forOrder.order.every(( o ) => {
                    const forum = self._findForum( forsCollection, o.id );
                    if( forum ){
                        c.forums.push( forum );
                        forum.d_attached = true;
                    } else {
                        self._priv.build.forOrders[c._id] = c;
                    }
                    return true;
                });
            } else {
                self._priv.build.forOrders[c._id] = c;
            }

            // keep default category for later use
            if( c._id === pwiForums.Categories.default ){
                _catDefault = c;
            }

            return true;
        });

        // iterate through forums collection, attaching still left unattached to default category
        forsCollection.every(( f ) => {
            if( !f.d_attached ){
                _catDefault.forums.push( f );
                self._priv.build.forOrders[pwiForums.Categories.default] = _catDefault;
                if( f.category !== pwiForums.Categories.default ){
                    f.category = pwiForums.Categories.default;
                    self._priv.build.forUpdated[f._id] = f;
                }
            }
            return true;
        });

        if( self._isAllowed()){
            self._priv.build.forUpdateOrders.set( Object.keys( self._priv.build.forOrders ).length > 0 );
            self._priv.build.forUpdateCollection.set( Object.keys( self._priv.build.forUpdated ).length > 0 );
        }

        //console.log( 'builtFromForums out', self._priv );
    }

    /*
     * @returns {Object} a { _id, title } object for the default category
     */
    _defaultCategory(){
        return {
            _id: pwiForums.Categories.default,
            title: pwiForums.fn.i18n( 'manager.default_category_label' ),
            color: '#ff9800'
        };
    }

    // return the found Category document, or null
    _findCategory( categoriesArray, id ){
        let found = null;
        categoriesArray.every(( c ) => {
            if( c._id === id ){
                found = c;
                return false;
            }
            return true;
        });
        return found;
    }

    // return the found Forum document, or null
    _findForum( forumsArray, id ){
        let found = null;
        forumsArray.every(( f ) => {
            if( f._id === id ){
                found = f;
                return false;
            }
            return true;
        });
        return found;
    }

    // return the found Order document, or null
    _findOrder( ordersArray, type, cat ){
        let found = null;
        ordersArray.every(( o ) => {
            if( o.type === type && ( type === CAT || o.category === cat )){
                found = o;
                return false;
            }
            return true;
        });
        return found;
    }

    // whether the user is allowed to try to repair the orders
    _isAllowed(){
        const userId = Meteor.userId();
        return userId && pwiRoles.userIsInRoles( userId, FORUM_ADMIN );
    }

    // public data
    //

    /**
     * Constructor
     * @returns {frsOrderedTree}
     */
    constructor(){
        if( frsOrderedTree.Singleton ){
            return frsOrderedTree.Singleton;
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
                self._priv.categories.collection.set( pwiForums.client.collections.Categories.find({}, { sort: { title: 1 }}).fetch() || [] );
                self._priv.categories.got.set( true );
                console.log( 'frsCategories', self._priv.categories.collection.get());
            }
        });
        Tracker.autorun(() => {
            if( self._priv.forums.handle.ready()){
                const query = self._priv.forums.query.get();
                self._priv.forums.collection.set( pwiForums.client.collections.Forums.find( query.selector ).fetch() || [] );
                self._priv.forums.got.set( true );
                console.log( 'frsForums', self._priv.forums.collection.get());
            }
        });
        Tracker.autorun(() => {
            if( self._priv.orders.handle.ready()){
                self._priv.orders.collection.set( pwiForums.client.collections.Orders.find().fetch() || [] );
                self._priv.orders.got.set( true );
                console.log( 'frsOrders', self._priv.orders.collection.get());
            }
        });

        // as soon as a category, a forum or an order has been updated, we rebuild all our ordered tree
        // this is a full (re)build of both:
        //  - the ordered tree as an array of Category objects, each Category inclusing its Forum children
        //  - the list of updates to be done in our collections:
        //      + maybe the categories must be reorderd
        //      + maybe a forum must be attached to another category (in this case, always to 'uncategorized')
        //      + maybe the 'Uncategorized' category must be added to the collection
        Tracker.autorun(() => {
            if( self._priv.categories.got.get() && self._priv.forums.got.get() && self._priv.orders.got.get()){
                const ordersCollection = self._priv.orders.collection.get();
                const catOrder = self._findOrder( ordersCollection, CAT );
                self._buildFromCategories( catOrder, self._priv.categories.collection.get());
                self._buildFromForums( ordersCollection, self._priv.forums.collection.get());
                self._priv.dep.changed();
            }
        });

        // if needed and the user is allowed to, then try to repair inconsistencies
        //  categories order
        Tracker.autorun(() => {
            if( self._priv.build.catUpdateOrders.get()){
                let order = [];
                self._priv.build.tree.every(( c ) => {
                    order.push({ id: c._id });
                    return true;
                });
                console.log( 'repairing Categories order', order );
                Meteor.call( 'frsOrders.upsert', { type: CAT }, order, ( err, res ) => {
                    if( err ){
                        console.error( err );
                    } else {
                        console.log( 'frsOrders.upsert CAT', order, res );
                    }
                });
                self._priv.build.catUpdateOrders.set( false );
            }
        });

        // if needed and the user is allowed to, then try to repair inconsistencies
        //  categories collection
        Tracker.autorun(() => {
            if( self._priv.build.catUpdateCollection.get()){
                const o = self._defaultCategory();
                console.log( 'repairing Categories collection', o );
                Meteor.call( 'frsCategories.upsert', o, ( err, res ) => {
                    if( err ){
                        console.error( err );
                    } else {
                        console.log( 'frsCategories.upsert CAT', o, res );
                    }
                });
                self._priv.build.catUpdateCollection.set( false );
            }
        });

        // if needed and the user is allowed to, then try to repair inconsistencies
        //  forums orders for a category
        Tracker.autorun(() => {
            if( self._priv.build.forUpdateOrders.get()){
                Object.keys( self._priv.build.forOrders ).every(( id ) => {
                    self._priv.build.tree.every(( c ) => {
                        if( c._id === id ){
                            let order = [];
                            c.forums.every(( f ) => {
                                order.push({ id: f._id });
                                return true;
                            });
                            console.log( 'repairing Forums order', id, order );
                            Meteor.call( 'frsOrders.upsert', { type: FOR, category: id }, order, ( err, res ) => {
                                if( err ){
                                    console.error( err );
                                } else {
                                    console.log( 'frsOrders.upsert FOR', id, order, res );
                                }
                            });
                            return false;
                        }
                        return true;
                    });
                    return true;
                });
                self._priv.build.forUpdateOrders.set( false );
            }
        });

        // if needed and the user is allowed to, then try to repair inconsistencies
        //  category of a forum
        Tracker.autorun(() => {
            if( self._priv.build.forUpdateCollection.get()){
                Object.keys( self._priv.build.forUpdated ).every(( id ) => {
                    console.log( 'repairing Forums collection', id );
                    Meteor.call( 'frsForums.setCategory', id, pwiForums.Categories.default, ( err, res ) => {
                        if( err ){
                            console.error( err );
                        } else {
                            console.log( 'frsForums.setCategory', id, pwiForums.Categories.default, res );
                        }
                    });
                    return true;
                });
                self._priv.build.forUpdateCollection.set( false );
            }
        });

        frsOrderedTree.Singleton = this;
        return this;
    }

    /**
     * @param {String} id the identifier of the requested document
     * @returns {Object} the requested Category document.
     */
    category( id ){
        return this._findCategory( this._priv.categories.collection.get(), id );
    }

    /**
     * @returns {Integer} the count of registered categories
     *  Note that some categories may appear as unused to the user depending of his permissions
     */
    categoriesCount(){
        return this.tree().length;
    }

    /**
     * @param {String} id the identifier of the requested document
     * @returns {Object} the requested Forum document.
     */
    forum( id ){
        return this._findForum( this._priv.forums.collection.get(), id );
    }

    /**
     * @returns {Integer} the total count of registered forums for the current user
     */
    forumsCountAll(){
        return this._priv.forums.collection.get().length;
    }

    /**
     * @returns {Array} the built ordered tree
     * A reactive data source.
     */
    tree(){
        this._priv.dep.depend();
        return this._priv.build.tree;
    }
}
