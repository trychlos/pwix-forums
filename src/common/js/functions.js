/*
 * pwix:forums/src/common/js/functions.js
 */

import { pwixI18n as i18n } from 'meteor/pwix:i18n';

pwiForums.fn = {

    // internationalization
    i18n( key ){
        let _args = [ ...arguments ];
        _args.shift();
        return i18n.label( pwiForums.strings, key, ..._args );
    },

    // convert an array of objects { id: <string> } to an array of string [ <id>, ... ]
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
