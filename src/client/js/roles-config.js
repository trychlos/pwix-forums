/*
 * pwix:forums/src/client/js/roles-config.js
 */

import { Roles } from 'meteor/pwix:roles';

console.log( 'pwix:forums/src/client/js/roles-config.js installing prView callback' );
Roles.viewAdd({
    tabLabel( tab ){ return Forums.fn.i18n( 'roles_view.perms_tab' )},
    paneContent( tab ){ return Forums.client.fn.viewRoles( tab )}
});
