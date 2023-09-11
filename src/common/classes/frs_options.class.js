/*
 * pwix:forums/src/common/classes/frs_options.class.js
 *
 * This class manages the configuration options.
 */

import { Options } from 'meteor/pwix:options';

import { frsModerate } from './frs_moderate.class.js';

import '../js/index.js';

export class frsOptions extends Options.Base {

    // static data
    //

    static AccessMode = [
        Forums.C.Access.PUBLIC,
        Forums.C.Access.PRIVATE
    ];

    static PublicWriter = [
        Forums.C.Participation.ANYBODY,
        Forums.C.Participation.LOGGEDIN,
        Forums.C.Participation.EMAILADDRESS,
        Forums.C.Participation.EMAILVERIFIED,
        Forums.C.Participation.APPFN
    ];

    // private data
    //

    // private functions
    //

    // public data
    //

    // public methods
    //

    /**
     * Constructor
     * @param {Object} options the options to be managed
     * 
     * The Options base class takes care of managing the known options, either as a value, or as a function which return a value.
     * In some case where the expected value is a string, the base class also can accept an object with 'namespace' and 'i18n' keys.
     * All options are accepted as long as the corresponding getter/setter method exists in this derived class.
     * 
     * @returns {frsOptions}
     */
    constructor( options ){
        super( options );
        return this;
    }

    /**
     * Getter/Setter
     * @param {String|Function} value the prefix of the collection's name
     * @returns {String}
     */
    'collections.prefix'( value ){
        return this.base_gsStringFn( 'collections.prefix', value, { default: Forums._defaults.collections.prefix });
    }

    /**
     * Getter/Setter
     * @param {String|Function} value the default access mode of a new forum
     * @returns {String}
     */
    'forums.access'( value ){
        return this.base_gsStringFn( 'forums.access', value, { default: Forums._defaults.forums.access, ref: frsOptions.AccessMode });
    }

    /**
     * Getter/Setter
     * @param {String|Function} value whether the author of a moderated post is informed
     * @returns {String}
     */
    'forums.inform'( value ){
        return this.base_gsStringFn( 'forums.inform', value, { default: Forums._defaults.forums.inform, ref: frsModerate.Inform });
    }

    /**
     * Getter/Setter
     * @param {String|Function} value the default access mode of a new forum
     * @returns {String}
     */
    'forums.moderation'( value ){
        return this.base_gsStringFn( 'forums.moderation', value, { default: Forums._defaults.forums.moderation, ref: frsModerate.Strategies });
    }

    /**
     * Getter/Setter
     * @param {String|Function} value the default access mode of a new forum
     * @returns {String}
     */
    'forums.publicWriter'( value ){
        return this.base_gsStringFn( 'forums.publicWriter', value, { default: Forums._defaults.forums.publicWriter, ref: frsOptions.PublicWriter });
    }

    /**
     * Getter/Setter
     * @param {String|Function} value the default access mode of a new forum
     * @returns {String}
     */
    'forums.publicWriterAppFn'( value ){
        // what to do wih this as not managed by the Options base class
    }

    /**
     * Getter/Setter
     * @param {String|Function} value the route to the page which displays all the posts
     * @returns {String}
     */
    'routes.allposts'( value ){
        return this.base_gsStringFn( 'routes.allposts', value, { default: Forums._defaults.routes.allposts });
    }

    /**
     * Getter/Setter
     * @param {String|Function} value the route to the forums
     * @returns {String}
     */
    'routes.forums'( value ){
        return this.base_gsStringFn( 'routes.forums', value, { default: Forums._defaults.routes.forums });
    }

    /**
     * Getter/Setter
     * @param {String|Function} value the route to the forums manager
     * @returns {String}
     */
    'routes.manager'( value ){
        return this.base_gsStringFn( 'routes.manager', value, { default: Forums._defaults.routes.manager });
    }

    /**
     * Getter/Setter
     * @param {String|Function} value the route to the forums moderation page
     * @returns {String}
     */
    'routes.moderate'( value ){
        return this.base_gsStringFn( 'routes.moderate', value, { default: Forums._defaults.routes.moderate });
    }

    /**
     * Getter/Setter
     * @param {String|Function} value the route to the posts of a thread
     * @returns {String}
     */
    'routes.posts'( value ){
        return this.base_gsStringFn( 'routes.posts', value, { default: Forums._defaults.routes.posts });
    }

    /**
     * Getter/Setter
     * @param {String|Function} value the route to the threads of a forum
     * @returns {String}
     */
    'routes.threads'( value ){
        return this.base_gsStringFn( 'routes.threads', value, { default: Forums._defaults.routes.threads });
    }

    /**
     * Getter/Setter
     * @param {Integer|Function} value the OR-ed integer which determines the verbosity level
     * @returns {Integer}
     */
    verbosity( value ){
        return this.base_gsIntegerFn( 'verbosity', value, { default: Forums._defaults.verbosity });
    }
}
