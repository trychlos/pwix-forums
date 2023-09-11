/*
 * pwix:forums/src/client/components/frs_breadcrumb/frs_breadcrumb.js
 *
 * Display the current hierarchy inside of the forums.
 * Because the labels must be internationalized, the possible herarchy is registered as a Forums.client array
 * 
 * Parms:
 *  - page: the current page identified y its breadcrumb name
 *  - label (opt) if set, will be added to the page label
 */

import '../../js/index.js';

import './frs_breadcrumb.html';

Template.frs_breadcrumb.helpers({

    // whether this is the currently active item
    //  almost by definition, the currently active is also the last item
    breadActive( it ){
        const current = Template.currentData().page;
        return it.name === current;
    },

    // returns the label associated to the item
    //  concatenated with the provided label, if any - but only for the current page
    breadLabel( it ){
        let str = Forums.fn.i18n( 'breadcrumb.'+it.key );
        const page = Template.currentData().page;
        if( it.name === page ){
            const label = Template.currentData().label;
            str += label ? ' <span style="font-style:italic;">['+label+']</span>' : '';
        }
        return str;
    },

    // returns the link associated to the item
    breadLink( it ){
        const data = Template.currentData();
        if( it.fn ){
            if( typeof Forums.client.fn[it.fn] === 'function' ){
                return Forums.client.fn[it.fn]( data.args );
            } else {
                return it.fn;
            }
        } else {
            return '#';
        }
    },

    // returns the list until and including the current page
    breadList(){
        let array = [];
        const current = Template.currentData().page;
        for( let i=0 ; i<Forums.client.breadcrumb.length ; ++i ){
            array.push( Forums.client.breadcrumb[i] );
            if( Forums.client.breadcrumb[i].name === current ){
                break;
            }
        }
        return array;
    }
});
