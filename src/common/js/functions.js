/*
 * pwix:forums/src/common/js/functions.js
 */

import { pwixAccountsTools } from 'meteor/pwix:accounts-tools';
import { pwixI18n as i18n } from 'meteor/pwix:i18n';

pwiForums.fn = {

    /**
     * @summary A proxy to pwixI18n.label() method
     * @locus Anywhere
     * @param {String} key the key to the to-be-translated label
     * @returns {String} the translated string in the configured language
     */
    i18n( key ){
        let _args = [ ...arguments ];
        _args.shift();
        return i18n.label( FRSI18N, key, ..._args );
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
     * @summary A proxy to pwixAccountsTools.isEmailverified()
     * @locus Anywhere
     * @param {Object} user the user document
     * @param {String} email the email addressed to check
     * @returns {Boolean} whether the email address has been verified
     */
    isEmailVerified( user, email ){
        return pwixAccountsTools.isEmailVerified( user, email );
    },

    /**
     * @summary A proxy to pwixAccountsTools.preferredLabelByDoc() method
     * @locus Anywhere
     * @param {Object} user the user document
     * @param {String} preferred whether we want a username or an email address
     * @returns {Object} an object:
     *  - label: the label to preferentially use when referring to the user
     *  - origin: whether it was a AC_USERNAME or a AC_EMAIL_ADDRESS
     */
    labelByDoc( user, preferred ){
        return pwixAccountsTools.preferredLabelByDoc( user, preferred );
    },

    /**
     * @summary A proxy to pwixAccountsTools.preferredLabelById() method
     * @locus Anywhere
     * @param {String} id the user identifier
     * @param {String} preferred whether we want a username or an email address
     * @returns {ReactiveVar} a new ReactiveVar which will eventually contain an object:
     *  - label: the label to preferentially use when referring to the user
     *  - origin: whether it is a AC_USERNAME or a AC_EMAIL_ADDRESS
     */
    labelById( id, preferred ){
        return pwixAccountsTools.preferredLabelById( id, preferred );
    }
};
