/*
 * pwix:forums/src/client/js/functions.js
 */

import { Promise } from 'meteor/promise';
import { ReactiveVar } from 'meteor/reactive-var';
import { Tracker } from 'meteor/tracker';

if( Meteor.isClient ){

    pwiForums.client.fn = {

        // a callback defined for the pwiRoles:prView component
        //  must return a Promise
        viewRoles( tab ){
            //console.log( 'pwix:forums pwiForums.client.fn.viewRoles' );
            const userId = Meteor.userId();
            return new Promise(( resolve, reject ) => {
                let html = '';
                if( userId ){
                    html += '<p>' + pwiForums.fn.i18n( 'roles_view.public_label' ) + '</p>';
                    const privHandle = Meteor.subscribe( 'frsForums.listVisiblePrivate', userId );
                    const modHandle = Meteor.subscribe( 'frsForums.listVisibleModerators', userId );
                    const rv = new ReactiveVar( 0 );
                    let done = 0;
                    Tracker.autorun(() => {
                        if( privHandle.ready()){
                            const privates = pwiForums.client.collections.Forums.find({ listVisiblePrivate: true }, { sort: { title: 1 }}).fetch();
                            if( privates.length ){
                                html += '<p>' + pwiForums.fn.i18n( 'roles_view.private_label' );
                                html += '<ul>'
                                privates.every(( f ) => {
                                    html += '<li>'+f.title+'</li>';
                                    return true;
                                });
                                html += '</ul>'
                                html += '</p>';
                            }
                            done += 1;
                            rv.set( done );
                        }
                    });
                    Tracker.autorun(() => {
                        if( modHandle.ready()){
                            const mods = pwiForums.client.collections.Forums.find({ listVisibleModerators: true }, { sort: { title: 1 }}).fetch();
                            if( mods.length ){
                                html += '<p>' + pwiForums.fn.i18n( 'roles_view.moderators_label' );
                                html += '<ul>'
                                mods.every(( f ) => {
                                    html += '<li>'+f.title+'</li>';
                                    return true;
                                });
                                html += '</ul>'
                                html += '</p>';
                            }
                            done += 1;
                            rv.set( done );
                        }
                    });
                    Tracker.autorun(() => {
                        if( rv.get() === 2 ){
                            resolve( html );
                        }
                    });
                } else {
                    resolve( pwiForums.fn.i18n( 'roles_view.none' ))
                }
            });
        }
    };
}
