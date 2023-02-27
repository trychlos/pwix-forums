/*
 * pwix:forums/src/collections/forums/server/functions.js 
 */

pwiForums.server.Forums = {
    findByQuery( query ){
        return pwiForums.server.collections.Forums.find( query.selector, query.options );
    }
};
