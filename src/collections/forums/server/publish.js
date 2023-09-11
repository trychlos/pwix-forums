
// returns the asked forum cursor
Meteor.publish( 'frsForums.byId', function( id ){
    //return Forums.server.collections.Forums.find({ _id: id });
    return ( Forums.server.fn.Forums.byQuery.bind( this ))({ selector: { _id: id }, options: {}});
});

// returns the asked forums cursor
Meteor.publish( 'frsForums.byQuery', function( query ){
    return ( Forums.server.fn.Forums.byQuery.bind( this ))( query );
});
