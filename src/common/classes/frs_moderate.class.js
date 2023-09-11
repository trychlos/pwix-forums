/*
 * pwix:forums/src/common/classes/frs_moderate.class.js
 */

import { pwixI18n } from 'meteor/pwix:i18n';

export class frsModerate {

    // static data
    //
    static Strategies = [
        Forums.C.Moderation.NONE,
        Forums.C.Moderation.APRIORI,
        Forums.C.Moderation.APOSTERIORI
    ];

    static Inform = [
        Forums.C.Information.NONE,
        Forums.C.Information.MAY,
        Forums.C.Information.MUST
    ];

    // static methods
    //
    /**
     * @returns {Array} the i18n group array which describe the information options
     */
    static informLabels(){
        return pwixI18n.group( I18N, 'forum_edit.informs' );
    }

    /**
     * @returns {Array} the i18n group array which describe the moderation strategies
     */
    static strategyLabels(){
        return pwixI18n.group( I18N, 'moderate.strategies' );
    }

    /**
     * @param {String} strategy the moderation strategy
     * @returns {String} the short label for the strategy, or null
     */
    static short( strategy ){
        let short = null;
        const group = pwixI18n.group( I18N, 'moderate.short_strategies' );
        group.every(( it ) => {
            if( it.id === strategy ){
                short = it.label;
                return false;
            }
            return true;
        });
        return short;
    }
}
