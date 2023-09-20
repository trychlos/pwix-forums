/*
 * pwix:forums/src/common/js/functions.js
 */

import { AccountsTools } from 'meteor/pwix:accounts-tools';
import { pwixI18n as i18n } from 'meteor/pwix:i18n';

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
        return i18n.label( I18N, key, ..._args );
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
    },

    /**
     * @summary A proxy to AccountsTools.isEmailverified()
     * @locus Anywhere
     * @param {Object} user the user document
     * @param {String} email the email addressed to check
     * @returns {Boolean} whether the email address has been verified
     */
    isEmailVerified( user, email ){
        return AccountsTools.isEmailVerified( user, email );
    },

    /**
     * @summary A proxy to AccountsTools.preferredLabelByDoc() method
     * @locus Anywhere
     * @param {Object} arg the user identifier or document
     * @param {String} preferred whether we want a username or an email address
     * @returns {Object} an object:
     *  - label: the label to preferentially use when referring to the user
     *  - origin: whether it was a AccountsTools.C.PreferredLabel.USERNAME or a AccountsTools.C.PreferredLabel.EMAIL_ADDRESS
     */
    preferredLabel( arg, preferred ){
        return new ReactiveVar( AccountsTools.preferredLabel( arg, preferred ));
    },
};
