/*
 * pwix:forums/src/collections/posts/server/functions.js 
 */

pwiForums.server.Posts = {
    findModerablesByQuery( publication, query ){
        const collectionName = pwiForums.opts()['collections.prefix']() + pwiForums.Posts.radical;
    
        // add thread title
        function f_addFields( doc ){
            const originalPost = doc.threadId ? pwiForums.server.collections.Posts.findOne({ _id: doc.threadId }) : doc;
            doc.threadTitle = originalPost.title;
            doc.threadDate = originalPost.createdAt;
            doc.threadIdentifier = originalPost._id;
            return doc;
        }
    
        const observer = pwiForums.server.collections.Posts.find( query.selector, query.options ).observe({
            added: function( doc){
                //console.log( 'adding', doc );
                publication.added( collectionName, doc._id, f_addFields( doc ));
            },
            changed: function( newDoc, oldDoc ){
                //console.log( 'changing', newDoc );
                publication.changed( collectionName, newDoc._id, f_addFields( newDoc ));
            },
            removed: function( oldDoc ){
                //console.log( 'removing', oldDoc );
                publication.removed( collectionName, oldDoc._id );
            }
        });
    
        publication.onStop( function(){
            observer.stop();
        });
    
        publication.ready();
    }
};
