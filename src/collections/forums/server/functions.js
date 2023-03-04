/*
 * pwix:forums/src/collections/forums/server/functions.js 
 */

pwiForums.server.fn = {
    ...pwiForums.server.fn,

    Forums: {
        // all forums requests eventually resolve to a find( something... )
        //  so pass through this function which add some published fields:
        //  - threadsCount
        //  - postsCount
        //  - lastPost
        // 'this' here is the same than inside of a publication
        byQuery( query ){
            const self = this;
            const collectionName = pwiForums.opts()['collections.prefix']() + pwiForums.Forums.radical;
            let forums = {};
            //console.log( query );

        
            // query Posts
            const rawCollection = pwiForums.server.collections.Posts.rawCollection();

            function f_updatePost( forumId ){
                let forum = forums[forumId];
                if( forum ){
                    const postQuery = pwiForums.Posts.queryReadables( forum, self.userId );
                    rawCollection.distinct( 'threadId', postQuery.selector )
                        .then(( res ) => {
                            console.log( forum.title, res );
                            forum.pub.threadsCount = res.length;
                            self.changed( collectionName, forum._id, forum )
                        });
                }
            }
            
            // we set an observer on the whole Posts collection
            //  so that we are informed each time anything changes
            const postObserver = pwiForums.server.collections.Posts.find().observe({
                added: function( post ){
                    f_updatePost( post.forum );
                },
                changed: function( newPost, oldPost ){
                    f_updatePost( newPost.forum );
                },
                removed: function( oldPost ){
                    f_updatePost( oldPost.forum );
                }
            });

            // when a Forum document is added, changed or is removed:
            //  query Posts for this forum, getting threadsCount, total postsCount and lastPost
            // this returns a Promise
            function f_updateForum( doc ){
                // make sure some fields have at least a default value
                doc.moderation = doc.moderation || defaults.common.forums.moderation;
                doc.inform = doc.inform || defaults.common.forums.inform;
                // prepare for some published fields
                doc.pub = {};
                let promises = [];

                //doc.postsCount = pwiForums.server.collections.Posts.find({ forum: doc._id, deletedAt: null }).count();
                const postQuery = pwiForums.Posts.queryReadables( doc, self.userId );
                promises.push( pwiForums.server.collections.Posts.countDocuments( postQuery.selector )
                    .then(( count ) => {
                        doc.pub.postsCount = count;
                        doc.pub.lastPost = count ? pwiForums.server.collections.Posts.find({ forum: doc._id }, { sort: { createdAt: -1 }, limit: 1 }).fetch()[0] : null;
                    }));
                return Promise.all( promises );
            }
        
            const observer = pwiForums.server.collections.Forums.find( query.selector, query.options ).observe({
                added: function( doc){
                    forums[doc._id] = doc;
                    f_updateForum( doc ).then(() => {
                        self.added( collectionName, doc._id, doc );
                        f_updatePost( doc._id );
                    });
                },
                changed: function( newDoc, oldDoc ){
                    forums[newDoc._id] = newDoc;
                    f_updateForum( newDoc ).then(() => {
                        self.changed( collectionName, newDoc._id, newDoc );
                        f_updatePost( doc._id );
                    });
                },
                removed: function( oldDoc ){
                    delete forums[doc._id];
                    self.removed( collectionName, oldDoc._id );
                    f_updatePost( doc._id );
                }
            });
        
            self.onStop( function(){
                observer.stop();
            });
        
            self.ready();
        }
    }
};
