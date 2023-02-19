
import { frsColor } from '../../../common/classes/frs_color.class.js';

Meteor.methods({
    // delete a category
    //  + Orders collection: remove the category from the categories order
    //  + Forums collection: all forums attached to this deleted category are reaffected to 'Uncategorized'
    //  + Orders collection: add these forums at the end of the Uncategorized ordered list
    // should be a transation :( but not supported by MongoDB on single deployment (and not supported by Meteor even on cluster on shared deployments)
    'frsCategories.delete'( id ){
        const ret = pwiForums.server.collections.Categories.remove( id );
        if( !ret ){
            throw new Meteor.Error(
                'frsCategories.delete',
                'Unable to delete the \''+id+'\' category' );
        }
        Meteor.call( 'frsOrders.removeById', { type:'CAT' }, id );  // no need to wait for the result
        Meteor.call( 'frsForums.categoryDeleted', id, ( err, res ) => {
            if( !err ){
                Meteor.call( 'frsOrders.addByIds', res );
            }
        });
        return ret;
    },

    // create/update a category
    'frsCategories.upsert'( o ){
        //console.log( 'frsCategories.upsert: o', o );
        const selector = { _id: o._id };
        let modifier = {
            title: o.title || '',
            description: o.description || '',
            color: o.color || frsColor.Random().color()
        };
        modifier.title = modifier.title.trim();
        modifier.description = modifier.description.trim();
        if( o && o.createdAt ){
            modifier.createdAt = o.createdAt;
            modifier.createdBy = o.createdBy;
            modifier.updatedAt = new Date();
            modifier.updatedBy = Meteor.userId();
        } else {
            modifier.createdAt = new Date();
            modifier.createdBy = Meteor.userId();
        }
        // https://docs.meteor.com/api/collections.html
        // the returned 'res' is an object with keys 'numberAffected' (the number of documents modified) and 'insertedId' (the unique _id of the document that was inserted, if any).
        //console.log( 'frsCategories.upsert: selector', selector );
        //console.log( 'frsCategories.upsert: modifier', modifier );
        const res = pwiForums.server.collections.Categories.upsert( selector, { $set: modifier });
        if( !res ){
            throw new Meteor.Error(
                'frsCategories.upsert',
                'Unable to upsert "'+o.title+'" category' );
        } else {
            res.upserted = {
                _id: o._id || res.insertedId,
                ...modifier
            }
        }
        console.log( 'frsCategories.upsert returns', res );
        return res;
    },
});
