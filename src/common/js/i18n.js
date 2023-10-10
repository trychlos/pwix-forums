/*
 * pwix:forums/src/common/js/i18n.js
 */

import { pwixI18n } from 'meteor/pwix:i18n';

//import '../i18n/en_US.js';
//i18n.set( I18N, 'en_US', Forums.i18n.en_US );

import '../i18n/fr.js';
pwixI18n.namespace( I18N, 'fr', Forums.i18n.fr );
