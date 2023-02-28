
// returns the asked forum cursor
Meteor.publish( 'frsForums.byId', function( id ){
    //return pwiForums.server.collections.Forums.find({ _id: id });
    return ( pwiForums.server.fn.Forums.byQuery.bind( this ))({ selector: { _id: id }, options: {}});
});

// returns the asked forums cursor
Meteor.publish( 'frsForums.byQuery', function( query ){
    return ( pwiForums.server.fn.Forums.byQuery.bind( this ))( query );
});
