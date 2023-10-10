/*
 * pwix:forums/src/collections/forums/server/functions.js 
 */

Forums.server.fn = {
    ...Forums.server.fn,

    Forums: {
        // all forums requests eventually resolve to a find( something... )
        //  so pass through this function which add some published fields:
        //  - threadsCount
        //  - postsCount
        //  - lastPost
        // 'this' here is the same than inside of a publication
        byQuery( query ){
            const self = this;
            const collectionName = Forums.opts()['collections.prefix']() + Forums.Forums.radical;
            let forums = {};
            //console.log( query );

            // query Posts
            const rawCollection = Forums.server.collections.Posts.rawCollection();

            function f_updatePost( forumId ){
                let forum = forums[forumId];
                if( forum ){
                    const postQuery = Forums.Posts.queryReadables( forum, self.userId );
                    rawCollection.distinct( 'threadId', postQuery.selector )
                        .then(( res ) => {
                            console.log( forum.title, res );
                            forum.pub.threadsList = res;
                            self.changed( collectionName, forum._id, forum )
                        });
                    Forums.server.collections.Posts.countDocuments( postQuery.selector )
                        .then(( count ) => {
                            forum.pub.postsCount = count;
                            forum.pub.lastPost = count ? Forums.server.collections.Posts.find({ forum: forumId }, { sort: { createdAt: -1 }, limit: 1 }).fetch()[0] : null;
                            self.changed( collectionName, forum._id, forum )
                        });
                }
            }
            
            // we set an observer on the whole Posts collection
            //  so that we are informed each time anything changes
            const postObserver = Forums.server.collections.Posts.find().observe({
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
            function f_updateForum( doc ){
                // make sure some fields have at least a default value
                doc.moderation = doc.moderation || Forums._defaults.forums.moderation;
                doc.inform = doc.inform || Forums._defaults.forums.inform;
                // prepare for some published fields
                doc.pub = {};
            }

            const observer = Forums.server.collections.Forums.find( query.selector, query.options ).observe({
                added: function( doc){
                    f_updateForum( doc );
                    self.added( collectionName, doc._id, doc );
                    forums[doc._id] = doc;
                    f_updatePost( doc._id );
                },
                changed: function( newDoc, oldDoc ){
                    f_updateForum( newDoc );
                    self.changed( collectionName, newDoc._id, newDoc );
                    forums[newDoc._id] = newDoc;
                    f_updatePost( doc._id );
                },
                removed: function( oldDoc ){
                    self.removed( collectionName, oldDoc._id );
                    delete forums[doc._id];
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
