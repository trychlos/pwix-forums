
Meteor.methods({
    // add a list of forums ids to the list attached to a category id
    'frsOrders.addByIds'( cat_id, forums_ids ){
        const selector = { type:'FOR', category:cat_id };
        let doc = pwiForums.server.collections.Orders.findOne( selector );
        if( doc ){
            doc.updatedAt = new Date();
            doc.updatedBy = Meteor.userId();
        } else {
            doc = {
                createdAt: new Date(),
                createdBy: Meteor.userId(),
                order: []
            };
        }
        const array = doc.order.concat( forums_ids );
        doc.order = array.slice();
        const ret = pwiForums.server.collections.Orders.update( selector, { $set: doc });
        if( !ret ){
            throw new Meteor.Error(
                'frsOrders.addByIds',
                'Unable to add to \''+cat_id+'\' forums ids ', forums_ids );
        } else {
            console.log( 'frsOrders.addByIds', 'cat_id', cat_id, 'forums_ids', forums_ids, 'ret', ret );
        }
        return ret;
    },

    // delete an item from an ordered list
    'frsOrders.removeById'( selector, id ){
        let doc = pwiForums.server.collections.Orders.findOne( selector );
        let ret = true;
        if( doc ){
            const idx = doc.order.indexOf( id );
            if( idx !== -1 ){
                doc.order.splice( idx, 1 );
                doc.updatedAt = new Date();
                doc.updatedBy = Meteor.userId();
                ret = pwiForums.server.collections.Orders.update( selector, { $set: doc });
                if( !ret ){
                    throw new Meteor.Error(
                        'frsOrders.removeById',
                        'Unable to remove \''+id+'\' from ', selector );
                } else {
                    console.log( 'frsOrders.removeById', 'id', id, 'selector', selector, 'ret', ret );
                }
            }
        }
        return ret;
    },

    // upsert an order
    'frsOrders.upsert'( selector, order ){
        let origs = pwiForums.server.collections.Orders.find( selector )
        if( origs ){
            origs.fetch();
        }
        let modifier = {
            order: order
        }
        let orig = origs && origs.length > 0 ? orig[0] : null;
        console.log( 'frsOrders.upsert selector', selector, 'modifier', modifier, 'orig', orig );
        //console.log( 'frsOrders.upsertForCategories', orig, list );
        if( orig && orig._id ){
            modifier.updatedAt = new Date();
            modifier.updatedBy = Meteor.userId();
        } else {
            modifier.createdAt = new Date();
            modifier.createdBy = Meteor.userId();
        }
        // https://docs.meteor.com/api/collections.html
        // the returned 'res' is an object with keys 'numberAffected' (the number of documents modified) and 'insertedId' (the unique _id of the document that was inserted, if any).
        //console.log( 'frsOrders.upsertForCategories: selector', selector );
        //console.log( 'frsOrders.upsertForCategories: modifier', modifier );
        const res = pwiForums.server.collections.Orders.upsert( selector, { $set: modifier });
        if( !res ){
            throw new Meteor.Error(
                'frsOrders.upsert',
                'Unable to upsert "CAT" order' );
        }
        console.log( 'frsOrders.upsert res', res );
        return res;
    }
});
