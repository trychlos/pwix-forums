/*
 * pwix:forums/src/common/js/i18n.js
 */

import { pwixI18n as i18n } from 'meteor/pwix:i18n';

//import '../i18n/en_US.js';
//i18n.set( FRSI18N, 'en_US', Forums.i18n.en_US );

import '../i18n/fr_FR.js';
i18n.namespace( FRSI18N, 'fr_FR', Forums.i18n.fr_FR );
