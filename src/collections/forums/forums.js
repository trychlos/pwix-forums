/*
 * /src/collections/forums/forums.js
 *
 * See server/sofns.js for server-only functions.
 * See server/methods.js for server functions remotely callable from the client
 *  (aka Meteor RPC).
 */

import { AccountsTools } from 'meteor/pwix:accounts-tools';
import SimpleSchema from 'simpl-schema';

Forums.Forums = {

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
            defaultValue: Forums._defaults.forums.publicWriter
        },
        // whether the forum is private (user must be identified and allowed to view and participate) ?
        private: {
            type: Boolean,
            defaultValue: false
        },
        // the list of users which are allowed to view this private forum
        //  Forums.C.Access.PRIVATE_VIEW is always allowed to view
        privateReaders: {
            type: Array,
            defaultValue: []
        },
        "privateReaders.$": Object,
        "privateReaders.$.id": String,
        // the list of users which are allowed to participate (write in) to this private forum
        //  Forums.C.Access.PRIVATE_EDIT is always allowed to participate
        privateWriters: {
            type: Array,
            defaultValue: []
        },
        "privateWriters.$": Object,
        "privateWriters.$.id": String,
        // what is this forum moderation strategy ?
        //  defaulting to the common configured one
        moderation: {
            type: String,
            defaultValue: Forums._defaults.forums.moderation
        },
        // the list of the moderators of *this* forum
        //  Forums.C.Access.MODERATOR (resp. FRS_PRIVATE_MODERATOR) is allowed to moderate all public (resp. private) forums
        moderators: {
            type: Array,
            defaultValue: []
        },
        "moderators.$": Object,
        "moderators.$.id": String,
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
        // whether to inform the author when a post is moderated ?
        //  defaulting to the common configured one
        inform: {
            type: String,
            defaultValue: Forums._defaults.forums.inform
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
        Forums.server.collections.Forums.deny({
            insert(){ return true; },
            update(){ return true; },
            remove(){ return true; },
        });
    },

    // whether the specified user can moderate the specified forum ?
    // - forum: the Forum object
    // - userId: the user identifier
    // Note: archived forums are not candidate to moderation
    canModerate( forum, userId ){
        const moderate = forum && userId && forum.archivedAt === null && forum.archivedBy === null &&
            (( !forum.private && Roles.userIsInRoles( userId, 'Forums.C.Access.MODERATOR' )) || 
             ( forum.private && Roles.userIsInRoles( userId, 'FRS_PRIVATE_MODERATOR' )) ||
             ( Forums.fn.ids( forum.moderators || [] ).includes( userId )));
        return moderate ? true : false;
    },

    // whether the specified forum is editable (postable) by the specified user (which may be null at the moment) ?
    // - forum: the Forum object
    // - user: the user record
    // returns an object:
    //  - editable: true|false
    //  - reason: a constant
    canWrite( forum, user ){
        if( !forum ){
            throw new Error( 'forum is mandatory, not specified' );
        }
        let result = {
            editable: true,
            reason: Forums.C.Reason.NONE
        };
        if( forum.private ){
            if( user ){
                if( Forums.fn.ids( forum.privateWriters || [] ).includes( user._id )){
                    reason = Forums.C.Reason.PRIVATEWRITERS;
                } else if( Roles.userIsInRoles( user._id, [ 'FRS_PRIVATE_EDIT' ])){
                    reason = Forums.C.Reason.PRIVATEEDIT;
                } else {
                    result.editable = false;
                    result.reason = Forums.C.Reason.PRIVATE;
                }
            } else {
                result.editable = false;
                result.reason = Forums.C.Reason.NOTCONNECTED;
            }
        } else {
            forum.publicWriter = forum.publicWriter || Forums._defaults.forums.publicWriter;
            switch( forum.publicWriter ){
                case Forums.C.Participation.ANYBODY:
                    result.reason = Forums.C.Participation.ANYBODY;
                    break;
                case Forums.C.Participation.LOGGEDIN:
                    if( user ){
                        result.reason = Forums.C.Participation.LOGGEDIN;
                    } else {
                        result.editable = false;
                        result.reason = Forums.C.Reason.NOTCONNECTED;
                    }
                    break;
                case Forums.C.Participation.EMAILADDRESS:
                    if( user ){
                        const o = AccountsTools.preferredLabel( user, AccountsTools.C.PreferredLabel.EMAIL_ADDRESS );
                        if( o.origin === AccountsTools.C.PreferredLabel.EMAIL_ADDRESS ){
                            result.reason = Forums.C.Participation.EMAILADDRESS;
                        } else {
                            result.editable = false;
                            result.reason = Forums.C.Reason.NOEMAIL;
                        }
                    } else {
                        result.editable = false;
                        result.reason = Forums.C.Reason.NOTCONNECTED;
                    }
                    break;
                case Forums.C.Participation.EMAILVERIFIED:
                    if( user ){
                        const o = AccountsTools.preferredLabel( user, AccountsTools.C.PreferredLabel.EMAIL_ADDRESS );
                        if( o.origin === AccountsTools.C.PreferredLabel.EMAIL_ADDRESS ){
                            if( AccountsTools.isEmailVerified( o.label, user )){
                                result.reason = Forums.C.Participation.EMAILVERIFIED;
                            } else {
                                result.editable = false;
                                result.reason = Forums.C.Reason.NOTVERIFIED;
                            }
                        } else {
                            result.editable = false;
                            result.reason = Forums.C.Reason.NOEMAIL;
                        }
                    } else {
                        result.editable = false;
                        result.reason = Forums.C.Reason.NOTCONNECTED;
                    }
                    break;
                case Forums.C.Participation.APPFN:
                    if( user ){
                        result.editable = Forums.opts()['forums.publicWriterAppFn']( forum );
                        result.reason = Forums.C.Reason.APPFN;
                    } else {
                        result.editable = false;
                        result.reason = Forums.C.Reason.NOTCONNECTED;
                    }
                    break;
                default:
                    throw new Error( 'unmanaged \'publicWriter\' value \''+forum.publicWriter+'\'' );
                }
        }
        //console.log( 'forum', forum, 'user', user, 'result', result );
        return result;
    },

    // returns an object { selector, options } suitable to list all forums moderable by the current user
    //  to be used both on the server-side publication and on the client fetch
    //  sorted in ascending title alpha order
    queryModerables( userId ){
        // default is to select all public+private and moderable forums
        //  we do not consider here archived forums to get messages published between since date and archive date
        let result = {
            selector: { $and: [{ moderation: { $ne: Forums.C.Moderation.NONE }}] },
            options: { sort: { title: 1 }}
        };

        // to be able to moderate a forum, identified user must have
        //  - FRS_PRIVATE_MODERATOR role for a private forum
        //  - or Forums.C.Access.MODERATOR role for a public forum
        //  - or be identified in moderators array
        if( userId ){
            let conditions = [];
            if( Roles.userIsInRoles( userId, [ 'Forums.C.Access.MODERATOR' ])){
                conditions.push({ private: { $ne: true }});
            }
            if( Roles.userIsInRoles( userId, [ 'FRS_PRIVATE_MODERATOR' ])){
                conditions.push({ private: { $eq: true }});
            }
            conditions.push({ 'moderators.id': userId });
            let orCond = { $or: [] };
            conditions.every(( cond ) => {
                orCond.$or.push( cond );
                return true;
            });
            result.selector.$and.push( orCond );

        // if not identified, unable to moderate
        //  set a fake selector to not return anything
        } else {
            result.selector = { xxxxxx: 'EMPTY_SELECTION' };
        }
        result.parms = {
            userId: userId
        };
        return result;
    },

    // returns an object { selector, options } suitable to list private forums visible by the specified user
    //  to be used both on the server-side publication and on the client fetch
    // rules are:
    //  - private forums are visible to:
    //    > a connected user who
    //      - either is explicitely listed as a reader of this private forum
    //      - or has the FRS_PRIVATE_VIEW role
    queryPrivates( userId ){
        // default is to select all public+private forums
        let result = { selector: {}, options: { sort: { title: 1 }}};

        // user is identified and exhibit FRS_PRIVATE_VIEW: all private forums are visible
        if( userId && Roles.userIsInRoles( userId, [ 'FRS_PRIVATE_VIEW' ])){
            result.selector = { private: true };

        // user is identified but doesn't have required role => is he registered as a privateReader ?
        } else if( userId ){
            result.selector = { 'privateReaders.id': userId };

        //  - anonymous : only public forums are visible
        } else {
            result.selector = { xxxxxx: 'EMPTY_SELECTION' };
        }
        return result;
    },

    // returns an object { selector, options } suitable to list all forums visible by the specified user
    //  to be used both on the server-side publication and on the client fetch
    // rules are:
    //  - public forums are always visible to all
    //  - private forums are visible to:
    //    > a connected user who
    //      - either is explicitely listed as a reader of this private forum
    //      - or has the FRS_PRIVATE_VIEW role
    queryReadables( userId ){
        // default is to select all public+private forums
        let result = { selector: {}, options: { sort: { title: 1 }}};

        // user is identified and exhibit FRS_PRIVATE_VIEW: all private forums are visible
        if( userId && Roles.userIsInRoles( userId, [ 'FRS_PRIVATE_VIEW' ])){
            ; // nothing to add to the default (full) result

        // user is identified but doesn't have required role => is he registered as a privateReader ?
        } else if( userId ){
            result.selector = { $or: [{ private: { $ne: true } }, { 'privateReaders.id': userId }]};

        //  - anonymous : only public forums are visible
        } else {
            result.selector = { private: { $ne: true }};
        }
        return result;
    }
};
