/*
 * pwix:forums/src/client/js/roles-config.js
 */

import { pwixRoles } from 'meteor/pwix:roles';

console.log( 'pwix:forums/src/client/js/roles-config.js installing prView callback' );
pwixRoles.viewAdd({
    tabLabel( tab ){ return pwiForums.fn.i18n( 'roles_view.perms_tab' )},
    paneContent( tab ){ return pwiForums.client.fn.viewRoles( tab )}
});
