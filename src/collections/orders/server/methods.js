
Meteor.methods({

    // a single method to manage the consequence of a move of a forum in the ordered tree (from frs_tree_tab)
    // 'parms' is:
    //  forum: the forum identifier,
    //  newcat: the new category identifier,
    //  newcatorder: the new forums order for this category
    //  prevcat: the previous category (may be the same than the current one)
    //  prevcatorder: the new order in this previous category
    'frsOrders.postMove'( parms ){
        // first, and always, set the new order in the new category
        let selector = { type:'FOR', category: parms.newcat };
        let modifier = { order: parms.newcatorder, updatedAt: new Date(), updatedBy: Meteor.userId() };
        let res = pwiForums.server.collections.Orders.update( selector, { $set: modifier });
        if( !res ){
            throw new Meteor.Error(
                'frsOrders.update',
                'Unable to update forums order', { ...selector, ...modifier });
        } else {
            console.log( 'frsOrders.update', selector, modifier, res );
        }
        // if  category has changed, then also set the new order in the previous category
        if( parms.prevcat !== parms.newcat ){
            selector = { type:'FOR', category: parms.prevcat };
            modifier = { order: parms.prevcatorder, updatedAt: new Date(), updatedBy: Meteor.userId() };
            res = pwiForums.server.collections.Orders.update( selector, { $set: modifier });
            if( !res ){
                throw new Meteor.Error(
                    'frsOrders.update',
                    'Unable to update forums order', { ...selector, ...modifier });
            } else {
                console.log( 'frsOrders.update', selector, modifier, res );
            }
            Meteor.call( 'frsForums.setCategory', parms.forum, parms.newcat, ( err, res ) => {
                if( err ){
                    console.error( err );
                } else {
                    console.log( 'frsOrders frsForums.setCategory', res );
                }
            });
        }
        return res;
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
