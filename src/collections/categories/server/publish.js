
// returns the list of known categories
//  all the categories are returned here as we don't know if the user will be able to see the forums
//
Meteor.publish( 'frsCategories.listAll', function(){
    return Forums.server.collections.Categories.find();
});
