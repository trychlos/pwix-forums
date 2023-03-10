/*
 * pwi:forums/src/components/frs_forum_tab/frs_forum_tab.js
 *
 * Forum properties edition.
 * A tab of frs_forum_edit modal.
 * 
 * Parms:
 * - forum: a ReactiveVar with an object { forum: <forum> }
 * 
 * Todo #93: we do not want that archive/unarchive actions be reactive.
 */

import { ReactiveVar } from 'meteor/reactive-var';
import { pwixI18n as i18n } from 'meteor/pwix:i18n';
import { pwixAccountsTools } from 'meteor/pwix:accounts-tools';

import { pwiForums } from '../../js/index.js';
import { frsOrders } from '../../classes/frs_orders.class.js';

import '../../stylesheets/frs_forums.less';

import './frs_forum_tab.html';

Template.frs_forum_tab.onCreated( function(){
    const self = this;
    //console.log( self );

    self.FRS = {
        orderedTree: new ReactiveVar( new frsOrders() ),

        // a deep copy of the input forum
        //  to be used as a fixed object to make archive/unarchive *unreactive*
        orig: null,
        origSet: new ReactiveVar( false ),

        // set a value in the object
        setField( field, value ){
            const rv = Template.currentData().forum;
            if( rv ){
                const f = rv.get() || {};
                f[field] = value;
                if( field === 'unarchive' && value == true ){
                    f.archivedAt = null;
                    f.archivedBy = null;
                }
                if( field === 'archive' && value == true ){
                    f.archivedAt = new Date();
                    f.archivedBy = Meteor.userId();
                }
                rv.set( f );
            }
        }
    };

    // take a deep copy of the provided forum
    self.autorun(() => {
        if( !self.FRS.origSet.get()){
            const rv = Template.currentData().forum;
            const forum = rv ? rv.get() : null;
            if( forum ){
                self.FRS.orig = { ...forum };
                self.FRS.origSet.set( true );
                if( forum.archivedAt && forum.archivedBy ){
                    forum.dynArchived = pwixAccountsTools.preferredLabelById( forum.archivedBy, AC_USERNAME );
                }
            }
        }
    });
});

Template.frs_forum_tab.helpers({
    // category title (read-only)
    catLabel(){
        const rv = Template.currentData().forum;
        const f = rv ? rv.get() : null;
        const cat_id = f ? f.category : pwiForums.Categories.default;
        const cat = Template.instance().FRS.orderedTree.get().category( cat_id );
        return cat.title;
    },

    // forum has been archived
    forArchivedAtBy: function(){
        const rv = Template.currentData().forum;
        const f = rv ? rv.get() : null;
        return pwiForums.fn.i18n( 'forum_edit.archived_by_label', i18n.dateTime( f.archivedAt ), f.archivedBy, f.dynArchived.get().label );
    },

    // forum comment
    forComment(){
        const rv = Template.currentData().forum;
        const f = rv ? rv.get() : null;
        return f ? f.internalComment : '';
    },

    // forum description
    forDescription(){
        const rv = Template.currentData().forum;
        const f = rv ? rv.get() : null;
        return f ? f.displayableDescription : '';
    },

    // are the deleted posts visible for the admin ?
    //  defaulting to true
    forDeletedAdmin(){
        const rv = Template.currentData().forum;
        const f = rv ? rv.get() : null;
        const show = f ? f.showDeletedForAdmin : true;
        return show ? 'checked' : '';
    },

    // are the deleted posts visible for the user ?
    //  defaulting to false
    forDeletedUser(){
        const rv = Template.currentData().forum;
        const f = rv ? rv.get() : null;
        const show = f ? f.showDeletedForUser : false;
        return show ? 'checked' : '';
    },

    // private ?
    //  defaulting to false
    forPrivate(){
        const rv = Template.currentData().forum;
        const f = rv ? rv.get() : null;
        const priv = f ? f.private : false;
        return priv ? 'checked' : '';
    },

    // forum title
    forTitle(){
        const rv = Template.currentData().forum;
        const f = rv ? rv.get() : null;
        return f ? f.title : '';
    },

    // get a translated label
    i18n( opts ){
        return pwiForums.fn.i18n( 'forum_edit.'+opts.hash.label );
    },

    // returns the object id
    id(){
        const rv = Template.currentData().forum;
        const f = rv ? rv.get() : null;
        return f ? f._id : '';
    },

    // is the forum archived ?
    //  this is designed to be *not* reactive (todo #93)
    isArchived(){
        const FRS = Template.instance().FRS;
        if( FRS.origSet.get()){
            return FRS.orig && ( FRS.orig.archivedAt || FRS.orig.archivedBy );
        }
    }
});

Template.frs_forum_tab.events({

    // handle changes on the fields
    'change input[type="text"]'( event, instance ){
        const value = $( event.currentTarget ).val() || '';
        const field = $( event.currentTarget ).data( 'frs-field' );
        instance.FRS.setField( field, value.trim());
    },
    'change textarea'( event, instance ){
        const value = $( event.currentTarget ).val() || '';
        const field = $( event.currentTarget ).data( 'frs-field' );
        instance.FRS.setField( field, value.trim());
    },
    'change input[type="checkbox"]'( event, instance ){
        const checked = instance.$( 'input.frs-private' ).prop( 'checked' );
        const field = $( event.currentTarget ).data( 'frs-field' );
        instance.FRS.setField( field, checked );
    }
});
