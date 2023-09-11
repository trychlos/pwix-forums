
//  returns an array of Categories objects
//  each Category, having a 'children' key with an array for Forums objects

Meteor.publish( 'frsOrders.listAll', function(){
    return Forums.server.collections.Orders.find();
});
