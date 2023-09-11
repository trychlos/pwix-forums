/*
 * /src/client/components/frs_settings_tab/frs_settings_tab.js
 * 
 * Params:
 */
import './frs_settings_tab.html';

Template.frs_settings_tab.helpers({
    // get a translated label
    i18n( opts ){
        return Forums.fn.i18n( 'settings_tab.'+opts.hash.label );
    }
});
