/*
 * /src/collections/forums/forums.js
 *
 * See server/sofns.js for server-only functions.
 * See server/methods.js for server functions remotely callable from the client
 *  (aka Meteor RPC).
 */

import SimpleSchema from 'simpl-schema';

pwiForums.Forums = {

    // name radical
    radical: 'forums',

    // Forums schema
    schema: new SimpleSchema({
        // the forum title (a single line)
        title: {
            type: String
        },
        displayableDescription: {
            type: String,
            optional: true
        },
        internalComment: {
            type: String,
            optional: true
        },
        // forum category (may be empty)
        category: {
            type: String,
            optional: true
        },
        // who is able to participate to this public forum ?
        publicWriter: {
            type: String,
            defaultValue: defaults.common.forums.publicWriter
        },
        // whether the forum is private (user must be identified and allowed to view and participate) ?
        private: {
            type: Boolean,
            defaultValue: false
        },
        // the list of users which are allowed to view this private forum
        //  FRS_FORUM_PRIVATE_VIEW is always allowed to view
        privateReaders: {
            type: Array,
            defaultValue: []
        },
        "privateReaders.$": Object,
        "privateReaders.$.id": String,
        // the list of users which are allowed to participate (write in) to this private forum
        //  FRS_FORUM_PRIVATE_EDIT is always allowed to participate
        privateWriters: {
            type: Array,
            defaultValue: []
        },
        "privateWriters.$": Object,
        "privateWriters.$.id": String,
        // whether the moderated posts should be rendered with a placeholder for the forum moderators ?
        //  - true (a placeholder with an accordion which displayed the deleted post)
        //  - false: nothing is shown
        showDeletedForAdmin: {
            type: Boolean,
            defaultValue: true
        },
        // whether a user may see *his* own deleted posts as (just) a placeholder ?
        //  - true (a placeholder)
        //  - false: nothing is shown
        showDeletedForUser: {
            type: Boolean,
            defaultValue: false
        },
        // creation timestamp
        // mandatory
        createdAt: {
            type: Date,
            defaultValue: new Date()
        },
        // creation userid
        // mandatory
        createdBy: {
            type: String
        },
        // last update timestamp
        updatedAt: {
            type: Date,
            optional: true
        },
        // last update userid
        updatedBy: {
            type: String,
            optional: true
        },
        // archive timestamp
        archivedAt: {
            type: Date,
            optional: true
        },
        // archive userid
        archivedBy: {
            type: String,
            optional: true
        },
        // the list of the moderators of *this* forum
        //  FRS_MODERATOR is allowed to moderate all forums
        moderators: {
            type: Array,
            defaultValue: []
        },
        "moderators.$": Object,
        "moderators.$.id": String,
        // Mongo identifier
        // mandatory (auto by Meteor+Mongo)
        _id: {
            type: String,
            optional: true
        },
        xxxxxx: {   // unused key to be sure we always have something to unset
            type: String,
            optional: true
        }
    }),

    // Deny all client-side updates
    // cf. https://guide.meteor.com/security.html#allow-deny
    deny(){
        pwiForums.server.collections.Forums.deny({
            insert(){ return true; },
            update(){ return true; },
            remove(){ return true; },
        });
    },

    // whether the specified user can moderate the specified forum ?
    // - forum: the Forum object
    // - user: the user identifier
    canModerate( forum, user ){
        const moderate = forum && user &&
            ( pwiRoles.userIsInRoles( user, 'FRS_MODERATOR' ) || pwiForums.fn.ids( forum.moderators || [] ).includes( user ));
        return moderate ? true : false;
    },

    // whether the specified forum is editable (postable) by the specified user (which may be null at the moment) ?
    // - forum: the Forum object
    // - user: the user record
    // returns an object:
    //  - editable: true|false
    //  - reason: a constant
    isEditable( forum, user ){
        if( !forum ){
            throw new Error( 'forum is mandatory, not specified' );
        }
        let result = {
            editable: true,
            reason: FRS_REASON_NONE
        };
        if( forum.private ){
            if( user ){
                if( pwiForums.fn.ids( forum.privateWriters || [] ).includes( user._id )){
                    reason = FRS_REASON_PRIVATEWRITERS;
                } else if( pwiRoles.userIsInRoles( user._id, [ 'FRS_PRIVATE_EDIT' ])){
                    reason = FRS_REASON_PRIVATEEDIT;
                } else {
                    result.editable = false;
                    result.reason = FRS_REASON_PRIVATE;
                }
            } else {
                result.editable = false;
                result.reason = FRS_REASON_NOTCONNECTED;
            }
        } else {
            switch( forum.publicWriter ){
                case FRS_USER_ANYBODY:
                    result.reason = FRS_USER_ANYBODY;
                    break;
                case FRS_USER_LOGGEDIN:
                    if( user ){
                        result.reason = FRS_USER_LOGGEDIN;
                    } else {
                        result.editable = false;
                        result.reason = FRS_REASON_NOTCONNECTED;
                    }
                    break;
                case FRS_USER_EMAILADDRESS:
                    if( user ){
                        const o = pwiForums.fn.labelByDoc( user, AC_EMAIL_ADDRESS );
                        if( o.origin === AC_EMAIL_ADDRESS ){
                            result.reason = FRS_USER_EMAILADDRESS;
                        } else {
                            result.editable = false;
                            result.reason = FRS_REASON_NOEMAIL;
                        }
                    } else {
                        result.editable = false;
                        result.reason = FRS_REASON_NOTCONNECTED;
                    }
                    break;
                case FRS_USER_EMAILVERIFIED:
                    if( user ){
                        const o = pwiForums.fn.labelByDoc( user, AC_EMAIL_ADDRESS );
                        if( o.origin === AC_EMAIL_ADDRESS ){
                            if( pwiForums.fn.isEmailVerified( user, o.label )){
                                result.reason = FRS_USER_EMAILVERIFIED;
                            } else {
                                result.editable = false;
                                result.reason = FRS_REASON_NOTVERIFIED;
                            }
                        } else {
                            result.editable = false;
                            result.reason = FRS_REASON_NOEMAIL;
                        }
                    } else {
                        result.editable = false;
                        result.reason = FRS_REASON_NOTCONNECTED;
                    }
                    break;
                case FRS_USER_APPFN:
                    if( user ){
                        result.editable = pwiForums.opts()['forums.publicWriterAppFn']( forum );
                        result.reason = FRS_REASON_APPFN;
                    } else {
                        result.editable = false;
                        result.reason = FRS_REASON_NOTCONNECTED;
                    }
                    break;
                default:
                    throw new Error( 'unmanaged \'publicWriter\' value \''+forum.publicWriter+'\'' );
                }
        }
        //console.log( 'forum', forum, 'user', user, 'result', result );
        return result;
    },

    // whether the specified forum is visible to the specified user ?
    // same code than queryVisble() below
    // - forum: the Forum object
    // - user: the user identifier
    isVisible( forum, user ){
        if( !forum ){
            return false;
        }
        if( user && pwiRoles.userIsInRoles( user, [ 'FRS_MODERATOR', 'FRS_PRIVATE_EDIT' ] )){
            return true;
        }
        if( user ){
            return !forum.private || pwiForums.fn.ids( forum.privateUsers || [] ).includes( user ) || pwiForums.fn.ids( forum.moderators || [] ).includes( user );
        }
        return !forum.private;
    },

    // returns an object { selector, options } suitable to list all forums visible by the current user
    //  to be used both on the server-side publication and on the client fetch
    queryVisible(){
        const userId = Meteor.userId();
        let result = { selector: {}, options: {}};

        // user is identified and exhibit FRS_PRIVATE_VIEW: all forums are visible
        if( userId && pwiRoles.userIsInRoles( userId, [ 'FRS_MODERATOR', 'FRS_PRIVATE_VIEW' ])){
            ; // nothing to add to the default (empty) result

        // user is identified but doesn't have required role => must be registered as a privateUser or a moderator
        } else if( userId ){
            result.selector = { $or: [{ private: { $ne: true } }, { 'privateUsers.id': userId }, { 'moderators.id': userId }]};

        //  - anonymous : only public forums are visible
        } else {
            result.selector = { private: { $ne: true }};
        }
        return result;
    }
};
