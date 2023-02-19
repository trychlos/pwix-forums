/*
 * pwix:forums/src/client/components/frs_color_button/frs_color_button.js
 *
 * Parms:
 * - rvColor: a ReactiveVar which contains the color as an hex string
 * - side: the 'rem' width and height of the button, defaulting to 2rem
 */

import './frs_color_button.html';

Template.frs_color_button.onRendered( function(){
    const self = this;

    self.autorun(() => {
        const rvColor = Template.currentData().rvColor;
        if( rvColor ){
            const color = rvColor.get();
            self.$( '.frs-color-button button' )
                .css({
                    backgroundColor: color
                })
                .prop( 'data-frs-color', color );
        }
    });

    self.autorun(() => {
        const side = Template.currentData().side || '2rem';
        self.$( '.frs-color-button .btn-square' ).css({
            width: side,
            minWidth: side,
            maxWidth: side,
            height: side,
            minHeight: side,
            maxHeight: side,
        });
    });
});

Template.frs_color_button.events({
    'click button'( event, instance ){
        const color = instance.$( event.currentTarget ).prop( 'data-frs-color' );
        instance.$( event.currentTarget ).trigger( 'frs-color-clicked', { color: color });
    }
});
