
// returns the asked forum cursor
Meteor.publish( 'frsForums.byId', function( id ){
    return pwiForums.server.collections.Forums.find({ _id: id });
});

// returns the list of visible forums
//  adds count of threads and total count of posts
// rules are:
//  - public forums are always visible to all
//  - private forums are visible to:
//    > a connected user who
//      - either is explicitely listed as a reader of this private forum
//      - or has the FRS_PRIVATE_VIEW role
Meteor.publish( 'frsForums.listVisible', function(){
    const self = this;
    const collectionName = pwiForums.opts()['collections.prefix']() + pwiForums.Forums.radical;
    const query = pwiForums.Forums.queryReadables();
    //console.log( query );

    function f_addFields( doc ){
        doc.threadsCount = pwiForums.server.collections.Posts.find({ forum: doc._id, threadId: null, deletedAt: null }).count();
        doc.postsCount = pwiForums.server.collections.Posts.find({ forum: doc._id, deletedAt: null }).count();
        if( doc.postsCount > 0 ){
            doc.lastPost = pwiForums.server.collections.Posts.find({ forum: doc._id }, { sort: { createdAt: -1 }, limit: 1 }).fetch()[0];
        } else {
            doc.lastPost = null;
        }
        if( !doc.moderation ){
            doc.mderation = defaults.common.forums.moderation;
        }
        if( !doc.inform ){
            doc.inform = defaults.common.forums.inform;
        }
        return doc;
    }

    const observer = pwiForums.server.collections.Forums.find( query.selector, query.options ).observe({
        added: function( doc){
            self.added( collectionName, doc._id, f_addFields( doc ));
        },
        changed: function( newDoc, oldDoc ){
            self.changed( collectionName, newDoc._id, f_addFields( newDoc ));
        },
        removed: function( oldDoc ){
            self.removed( collectionName, oldDoc._id );
        }
    });

    self.onStop( function(){
        observer.stop();
    });

    self.ready();
});

// returns the list of private forums visible to this user
Meteor.publish( 'frsForums.listVisiblePrivate', function( userId ){
    const self = this;
    const collectionName = pwiForums.opts()['collections.prefix']() + pwiForums.Forums.radical;

    // returns the doc + a 'listVisiblePrivate' flag if it is concerned
    function f_filter( doc ){
        let newDoc = null;
        if( doc.private && doc.privateUsers ){
            const array = pwiForums.fn.ids( doc.privateUsers );
            if( array.includes( userId )){
                newDoc = doc;
                newDoc.listVisiblePrivate = true;
            }
        }
        return newDoc;
    }

    const observer = pwiForums.server.collections.Forums.find().observe({
        added: function( doc){
            const filtered = f_filter( doc );
            if( filtered ){
                //console.log( 'private adding', filtered );
                self.added( collectionName, doc._id, filtered );
            }
        },
        changed: function( newDoc, oldDoc ){
            const filtered = f_filter( newDoc );
            if( filtered ){
                self.changed( collectionName, newDoc._id, filtered );
            }
        },
        removed: function( oldDoc ){
            self.removed( collectionName, oldDoc._id );
        }
    });

    self.onStop( function(){
        observer.stop();
    });

    self.ready();
});

// returns the list of forums which this user is authorized to moderate
Meteor.publish( 'frsForums.listModerablesByUSerId', function( userId ){
    const query = pwiForums.Forums.queryModerables( userId );
    return pwiForums.server.Forums.findByQuery( query );
});

// returns the list of forums which this user is authorized to moderate
Meteor.publish( 'frsForums.listModerablesByQuery', function( query ){
    return pwiForums.server.Forums.findByQuery( query );
});
