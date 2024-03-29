/*
 * pwix:forums/src/collections/posts/server/functions.js 
 */

Forums.server.fn = {
    ...Forums.server.fn,

    Posts: {
        // publish a cursor of moderable posts, attaching the original creator (may be deleted or moderated) post to each one
        // 'this' here is the same than inside of a publication
        moderablesByQuery( query ){
            const self = this;
            const collectionName = Forums.opts()['collections.prefix']() + Forums.Posts.radical;
        
            // add thread title
            function f_addFields( doc ){
                doc.pub = {};
                doc.pub.orig = Forums.server.collections.Posts.find({ _id: doc.threadId }, { sort: { createdAt: -1 }, limit: 1 }).fetch()[0];
                return doc;
            }
        
            const observer = Forums.server.collections.Posts.find( query.selector, query.options ).observe({
                added: function( doc){
                    //console.log( 'adding', doc );
                    self.added( collectionName, doc._id, f_addFields( doc ));
                },
                changed: function( newDoc, oldDoc ){
                    //console.log( 'changing', newDoc );
                    self.changed( collectionName, newDoc._id, f_addFields( newDoc ));
                },
                removed: function( oldDoc ){
                    //console.log( 'removing', oldDoc );
                    self.removed( collectionName, oldDoc._id );
                }
            });
        
            self.onStop( function(){
                observer.stop();
            });
        
            self.ready();
        },

        // upsert a document in the Posts collection
        // - 'modifier' is an optional object which may gather the updates, returning them to the caller
        //   it is provided by the 'frsPosts.upsert' method to be able to log the result
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
            return Forums.server.collections.Posts.upsert( selector, { $set: modifier });
        }
    }
};

