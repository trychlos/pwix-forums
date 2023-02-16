
// returns the list of known categories
//  all the categories are returned here as we don't know if the user will be able to see the forums
//  the filter is made in frs_orders class
Meteor.publish( 'frsCategories.listAll', function(){
    return pwiForums.server.collections.Categories.find();
});
