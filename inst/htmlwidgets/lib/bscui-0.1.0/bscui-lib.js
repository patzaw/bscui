"use strict";

////////////////////////////////////////////////////////////////////////////////
/**
 * SVG user interface
 *
 * @param {element_id} parent element identifier
 *
 */
function Sui(element_id){

   // Config
   this.zoom_min = null;
   this.zoom_max = null;
   this.zoom_step = null;
   this.clip = null;

   // Init state
   this.id = element_id;
   this.svg = null;
   this.ori_viewBox = null;

   // State
   this.zoom_current = null;
   this.stop_zoom = false;
   this.moved = false;

   //////////////////////////////////
   /**
    * Initialize the Sui object
    *
    * @param {svg_txt} string with svg code
    * @param {zoom_min} smallest zoom value
    * @param {zoom_max} largest zoom value
    * @param {zom_step} zooming step: the larger the faster
    * @param {clip} if true, when the current zoom is 1, the viewBox is
    *    automatically set to its original state (the drawing cannot be moved)
    *
    */
   this.init = function(
      svg_txt,
      zoom_min = 0.5, zoom_max = 20,
      zoom_step = 1.1,
      clip=false
   ){
      var sui = this;
      var el = document.getElementById(sui.id);
      var tmp = document.createElement( 'div' );
      tmp.innerHTML = svg_txt;
      var svg = tmp.children[0];
      el.appendChild(svg);
      sui.svg = svg;
      sui.zoom_current = 1;
      sui.zoom_min = zoom_min;
      sui.zoom_max = zoom_max;
      sui.zoom_step = zoom_step;
      sui.clip = clip;

      // Adapt viewbox
      function wait_for_svg_to_be_rendered(widget_id) {
         return new Promise(function(resolve) {
            function check_if_svg_exists() {
               var widget = document.getElementById(widget_id);
               var svg = widget.querySelector("svg");
               if (svg) {
                  // The element is now rendered
                  resolve(svg);
               } else {
                  // Check again in a short time
                  requestAnimationFrame(check_if_svg_exists);
               }
            }
            // Initial check
            check_if_svg_exists();
         });
      }
      wait_for_svg_to_be_rendered(el.id)
         .then(function(svg){
            var g = svg.querySelector("g")
            var bcr = g.getBoundingClientRect();
            var w = bcr.width;
            var h = bcr.height;
            var vb = 0 + " " + 0 + " " + w + " " + h;
            svg.setAttribute("viewBox", vb);
            sui.ori_viewBox = vb;
         });
      //

      svg.addEventListener("wheel", function(event){
         sui.wheel_zoom(event);
      });

      svg.addEventListener("mousedown", function(event){
         sui.mouse_move(event);
      });

      return(el);
   };

   //////////////////////////////////
   /**
    * Zoom in and out drawing using mouse wheel
    *
    * @param {event} wheel event
    *
    */
   this.wheel_zoom = function(event){
      var sui = this;
      if(sui.stop_zoom){
         sui.stop_zoom = false;
         return;
      }
      var svg = sui.svg;
      var lcp = {x:event.clientX, y:event.clientY};
      var orip = point_to_area_ref(lcp, svg);
      var viewBox = svg.getAttribute("viewBox").split(" ");
      var vbx = Number(viewBox[0]);
      var vby = Number(viewBox[1]);
      var vbw = Number(viewBox[2]);
      var vbh = Number(viewBox[3]);
      var neww, newh;
      var svw = svg.getBoundingClientRect().width;
      var zf = sui.zoom_step;
      if(event.deltaY > 0){
         zf = 1/zf
      }
      var new_zoom = sui.zoom_current * zf;
      if(new_zoom > sui.zoom_max || new_zoom < sui.zoom_min){
         return;
      }
      if(sui.clip && Math.abs(Math.log10(new_zoom)) < 0.001){
         sui.zoom_current = 1;
         sui.stop_zoom = true;
         svg.setAttribute("viewBox", sui.ori_viewBox);
         return;
      }
      sui.zoom_current = new_zoom;
      neww = vbw / zf;
      newh = vbh / zf;
      svg.setAttribute(
         "viewBox",
         vbx + " " + vby + " " + neww + " " + newh
      );
      var newp = point_to_area_ref(lcp, svg);
      var newx = vbx - (newp.x-orip.x);
      var newy = vby - (newp.y-orip.y);
      svg.setAttribute(
         "viewBox",
         newx + " " + newy + " " + neww + " " + newh
      );
      event.stopPropagation();
      event.preventDefault();
   };

   //////////////////////////////////
   /**
    * Move drawing using mouse left button
    *
    * @param {event} left button mousedown event
    *
    */
   this.mouse_move = function(event){
      var sui = this;
      sui.moved = false;

      if(
         event.button != 0 ||
         (sui.clip && sui.zoom_current == 1)
      ){
         return;
      }

      var svg = sui.svg;

      function move_viewBox(event){
         var curEvent = event;
         if(!scheduled){
            scheduled = true;
            setTimeout(function() {
               var viewBox = svg.getAttribute("viewBox").split(" ");
               var x = Number(viewBox[0]);
               var y = Number(viewBox[1]);
               var w = Number(viewBox[2]);
               var h = Number(viewBox[3]);
               var cp = {x:curEvent.clientX, y:curEvent.clientY};
               var abs_dx = lcp.x - cp.x;
               var abs_dy = lcp.y - cp.y;
               // Use width and height ratio of the display box
               var rel_dx = dw * abs_dx / rw ;
               var rel_dy = dh * abs_dy / rh ;
               //
               var nx = x + rel_dx;
               var ny = y + rel_dy;
               svg.setAttribute("viewBox", nx + " " + ny + " " + w + " " + h);
               sui.moved = true;
               lcp = cp;
               scheduled = false;
            }, 40);
         }
      }
      // Compute width and height ratio of the display box compared to viewBox
      // for adpating the x and y displacement
      var viewBox = svg.getAttribute("viewBox").split(" ");
      var w = Number(viewBox[2]);
      var h = Number(viewBox[3]);
      var bcr = svg.getBoundingClientRect();
      var rw = bcr.width;
      var rh = bcr.height;
      var rr = rw/rh;
      var rwh = Math.max(rw, rh);
      var vbr = w/h;
      if(vbr >= rr){
         var dw = w;
         var dh = w/rr;
      }else{
         var dh = h;
         var dw = h*rr;
      }
      //
      var scheduled = false;
      var lcp = {x:event.clientX, y:event.clientY};
      svg.addEventListener("mousemove", move_viewBox);
      svg.addEventListener("mouseup", function(event){
         svg.removeEventListener("mousemove", move_viewBox);
         event.stopPropagation();
         event.preventDefault();
      });
      event.stopPropagation();
      event.preventDefault();
   };

}


////////////////////////////////////////////////////////////////////////////////
/**
 * Convert point coordinate in an area of interest
 *
 * @param {point} the point on screen
 * @param {area} the area of interest (e.g. DOM element)
 *
 */
function point_to_area_ref(point, area) {
   var pt = new DOMPoint(point.x, point.y);
   return pt.matrixTransform(area.getScreenCTM().inverse());
}
