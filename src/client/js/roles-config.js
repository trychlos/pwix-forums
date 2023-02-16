/*
 * pwi:forums/src/client/js/roles-config.js
 */

import { pwiRoles } from 'meteor/pwix:roles';

console.log( 'pwi:forums/src/client/js/roles-config.js installing prView callback' );
pwiRoles.viewAdd({
    tabLabel( tab ){ return pwiForums.fn.i18n( 'roles_view.perms_tab' )},
    paneContent( tab ){ return pwiForums.client.fn.viewRoles( tab )}
});
