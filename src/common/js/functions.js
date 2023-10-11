/*
 * pwix:forums/src/common/js/functions.js
 */

import { AccountsTools } from 'meteor/pwix:accounts-tools';
import { pwixI18n } from 'meteor/pwix:i18n';

Forums.fn = {

    /*
     * @summary A proxy to pwixI18n.label() method
     * @locus Anywhere
     * @param {String} key the key to the to-be-translated label
     * @returns {String} the translated string in the configured language
     * 
     * Forums.fn.i18n( 'my.own.key' );
     * pwixI18n.label( I18N, 'my.own.key' );
     */
    i18n( key ){
        let _args = [ ...arguments ];
        _args.shift();
        return pwixI18n.label( I18N, key, ..._args );
    },

    /**
     * @summary Convert an array of objects { id: <string> } to an array of string [ <id>, ... ]
     *  Rather a private function for handling the lists of users in the collections
     * @locus Anywhere
     * @param {Array} array an array of objects where each object has a 'id' key
     * @returns {Array} an array of the id's strings
     */
    ids( array ){
        let result = [];
        if( array ){
            array.every(( o ) => {
                result.push( o.id );
                return true;
            });
        }
        return result;
    }
};
