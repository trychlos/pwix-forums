/*
 * pwix:forums/src/collections/posts/server/functions.js 
 */

pwiForums.server.fn = {
    ...pwiForums.server.fn,

    Posts: {
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
        },
    
        // upsert a document in the Posts collection
        //  'modifier' is an optional object which may gather the updates, returning them to the caller
        upsert( doc, modifier={} ){
            const selector = { _id: doc._id };
            modifier = {
                content: doc.content.trim(),
                forum: doc.forum,
                owner: doc.owner
            };
            function f_add( field ){
                if( doc[field] ){
                    modifier[field] = doc[field];
                }
            }
            if( doc.title ){
                modifier.title = doc.title.trim();
            }
            if( doc.deletedText ){
                modifier.deletedText = doc.deletedText.trim();
            }
            f_add( 'replyTo' );
            f_add( 'threadId' );
            f_add( 'pinned' );
            f_add( 'replyable' );
            f_add( 'deletedAt' );
            f_add( 'deletedBy' );
            f_add( 'deletedBecause' );
            f_add( 'deletedText' );
            f_add( 'validatedAt' );
            f_add( 'validatedBy' );
            if( doc && doc._id ){
                modifier.updatedAt = new Date();
                modifier.updatedBy = Meteor.userId();
            } else {
                modifier.createdAt = new Date();
                modifier.createdBy = Meteor.userId();
            }
            // https://docs.meteor.com/api/collections.html
            // the returned 'res' is an object with keys 'numberAffected' (the number of documents modified) and 'insertedId' (the unique _id of the document that was inserted, if any).
            //console.log( 'frsCategories.upsert: selector', selector );
            //console.log( 'frsCategories.upsert: modifier', modifier );
            return pwiForums.server.collections.Posts.upsert( selector, { $set: modifier });
        }
    }
};

