
Meteor.methods({
    'frsUsers.accountById'( id, fields ){
        const res = Meteor.users.findOne({ _id: id }, { fields: fields });
        //console.log( 'frsUsers.accountById', res );
        return res;
    }
});
