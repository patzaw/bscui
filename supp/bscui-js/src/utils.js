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

////////////////////////////////////////////////////////////////////////////////
/**
 * Get the difference between arrays
 *
 * @param {Array} array1 first array
 * @param {Array} array2 second array
 * 
 * @returns {Array} array1 - array2
 *
 */
function array_setdiff(array1, array2) {
   // Convert in Set to ensure uniqueness
   var set1 = new Set(array1);
   var set2 = new Set(array2);
   return ([...set1].filter(element => !set2.has(element)));
}

////////////////////////////////////////////////////////////////////////////////
/**
 * Get the ids of all descendants of an elements
 *
 * @param {Object} element
 * 
 * @returns {Array} ids
 *
 */
function get_all_descendant_ids(element) {
   // Initialize an array to store the identifiers
   var toRet = [];

   // Function to recursively traverse descendants
   function traverse_descendants(node) {
      // Check if the current node has an ID
      if (node.id) {
         // Add the ID to the array
         toRet.push(node.id);
      }

      // Recursively traverse child nodes
      for (var i = 0; i < node.childNodes.length; i++) {
         traverse_descendants(node.childNodes[i]);
      }
   }

   // Start traversing from the given element
   traverse_descendants(element);

   // Return the array of descendant IDs
   return(toRet);
}

////////////////////////////////////////////////////////////////////////////////
/**
 * Get b64 representation of a string with special characters
 *
 * @param {string} str string to convert
 * 
 * @returns {string} base64 converted string
 *
 */
function customBtoa(str) {
   str = str.replace(/[\u00A0-\u2666]/g, function (c) {
      return '&#' + c.charCodeAt(0) + ';';
   });
   return(btoa(str));
}

////////////////////////////////////////////////////////////////////////////////
/**
 * Remove '>' and '<' character from attribtue values
 *
 * @param {object} element object to sanitize
 * 
 */
function sanitize_attr(element) {
   // Check if the element has attributes
   if (element.nodeType === 1 && element.hasAttributes()) {
      // Loop through each attribute of the element
      for (let i = 0; i < element.attributes.length; i++) {
         const attribute = element.attributes[i];

         // Replace the string in the attribute value
         attribute.value = attribute.value.replace(
            /\s*<\s*/g, ' less than '
         );
         attribute.value = attribute.value.replace(
            /\s*>\s*/g, ' greater than '
         );
      }
   }
}
