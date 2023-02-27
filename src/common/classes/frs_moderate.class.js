/*
 * pwix:forums/src/common/classes/frs_moderate.class.js
 */

import { pwixI18n } from 'meteor/pwix:i18n';

export class frsModerate {

    // static data
    //
    static Strategies = [
        FRS_MODERATE_NONE,
        FRS_MODERATE_APRIORI,
        FRS_MODERATE_APOSTERIORI
    ];

    static Inform = [
        FRS_INFORM_NONE,
        FRS_INFORM_MAY,
        FRS_INFORM_MUST
    ];

    // static methods
    //
    /**
     * @returns {Array} the i18n group array which describe the information options
     */
    static informLabels(){
        return pwixI18n.group( FRSI18N, 'forum_edit.informs' );
    }

    /**
     * @returns {Array} the i18n group array which describe the moderation strategies
     */
    static strategyLabels(){
        return pwixI18n.group( FRSI18N, 'moderate.strategies' );
    }

    /**
     * @param {String} strategy the moderation strategy
     * @returns {String} the short label for the strategy, or null
     */
    static short( strategy ){
        let short = null;
        const group = pwixI18n.group( FRSI18N, 'moderate.short_strategies' );
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
