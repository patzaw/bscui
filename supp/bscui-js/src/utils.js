"use strict";

////////////////////////////////////////////////////////////////////////////////
/**
 * Create an HTML element with namespace
 *
 * @param {string} tag_name the tag name of the element
 *
 */
function create_html_element(tag_name) {
   return(document.createElementNS("http://www.w3.org/1999/xhtml", tag_name));
}

////////////////////////////////////////////////////////////////////////////////
/**
 * Create an SVG element with namespace
 *
 * @param {string} tag_name the tag name of the element
 *
 */
function create_svg_element(tag_name) {
   return(document.createElementNS("http://www.w3.org/2000/svg", tag_name));
}

////////////////////////////////////////////////////////////////////////////////
/**
 * Convert point coordinate in an area of interest
 *
 * @param {object} point the point on screen: object with x an y numbers
 * @param {object} area the area of interest: object with 
 * a `getScreenCTM()` method (e.g. DOM element)
 *
 */
function point_to_area_ref(point, area) {
   var pt = new DOMPoint(point.x, point.y);
   return(pt.matrixTransform(area.getScreenCTM().inverse()));
}
