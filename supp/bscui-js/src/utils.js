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

////////////////////////////////////////////////////////////////////////////////
/**
 * Get the identifiers of all the ancestors of an element including itself
 *
 * @param {object} element html element
 * 
 * @returns {Array} identifiers of element ancestors
 *
 */
function get_ancestors_ids(element) {
   var toRet = [element.id];
   var currentElement = element.parentNode;
   while (currentElement !== null) {
      toRet.push(currentElement.id);
      currentElement = currentElement.parentNode;
   }
   return(toRet);
}

////////////////////////////////////////////////////////////////////////////////
/**
 * Get the intersection of two arrays
 *
 * @param {Array} array1 first array
 * @param {Array} array2 second array
 * 
 * @returns {Array} intersection
 *
 */
function array_intersect(array1, array2) {
   // Convert in Set to ensure uniqueness
   var set1 = new Set(array1);
   var set2 = new Set(array2);
   return([...set1].filter(element => set2.has(element)));
}
