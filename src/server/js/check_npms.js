/*
 * pwix:forums/src/server/js/check_npms.js
 */

import { checkNpmVersions } from 'meteor/tmeasday:check-npm-versions';

if( false ){
    // whitelist packages which are included via a subfolder
    require( '@popperjs/core/package.json' );
    require( 'bootstrap/package.json' );
}

checkNpmVersions({
    '@popperjs/core': '^2.11.6',
    'bootstrap': '^5.2.1',
    'dotdotdot': '^1.1.0',
    'lodash': '^4.17.0',
    'printf': '^0.6.1'
},
    'pwix:forums'
);
