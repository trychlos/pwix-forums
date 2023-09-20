/*
 * pwix:forums/src/client/js/functions.js
 */

import { Promise } from 'meteor/promise';
import { ReactiveVar } from 'meteor/reactive-var';
import { Tracker } from 'meteor/tracker';

Forums.client.fn = {

    // compute the actual route to display the list of forums
    routeForums(){
        return Forums.opts()['routes.forums']();
    },

    // compute the actual route to display the list of posts in a thread
    routePosts( id ){
        return Forums.opts()['routes.posts']().replace( ':threadId', id );
    },

    // compute the actual route to display the provided forum content (aka list of opened threads)
    routeThreads( id ){
        return Forums.opts()['routes.threads']().replace( ':forumId', id );
    },

    /*
     * @summary 
     * @locus Client
     * @param {String} name the (dot-) name of the user setting
     * @returns {String} the named value, or null
     */
    userDataRead( name ){
        const settings = Forums.opts()['collections.prefix']()+'settings.'+name;
        let result = Forums.client.userSettings.get();
        settings.split( '.' ).every(( it ) => {
            if( result && result[it] ){
                result = result[it];
                return true;
            }
            result = null;
            return false; 
        });
        return result;
    },

    /*
     * @summary 
     * @locus Client
     * @param {String} name the (non-dotted) name of the user setting
     * @param {String} value a string value to be set
     */
    userDataUpdate(){
        const userId = Meteor.userId();
        if( userId ){
            const dict = {
                emails: 1,
                username: 1
            };
            const settings = Forums.opts()['collections.prefix']()+'settings';
            dict[settings] = 1;
            Meteor.callPromise( 'frsUsers.accountById', userId, dict )
                .then(( res ) => {
                    Forums.client.userSettings.set( res );
                    console.log( 'user data', res );
                    return Promise.resolve( res );
                });
        } else {
            Forums.client.userSettings.set( null );
        }
    },

    /*
     * @summary 
     * @locus Client
     * @param {String} name the (non-dotted) name of the user setting
     * @param {String} value a string value to be set
     */
    userDataWrite( name, value ){
        const settings = Forums.opts()['collections.prefix']()+'settings';
        //console.log( settings+'.'+name, value );
        AccountsTools.writeData( Meteor.userId(), settings+'.'+name, value );
        Forums.client.fn.userDataUpdate();
    },

    // a callback defined for the Roles:prView component
    //  must return a Promise
    viewRoles( tab ){
        //console.log( 'pwix:forums Forums.client.fn.viewRoles' );
        const userId = Meteor.userId();
        return new Promise(( resolve, reject ) => {
            let html = '';
            if( userId ){
                html += '<p>' + Forums.fn.i18n( 'roles_view.public_label' ) + '</p>';
                const privQuery = Forums.Forums.queryPrivates( userId );
                const privHandle = Meteor.subscribe( 'frsForums.byQuery', privQuery );
                const moderQuery = Forums.Forums.queryModerables( userId );
                const moderHandle = Meteor.subscribe( 'frsForums.byQuery', moderQuery );
                const rv = new ReactiveVar( 0 );
                let done = 0;
                Tracker.autorun(() => {
                    if( privHandle.ready()){
                        const privates = Forums.client.collections.Forums.find( privQuery.selector, privQuery.options ).fetch();
                        if( privates.length ){
                            html += '<p>' + Forums.fn.i18n( 'roles_view.private_label' );
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
                    if( moderHandle.ready()){
                        const moderables = Forums.client.collections.Forums.find( moderQuery.selector, moderQuery.options ).fetch();
                        if( moderables.length ){
                            html += '<p>' + Forums.fn.i18n( 'roles_view.moderators_label' );
                            html += '<ul>'
                            moderables.every(( f ) => {
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
                resolve( Forums.fn.i18n( 'roles_view.none' ))
            }
        });
    },

    // https://stackoverflow.com/questions/5525071/how-to-wait-until-an-element-exists
    //  returns a Promise which eventually resolves to the expected nodes list
    //  this nodes list may later be exploited with - for exmaple - $( nodes[0] )..
    waitForElements( selector, count=1 ){
        return new Promise(( resolve ) => {
            const nodeList = document.querySelectorAll( selector );
            if( nodeList.length === count ){
                return resolve( document.querySelectorAll( selector ));
            }
            const observer = new MutationObserver(( mutations ) => {
                const nodeList = document.querySelectorAll( selector );
                if( nodeList.length === count ){
                    resolve( document.querySelectorAll( selector ));
                    observer.disconnect();
                }
            });
            observer.observe( document.body, {
                childList: true,
                subtree: true
            });
        });
    }
};
