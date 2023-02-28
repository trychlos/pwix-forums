/*
 * pwix:forums/src/collections/forums/server/functions.js 
 */

pwiForums.server.fn = {
    ...pwiForums.server.fn,

    Forums: {
        findByQuery( query ){
            return pwiForums.server.collections.Forums.find( query.selector, query.options );
        }
    }
};
