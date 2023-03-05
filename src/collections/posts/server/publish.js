
Meteor.publish( 'frsPosts.byId', function( id ){
    return pwiForums.server.collections.Posts.find({ _id: id });
});

Meteor.publish( 'frsPosts.byQuery', function( query ){
    return pwiForums.server.collections.Posts.find( query.selector, query.options );
});

// returns the list of to-be-moderated posts depending of user display options
// opts is
//  - forums: an array of all forums moderable by the user
//  - since: the date to not go before (as a Date object)
//  - showValidated: whether to also return the already validated posts
//  - showModerated: whether to also return the already moderated posts
//
// returned cursor is ordered by forumId, threadId, increasing creation date (most old first)
//  may be not the actual display order, but enough to compute display breaks

Meteor.publish( 'frsPosts.moderablesByQuery', function( query ){
    return ( pwiForums.server.fn.Posts.moderablesByQuery.bind( this ))( query );
});
