/*
 * pwix:forums/src/collections/forums/server/functions.js 
 */

pwiForums.server.fn = {
    ...pwiForums.server.fn,

    Forums: {
        // all forums requests pass eventually resolve to a find( something )
        //  so pass through this function which add some published fields:
        //  - threadsCount
        //  - postsCount
        //  - lastPost
        // 'this' here is the same than inside of a publication
        byQuery( query ){
            //return pwiForums.server.collections.Forums.find( query.selector, query.options );
            const self = this;
            const collectionName = pwiForums.opts()['collections.prefix']() + pwiForums.Forums.radical;
            //console.log( query );
        
            // this returns a Promise
            function f_addFields( doc ){
                // make sure some fields have at least a default value
                doc.mderation = doc.moderation || defaults.common.forums.moderation;
                doc.inform = doc.inform || defaults.common.forums.inform;
                // prepare for some published fields
                doc.pub = {};
                let promises = [];
                //doc.threadsCount = pwiForums.server.collections.Posts.find({ forum: doc._id, threadLeader: true }).count();
                promises.push( pwiForums.server.collections.Posts.countDocuments({ forum: doc._id, threadLeader: true })
                    .then(( count ) => {
                        doc.pub.threadsCount = count;
                    }));
                //doc.postsCount = pwiForums.server.collections.Posts.find({ forum: doc._id, deletedAt: null }).count();
                promises.push( pwiForums.server.collections.Posts.countDocuments({ forum: doc._id, deletedAt: null })
                    .then(( count ) => {
                        doc.pub.postsCount = count;
                        doc.pub.lastPost = count ? pwiForums.server.collections.Posts.find({ forum: doc._id }, { sort: { createdAt: -1 }, limit: 1 }).fetch()[0] : null;
                    }));
                return Promise.all( promises );
            }
        
            const observer = pwiForums.server.collections.Forums.find( query.selector, query.options ).observe({
                added: function( doc){
                    //self.added( collectionName, doc._id, f_addFields( doc ));
                    f_addFields( doc ).then(() => { self.added( collectionName, doc._id, doc )});
                },
                changed: function( newDoc, oldDoc ){
                    //self.changed( collectionName, newDoc._id, f_addFields( newDoc ));
                    f_addFields( newDoc ).then(() => { self.changed( collectionName, newDoc._id, doc )});
                },
                removed: function( oldDoc ){
                    self.removed( collectionName, oldDoc._id );
                }
            });
        
            self.onStop( function(){
                observer.stop();
            });
        
            self.ready();
        }
    }
};
