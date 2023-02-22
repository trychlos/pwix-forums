
Meteor.methods({

    'frsForums.accountById'( id, fields ){
        return Meteor.users.findOne({ _id: id }, { fields: fields });
    },

    // a category has been deleted
    //  categorize all attached forum to 'none'
    //  returns the impacted forums
    'frsForums.categoryDeleted'( id ){
        const list = pwiForums.server.collections.Forums.find({ category:id });
        const ret = pwiForums.server.collections.Forums.update({ category:id }, { $set: { category:pwiForums.Categories.default }});
        if( !ret ){
            throw new Meteor.Error(
                'frsForums.categoryDeleted',
                'Unable to update the concerned forums for the \''+id+'\' category' );
        }
        console.log( 'Forums.categoryDeleted', 'id', id, 'ret', ret, 'list', list );
        return list || [];
    },

    // delete a forum
    'frsForums.delete'( id ){
        let ret = pwiForums.server.collections.Forums.remove( id );
        console.log( 'Forums.delete \''+id+'\' returns '+ret );
        if( !ret ){
            throw new Meteor.Error(
                'frsForums.delete',
                'Unable to delete \''+id+'\' forum' );
        }
        return ret;
    },

    // create/update the category of an existing forum
    'frsForums.setCategory'( id, newcat ){
        console.log( 'frsForums.setCategory: id='+id );
        const selector = { _id: id };
        let modifier = {
            category: newcat ? newcat : pwiForums.Categories.default,
            updatedAt: new Date(),
            updatedBy: Meteor.userId()
        }
        const res = pwiForums.server.collections.Forums.update( selector, { $set: modifier });
        if( !res ){
            throw new Meteor.Error(
                'frsForums.setCategory',
                'Unable to update the category of the \''+id+'\' forum' );
        }
        console.log( 'frsForums.setCategory: res', res );
        return res;
    },

    // create/update a forum
    'frsForums.upsert'( o ){
        //console.log( 'frsForums.upsert: o', o );
        const selector = { _id: o._id };
        let modifier = {
            title: o.title.trim(),
            displayableDescription: o.displayableDescription || '',
            internalComment: o.internalComment || '',
            category: o.category || Categories.default,
            private: o.private,
            privateUsers: o.privateUsers,
            showDeletedForAdmin: o.showDeletedForAdmin,
            showDeletedForUser: o.showDeletedForUser,
            moderators: o.moderators,
        };
        if( o && o.createdAt ){
            modifier.createdAt = o.createdAt;
            modifier.createdBy = o.createdBy;
            modifier.updatedAt = new Date();
            modifier.updatedBy = Meteor.userId();
        } else {
            modifier.createdAt = new Date();
            modifier.createdBy = Meteor.userId();
        }
        if( o.archivedAt && o.archivedBy ){
            modifier.archivedAt = o.archivedAt;
            modifier.archivedBy = o.archivedBy;
        } else {
            modifier.archivedAt = null;
            modifier.archivedBy = null;
        }
        // https://docs.meteor.com/api/collections.html
        // the returned 'res' is an object with keys 'numberAffected' (the number of documents modified) and 'insertedId' (the unique _id of the document that was inserted, if any).
        //console.log( 'frsForums.upsert: selector', selector );
        //console.log( 'frsForums.upsert: modifier', modifier );
        const res = pwiForums.server.collections.Forums.upsert( selector, { $set: modifier });
        if( !res ){
            throw new Meteor.Error(
                'frsForums.upsert',
                'Unable to upsert "'+o.title+'" forum' );
        } else {
            res.upserted = {
                _id: o._id || res.insertedId,
                ...modifier
            }
        }
        console.log( 'frsForums.upsert returns', res );
        return res;
    }
});
