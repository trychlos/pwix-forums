/*
 * pwix:forums/src/client/components/frs_posts_options/frs_posts_options.js
 *
 * This component takes of reading/writing the user settings as 'name'+key option values.
 *
 * Parms:
 * - name
 * - options: a ReactiveDict
 */

import '../frs_posts_options/frs_posts_options.js';
import '../frs_posts_options/frs_posts_options.js';

import './frs_posts_options.html';

Template.frs_posts_options.onCreated( function(){
    const self = this;

    self.FRS = {
        name: new ReactiveVar( null ),
        options: null,
        since: new ReactiveVar( null ),
        checkboxes: [
            'ShowEmpty',
            'ShowDeleted',
            'ShowValidated',
            'ShowNonValidated',
            'ShowModerated',
            'ShowNonModerated'
        ],

        // read a user option
        optRead( key, value ){
            return pwiForums.client.fn.userDataRead( self.FRS.name.get()+key );
        },

        // write a user option
        optWrite( key, value ){
            const name = self.FRS.name.get()+key;
            self.FRS.options.set( name, value )
            pwiForums.client.fn.userDataWrite( name, value );
        },

        // set the Date date if not empty and different
        setSinceDate( date ){
            const sinceDate = self.FRS.since.get();
            if( date && ( !sinceDate || date.getTime() !== sinceDate.getTime())){
                self.FRS.since.set( date );
                const dateStr = date.toISOString().split( 'T' )[0];
                self.FRS.optWrite( 'Since', dateStr );
            }
        },
    };

    // get the name parm
    self.autorun(() => {
        self.FRS.name.set( Template.currentData().name );
    });

    // get the options parm
    self.autorun(() => {
        self.FRS.options = Template.currentData().options;
    });

    // initialize date with yesterday unless a date is found in user profile
    const str = self.FRS.optRead( 'Since' );
    let initialDate = new Date();
    if( str ){
        initialDate.setTime( Date.parse( str ));
    } else {
        const today = new Date();
        initialDate.setTime( today.getTime()-( 24*3600000 ));
    }
    self.FRS.setSinceDate( initialDate );

    // creates and initialize ReactiveVar's from user data for checkboxes settings
    self.FRS.checkboxes.every(( data ) => {
        self.FRS.options.set( self.FRS.optRead( data ) === 'true' );
        return true;
    });
});

Template.frs_posts_options.onRendered( function(){
    const self = this;

    // initialize the datepicker
    self.autorun(() => {
        pwiForums.client.fn.waitForElements( '.frs-posts-options .input-date input' )
            .then(( nodes ) => {
                const toUTC = function( str ){
                    const local = $.datepicker.parseDate( pwiForums.fn.i18n( 'posts_options.date_parse' ), str );
                    const utc = new Date( Date.UTC( local.getFullYear(), local.getMonth(), local.getDate(), 0, 0, 0 ));
                    return utc;
                };
                self.$( nodes[0] ).datepicker({
                    format: pwiForums.fn.i18n( 'posts_options.date_format' ),
                    todayHighlight: true,
                    onClose: function( date, dp ){
                        self.FRS.setSinceDate( toUTC( date ));
                    },
                    onUpdateDatepicker: function( dp ){
                        self.FRS.setSinceDate( toUTC( dp.lastVal ));
                    }
                });
            });
    });

    // setup the checkboxes settings depending of the corresponding ReactiveVar
    self.autorun(() => {
        self.FRS.checkboxes.every(( data ) => {
            self.$( 'input[type="checkbox"][data-frs-field="'+data+'"]' ).prop( 'checked', self.FRS.options.get( data ));
            return true;
        });
    });
});

Template.frs_posts_options.helpers({

    // i18n
    i18n( opts ){
        return pwiForums.fn.i18n( 'posts_options.'+opts.hash.label );
    },

    // current since date to initialize the input element
    since(){
        return $.datepicker.formatDate( pwiForums.fn.i18n( 'posts_options.date_parse' ), Template.instance().FRS.since.get());
    },

});

Template.frs_posts_options.events({

    // open the datepicker when clicking the icon
    'click .frs-posts-options .calendar-icon'( event, instance ){
        const selector = instance.FRS.dpSelector; 
        if( instance.$( selector ).datepicker( 'widget' ).is( ':visible' )){
            instance.$( selector ).datepicker( 'hide' );
        } else {
            instance.$( selector ).datepicker( 'show' );
        }
        return false;
    },

    // manage settings change
    'change .frs-posts-options  input[type="checkbox"]'( event, instance ){
        const checked = instance.$( event.currentTarget ).prop( 'checked' );
        const field = $( event.currentTarget ).data( 'frs-field' );
        instance.FRS.opts[field].set( checked );
        pwiForums.client.fn.userDataWrite( field, checked ? 'true' : 'false' );
    },
});
