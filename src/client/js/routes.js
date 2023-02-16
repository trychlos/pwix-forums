/*
 * pwi:forums/src/client/js/routes.js
 */

// see the forums
//  provided by frsForums
pwiForums.routeForums = function(){
    return {
        route: pwiForums.conf.route,
        mask: pwiForums.conf.route
    }
};

// see the threads opened in the current forum
//  provided by frsThreads
pwiForums.routeThreads = function( id ){
    const prefix = '/f/';
    return {
        route: pwiForums.conf.route + prefix + ( id || '' ),
        mask: pwiForums.conf.route + prefix + ':forumId'
    }
};

// see the posts inside of the current thread
//  provided by frsPosts
pwiForums.routePosts = function( id ){
    const prefix = '/t/';
    return {
        route: pwiForums.conf.route + prefix + ( id || '' ),
        mask: pwiForums.conf.route + prefix + ':threadId'
    }
};

// categories and forums management
//  provided by frsManager
pwiForums.routeAdmin = function(){
    return {
        route: pwiForums.conf.route + '/admin',
        mask: pwiForums.conf.route + '/admin'
    }
};
