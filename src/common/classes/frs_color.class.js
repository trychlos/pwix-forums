/*
 * /src/common/classes/frs_color.class.js
 *
 * This class manages the choosable colors.
 */

import { Random } from 'meteor/random';

export class frsColor {

    // static data
    //

    // an example of 16 colors for the web
    //  https://colorswall.com/palette/105557

    static Colors = [
        '#f44336',      // red
        '#e81e63',      // pink
        '#9c27b0',      // purple
        '#673ab7',      // deep purple
        '#3f51b5',      // indigo
        '#2196f3',      // blue
        '#03a9f4',      // light blue
        '#00bcd4',      // cyan
        '#009688',      // teal
        '#4caf50',      // green
        '#8bc34a',      // light green
        '#cddc39',      // lime
        '#ffeb3b',      // yellow
        '#ffc107',      // amber
        '#ff9800',      // orange
        '#ff5722',      // deep orange
    ];

    // static methods
    //

    /**
     * @returns {frsColor} a random color
     */
    static Random(){
        return new frsColor( Random.choice( frsColor.Colors ));
    }

    // private data
    //

    _color = null;

    // private functions
    //

    /**
     * Constructor
     * @param {String} color the hex code of the desired color
     * @returns {frsColor}
     */
    constructor( color ){
        this._color = color;
        return this;
    }

    /**
     * @returns {String} the color as an hex string
     */
    color(){
        return this._color;
    }
}
