/*
 * pwix:forums/src/common/classes/options.class.js
 *
 * This class manages the configuration options.
 */

import { pwixOptions } from 'meteor/pwix:options';

import { frsModerate } from './frs_moderate.class.js';

import '../js/index.js';

export class frsOptions extends pwixOptions.Options {

    // static data
    //

    static AccessMode = [
        FRS_FORUM_PUBLIC,
        FRS_FORUM_PRIVATE
    ];

    static PublicWriter = [
        FRS_USER_ANYBODY,
        FRS_USER_LOGGEDIN,
        FRS_USER_EMAILADDRESS,
        FRS_USER_EMAILVERIFIED,
        FRS_USER_APPFN
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
        return this.getset_String_Fn( 'collections.prefix', value, { default: pwiForums._defaults.collections.prefix });
    }

    /**
     * Getter/Setter
     * @param {String|Function} value the default access mode of a new forum
     * @returns {String}
     */
    'forums.access'( value ){
        return this.getset_String_Fn( 'forums.access', value, { default: pwiForums._defaults.forums.access, ref: frsOptions.AccessMode });
    }

    /**
     * Getter/Setter
     * @param {String|Function} value whether the author of a moderated post is informed
     * @returns {String}
     */
    'forums.inform'( value ){
        return this.getset_String_Fn( 'forums.inform', value, { default: pwiForums._defaults.forums.inform, ref: frsModerate.Inform });
    }

    /**
     * Getter/Setter
     * @param {String|Function} value the default access mode of a new forum
     * @returns {String}
     */
    'forums.moderation'( value ){
        return this.getset_String_Fn( 'forums.moderation', value, { default: pwiForums._defaults.forums.moderation, ref: frsModerate.Strategies });
    }

    /**
     * Getter/Setter
     * @param {String|Function} value the default access mode of a new forum
     * @returns {String}
     */
    'forums.publicWriter'( value ){
        return this.getset_String_Fn( 'forums.publicWriter', value, { default: pwiForums._defaults.forums.publicWriter, ref: frsOptions.PublicWriter });
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
        return this.getset_String_Fn( 'routes.allposts', value, { default: pwiForums._defaults.routes.allposts });
    }

    /**
     * Getter/Setter
     * @param {String|Function} value the route to the forums
     * @returns {String}
     */
    'routes.forums'( value ){
        return this.getset_String_Fn( 'routes.forums', value, { default: pwiForums._defaults.routes.forums });
    }

    /**
     * Getter/Setter
     * @param {String|Function} value the route to the forums manager
     * @returns {String}
     */
    'routes.manager'( value ){
        return this.getset_String_Fn( 'routes.manager', value, { default: pwiForums._defaults.routes.manager });
    }

    /**
     * Getter/Setter
     * @param {String|Function} value the route to the forums moderation page
     * @returns {String}
     */
    'routes.moderate'( value ){
        return this.getset_String_Fn( 'routes.moderate', value, { default: pwiForums._defaults.routes.moderate });
    }

    /**
     * Getter/Setter
     * @param {String|Function} value the route to the posts of a thread
     * @returns {String}
     */
    'routes.posts'( value ){
        return this.getset_String_Fn( 'routes.posts', value, { default: pwiForums._defaults.routes.posts });
    }

    /**
     * Getter/Setter
     * @param {String|Function} value the route to the threads of a forum
     * @returns {String}
     */
    'routes.threads'( value ){
        return this.getset_String_Fn( 'routes.threads', value, { default: pwiForums._defaults.routes.threads });
    }

    /**
     * Getter/Setter
     * @param {Integer|Function} value the OR-ed integer which determines the verbosity level
     * @returns {Integer}
     */
    verbosity( value ){
        return this.getset_Integer_Fn( 'verbosity', value, { default: pwiForums._defaults.verbosity });
    }
}
