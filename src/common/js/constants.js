/*
 * pwix:forums/src/common/js/constants.js
 */

Forums.C = {

    // access mode
    Access: {
        PUBLIC:  'FRS_PUBLIC_ACCESS',
        PRIVATE: 'FRS_PRIVATE_ACCESS'
    },

    // whether to inform the author when a post is moderated ?
    Information: {
        NONE: 'FRS_INFORM_NONE',
        MAY:  'FRS_INFORM_MAY',
        MUST: 'FRS_INFORM_MUST'
    },        

    // how the forum is it moderated ?
    Moderation: {
        NONE:        'FRS_MODERATE_NONE',
        APRIORI:     'FRS_MODERATE_APRIORI',
        APOSTERIORI: 'FRS_MODERATE_APOSTERIORI'
    },

    // who can participate to a public forum ?
    Participation: {
        ANYBODY:       'FRS_USER_ANYBODY',
        LOGGEDIN:      'FRS_USER_LOGGEDIN',
        EMAILADDRESS:  'FRS_USER_EMAILADDRESS',
        EMAILVERIFIED: 'FRS_USER_EMAILVERIFIED',
        APPFN:         'FRS_USER_APPFN'
    },

    // why a user cannot write into a forum ?
    Reason: {
        NONE:           'FRS_REASON_NONE',
        NOTCONNECTED:   'FRS_REASON_NOTCONNECTED',
        NOEMAIL:        'FRS_REASON_NOEMAIL',
        NOTVERIFIED:    'FRS_REASON_NOTVERIFIED',
        APPFN:          'FRS_REASON_APPFN',
        PRIVATEWRITERS: 'FRS_REASON_PRIVATEWRITERS',
        PRIVATEEDIT:    'FRS_REASON_PRIVATEEDIT',
        PRIVATE:        'FRS_REASON_PRIVATE'
    },

    // verbosity level
    Verbose: {
        NONE:        0,
        CONFIGURE:   0x01 <<  0,
        STARTUP:     0x01 <<  1,
        READY:       0x01 <<  2,     // when ready(), client-only
        COLLECTIONS: 0x01 <<  3
    }
};

// non exported constants

I18N = 'pwix:forums:i18n';
