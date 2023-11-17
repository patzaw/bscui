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
   this.png_scale = null;
   this.default_png_scale = null;

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
      clip=false,
      default_png_scale = 1
   ){
      var sui = this;
      var el = document.getElementById(sui.id);

      // Container
      var div = document.createElement('div');
      div.setAttribute(
         "style",
         // "border: 1px solid #ccc;" +
         "width:100%; height:100%; position:relative;"
      );

      // SVG
      div.innerHTML = svg_txt;
      var svg = div.children[0];
      svg.removeAttribute("viewBox");
      svg.setAttribute("width", "100%");
      svg.setAttribute("height", "100%");

      // Menu
      var xmlns = "http://www.w3.org/2000/svg";
      var menu = document.createElement('div');
      menu.setAttribute(
         "style",
         "background-color: #3d3d3d2b;" +
            "position: absolute;" +
            "top: 0; left: 0;" +
            "width: 20px; padding: 5px"
      );
      div.appendChild(menu);

      // Show button
      var show_button = document.createElementNS(xmlns, 'svg');
      show_button.innerHTML =
         '<g>' +
         '<title>Menu</title>' +
         '<rect width="100%" height="100%" style="fill:#3d3d3d00;"></rect>' +
         '<line x1="1" y1="3" x2="17" y2="3" stroke="black" stroke-width="4" />' +
         '<line x1="1" y1="9" x2="17" y2="9" stroke="black" stroke-width="4" />' +
         '<line x1="1" y1="15" x2="17" y2="15" stroke="black" stroke-width="4" />' +
         '</g>';
      show_button.setAttribute("viewBox", "0 0 18 18");
      menu.appendChild(show_button);

      // Menu elements
      var menu_items = document.createElement('div');
      menu_items.setAttribute(
         "style",
         //"height: 200px;" +
         "display: none;"
      );
      menu.appendChild(menu_items);
      menu_items.appendChild(document.createElement('br'));

      var reset_button = document.createElementNS(xmlns, 'svg');
      reset_button.innerHTML =
         '<g>' +
         '<title>Reset view</title>' +
         '<rect width="100%" height="100%" style="fill:#3d3d3d00;"></rect>' +
         '<path d="m250 850l-187 0-63 0 0-62 0-188 63 0 0 188 187 0 0 62z m688 0l-188 0 0-62 188 0 0-188 62 0 0 188 0 62-62 0z m-875-938l0 188-63 0 0-188 0-62 63 0 187 0 0 62-187 0z m875 188l0-188-188 0 0-62 188 0 62 0 0 62 0 188-62 0z m-125 188l-1 0-93-94-156 156 156 156 92-93 2 0 0 250-250 0 0-2 93-92-156-156-156 156 94 92 0 2-250 0 0-250 0 0 93 93 157-156-157-156-93 94 0 0 0-250 250 0 0 0-94 93 156 157 156-157-93-93 0 0 250 0 0 250z" transform="matrix(1 0 0 -1 0 850)"></path>' +
         '</g>'
      reset_button.setAttribute("viewBox", "0 0 1000 1000");
      menu_items.appendChild(reset_button);

      var zoomin_button = document.createElementNS(xmlns, 'svg');
      zoomin_button.innerHTML =
         '<g>' +
         '<title>Zoom in</title>' +
         '<rect width="100%" height="100%" style="fill:#3d3d3d00;"></rect>' +
         '<path d="m1 787l0-875 875 0 0 875-875 0z m687-500l-187 0 0-187-125 0 0 187-188 0 0 125 188 0 0 187 125 0 0-187 187 0 0-125z" transform="matrix(1 0 0 -1 0 850)"></path>' +
         '</g>'
      zoomin_button.setAttribute("viewBox", "0 0 875 1000");
      menu_items.appendChild(zoomin_button);

      var zoomout_button = document.createElementNS(xmlns, 'svg');
      zoomout_button.innerHTML =
         '<g>' +
         '<title>Zoom out</title>' +
         '<path d="m0 788l0-876 875 0 0 876-875 0z m688-500l-500 0 0 125 500 0 0-125z" transform="matrix(1 0 0 -1 0 850)"></path>' +
         '</g>'
      zoomout_button.setAttribute("viewBox", "0 0 875 1000");
      menu_items.appendChild(zoomout_button);

      //
      menu_items.appendChild(document.createElement('br'));

      var savesvg_button = document.createElementNS(xmlns, 'svg');
      savesvg_button.innerHTML =
         '<g>' +
         '<title>Save SVG</title>' +
         '<rect width="100%" height="100%" style="fill:#3d3d3d00;"></rect>' +
         '<path d="M392.8 1.2c-17-4.9-34.7 5-39.6 22l-128 448c-4.9 17 5 34.7 22 39.6s34.7-5 39.6-22l128-448c4.9-17-5-34.7-22-39.6zm80.6 120.1c-12.5 12.5-12.5 32.8 0 45.3L562.7 256l-89.4 89.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l112-112c12.5-12.5 12.5-32.8 0-45.3l-112-112c-12.5-12.5-32.8-12.5-45.3 0zm-306.7 0c-12.5-12.5-32.8-12.5-45.3 0l-112 112c-12.5 12.5-12.5 32.8 0 45.3l112 112c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L77.3 256l89.4-89.4c12.5-12.5 12.5-32.8 0-45.3z"></path>' +
         '</g>'
      savesvg_button.setAttribute("viewBox", "0 0 640 512");
      menu_items.appendChild(savesvg_button);

      var savepng_button = document.createElementNS(xmlns, 'svg');
      savepng_button.innerHTML =
         '<g>' +
         '<title>Save PNG</title>' +
         '<rect width="100%" height="100%" style="fill:#3d3d3d00;"></rect>' +
         '<path d="m500 450c-83 0-150-67-150-150 0-83 67-150 150-150 83 0 150 67 150 150 0 83-67 150-150 150z m400 150h-120c-16 0-34 13-39 29l-31 93c-6 15-23 28-40 28h-340c-16 0-34-13-39-28l-31-94c-6-15-23-28-40-28h-120c-55 0-100-45-100-100v-450c0-55 45-100 100-100h800c55 0 100 45 100 100v450c0 55-45 100-100 100z m-400-550c-138 0-250 112-250 250 0 138 112 250 250 250 138 0 250-112 250-250 0-138-112-250-250-250z m365 380c-19 0-35 16-35 35 0 19 16 35 35 35 19 0 35-16 35-35 0-19-16-35-35-35z" transform="matrix(1 0 0 -1 0 850)"></path>' +
         '</g>'
      savepng_button.setAttribute("viewBox", "0 0 1000 1000");
      menu_items.appendChild(savepng_button);

      var scalepng_button = document.createElementNS(xmlns, 'svg');
      scalepng_button.innerHTML =
         '<g>' +
         '<title>Scale PNG</title>' +
         '<rect width="100%" height="100%" style="fill:#3d3d3d00;"></rect>' +
         '<path d="M344 0H488c13.3 0 24 10.7 24 24V168c0 9.7-5.8 18.5-14.8 22.2s-19.3 1.7-26.2-5.2l-39-39-87 87c-9.4 9.4-24.6 9.4-33.9 0l-32-32c-9.4-9.4-9.4-24.6 0-33.9l87-87L327 41c-6.9-6.9-8.9-17.2-5.2-26.2S334.3 0 344 0zM168 512H24c-13.3 0-24-10.7-24-24V344c0-9.7 5.8-18.5 14.8-22.2s19.3-1.7 26.2 5.2l39 39 87-87c9.4-9.4 24.6-9.4 33.9 0l32 32c9.4 9.4 9.4 24.6 0 33.9l-87 87 39 39c6.9 6.9 8.9 17.2 5.2 26.2s-12.5 14.8-22.2 14.8z"></path>' +
         '</g>'
      scalepng_button.setAttribute("viewBox", "0 0 512 512");
      menu_items.appendChild(scalepng_button);

      var scalepng_ui = document.createElement('div');
      scalepng_ui.style.display = "none";
      scalepng_ui.style.width = "80px";
      menu_items.appendChild(scalepng_ui);
      var png_scale = document.createElement('input');
      png_scale.setAttribute("type", "number");
      png_scale.setAttribute("min", 0);
      png_scale.setAttribute("step", 1);
      png_scale.value = default_png_scale;
      png_scale.setAttribute("style", 'text-align:right;');
      png_scale.style.width = "50px";
      png_scale.style.display = "inline";
      scalepng_ui.appendChild(png_scale);
      var closeui_button = document.createElementNS(xmlns, 'svg');
      closeui_button.style.height = "20px"
      closeui_button.style.display = "inline";
      closeui_button.innerHTML =
         '<g>' +
         '<title>Close</title>' +
         '<rect width="100%" height="100%" style="fill:#3d3d3d00;"></rect>' +
         '<path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM175 175c9.4-9.4 24.6-9.4 33.9 0l47 47 47-47c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9l-47 47 47 47c9.4 9.4 9.4 24.6 0 33.9s-24.6 9.4-33.9 0l-47-47-47 47c-9.4 9.4-24.6 9.4-33.9 0s-9.4-24.6 0-33.9l47-47-47-47c-9.4-9.4-9.4-24.6 0-33.9z"></path>' +
         '</g>'
      closeui_button.setAttribute("viewBox", "0 0 512 512");
      scalepng_ui.appendChild(closeui_button);
      this.png_scale = png_scale

      // Menu events
      show_button.addEventListener("click", function(event){
         var v = menu_items.style.display;
         if(v == "none"){
            menu_items.style.display = "block";
         }else{
            menu_items.style.display = "none";
         }
      });
      reset_button.addEventListener("click", function(event){
         sui.reset_zoom(event);
      });
      zoomin_button.addEventListener("click", function(event){
         sui.zoom_in(event);
      });
      zoomout_button.addEventListener("click", function(event){
         sui.zoom_out(event);
      });
      savepng_button.addEventListener("click", function(event){
         sui.save_png(event);
      });
      savesvg_button.addEventListener("click", function(event){
         sui.save_svg(event);
      });
      scalepng_button.addEventListener("click", function(event){
         var v = menu_items.style.display;
         scalepng_button.style.display = "none";
         scalepng_ui.style.display = "block";
      });
      closeui_button.addEventListener("click", function(event){
         var v = menu_items.style.display;
         scalepng_ui.style.display = "none";
         scalepng_button.style.display = "block";
      });

      // Add to the document
      el.appendChild(div);

      // Config
      sui.svg = svg;
      sui.zoom_current = 1;
      sui.zoom_min = zoom_min;
      sui.zoom_max = zoom_max;
      sui.zoom_step = zoom_step;
      sui.clip = clip;
      sui.default_png_scale = default_png_scale;

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

      // Events
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
    * Reset zoom
    *
    * @param {event} click event
    *
    */
   this.reset_zoom = function(event){
      var sui = this;
      var svg = sui.svg;
      svg.setAttribute("viewBox", sui.ori_viewBox);
      sui.zoom_current = 1;
   };

   //////////////////////////////////
   /**
    * Zoom in
    *
    * @param {event} click event
    *
    */
   this.zoom_in = function(event){
      var sui = this;
      var svg = sui.svg;
      var viewBox = svg.getAttribute("viewBox").split(" ");
      var vbx = Number(viewBox[0]);
      var vby = Number(viewBox[1]);
      var vbw = Number(viewBox[2]);
      var vbh = Number(viewBox[3]);
      var neww, newh;

      var zf = sui.zoom_step;
      var new_zoom = sui.zoom_current * zf;
      if(new_zoom > sui.zoom_max || new_zoom < sui.zoom_min){
         return;
      }
      if(sui.clip && Math.abs(Math.log10(new_zoom)) < 0.001){
         sui.zoom_current = 1;
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
   };

   //////////////////////////////////
   /**
    * Zoom out
    *
    * @param {event} click event
    *
    */
   this.zoom_out = function(event){
      var sui = this;
      var svg = sui.svg;
      var viewBox = svg.getAttribute("viewBox").split(" ");
      var vbx = Number(viewBox[0]);
      var vby = Number(viewBox[1]);
      var vbw = Number(viewBox[2]);
      var vbh = Number(viewBox[3]);
      var neww, newh;

      var zf = 1/sui.zoom_step;
      var new_zoom = sui.zoom_current * zf;
      if(new_zoom > sui.zoom_max || new_zoom < sui.zoom_min){
         return;
      }
      if(sui.clip && Math.abs(Math.log10(new_zoom)) < 0.001){
         sui.zoom_current = 1;
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

   //////////////////////////////////
   /**
    * Save SVG file
    *
    * @param {event} click event
    *
    */
   this.save_svg = function(event){
      var fileName = "image.svg";

      var sui = this;
      var svg = sui.svg;

      var tosave = svg.cloneNode(true);
      tosave.setAttribute("viewBox", sui.ori_viewBox);

      var imgsrc = tosave.outerHTML;
      imgsrc = 'data:image/svg+xml;base64,'+
      btoa(
         '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
         imgsrc
      );

      var body = document.querySelector("body");
      var a = body.appendChild(document.createElement("a"));
      a.style.visibility="hidden";
      a.setAttribute("href", imgsrc);
      a.setAttribute("download", fileName);
      a.click();
      body.removeChild(a);
   };

   //////////////////////////////////
   /**
    * Save PNG file
    *
    * @param {event} click event
    *
    */
   this.save_png = function(event){
      var fileName = "image.png";

      var sui = this;
      var svgOri = sui.svg;

      var svg = svgOri.cloneNode(true);
      svg.setAttribute("version", 1.1);
      svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");

      var scale = Number(sui.png_scale.value);
      if(!scale){
         scale = sui.default_png_scale;
      }
      var viewBox = sui.ori_viewBox.split(" ");
      var vbx = Number(viewBox[0]);
      var vby = Number(viewBox[1]);
      var vbw = Number(viewBox[2]);
      var vbh = Number(viewBox[3]);
      svg.setAttribute("width", vbw);
      svg.setAttribute("height", vbh);
      svg.setAttribute(
         "viewBox",
         vbx + " " + vby + " " + vbw + " " + vbh
      );

      var imgsrc = svg.outerHTML;
      imgsrc = 'data:image/svg+xml;base64,'+ btoa(imgsrc);
      var w = vbw*scale;
      var h = vbh*scale;
      var canvas = document.createElement("canvas");
      canvas.setAttribute("width", w);
      canvas.setAttribute("height", h);

      var context = canvas.getContext("2d");
      var img = new Image;
      img.onload = function() {
         context.drawImage(img, 0, 0, w, h);
         var canvasdata = canvas.toDataURL("image/png");
         var body = document.querySelector("body");
         var a = body.appendChild(document.createElement("a"));
         a.style.visibility="hidden";
         a.setAttribute("download", fileName);
         a.setAttribute("href", canvasdata);
         a.click();
         body.removeChild(a);
      };
      img.src = imgsrc;
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
