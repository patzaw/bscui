"use strict";

////////////////////////////////////////////////////////////////////////////////
/**
 * SVG user interface
 *
 * @param {string} element_id parent element identifier
 *
 */
function Sui(element_id){

   // Config
   this.zoom_min = null;
   this.zoom_step = null;
   this.zoom_max = null;
   this.clip = null;

   // Init state
   this.id = element_id;
   this.svg = null;
   this.main_group = null;
   this.sel_group = null;
   this.ui_elements = null;
   this.selectable = [];
   this.buttons = [];
   this.select_event = null;
   this.operate_event = null;
   this.hover_event = null;
   this.selected = [];
   this.hovered = null;
   this.clientX = null;
   this.clientY = null;
   this.button = {n: 0, id: null};

   // View
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
    * @param {string} svg_txt string with svg code
    * @param {binary} show_menu show the menu
    * @param {string} menu_width css width value
    * @param {number} zoom_min smallest zoom value
    * @param {number} zoom_max largest zoom value
    * @param {number} zoom_step zooming step: the larger the faster
    * @param {boolean} clip if true, when the current zoom is 1, the viewBox is
    *    automatically set to its original state (the drawing cannot be moved)
    * @param {number} default_png_scale default value for scaling PNG export
    * @param {string} selection_color color used to highlight selection
    * @param {number} dblclick_timeout minimum time between 2 independant clicks
    * @param {number} hover_timeout time before update hovered element
    *
    */
   this.init = function(
      svg_txt,
      ui_elements,
      show_menu = true,
      menu_width = "20px",
      zoom_min = 0.5, zoom_max = 20,
      zoom_step = 1.1,
      clip=false,
      default_png_scale = 1,
      selection_color = "orange",
      dblclick_timeout = 250,
      hover_timeout = 500,
   ){
      var sui = this;
      var el = document.getElementById(sui.id);

      // Container
      var div = create_html_element('div');
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
      var menu = create_html_element('div');
      menu.setAttribute(
         "style",
         "background-color: #3d3d3d2b;" +
            "position: absolute;" +
            "top: 0; left: 0;" +
            "width: 20px; padding: 5px"
      );
      menu.style.width = menu_width;
      if (show_menu){
         div.appendChild(menu);
      }

      // Show button
      var show_button = create_svg_icon("menu", "Menu");
      menu.appendChild(show_button);

      // Menu elements
      var menu_items = create_html_element('div');
      menu_items.setAttribute(
         "style",
         "display: none;"
      );
      menu.appendChild(menu_items);

      var msep_elt = create_html_element('p');
      msep_elt.setAttribute("height", "20px");
      menu_items.appendChild(msep_elt);

      var reset_button = create_svg_icon("fit", "Reset view");
      menu_items.appendChild(reset_button);

      var zoomin_button = create_svg_icon("zoom_in", "Zoom in");
      menu_items.appendChild(zoomin_button);

      var zoomout_button = create_svg_icon("zoom_out", "Zoom out");
      menu_items.appendChild(zoomout_button);

      //
      menu_items.appendChild(msep_elt.cloneNode(true));

      var savesvg_button = create_svg_icon("code", "Save SVG");
      menu_items.appendChild(savesvg_button);

      var savepng_button = create_svg_icon("photo", "Save PNG");
      menu_items.appendChild(savepng_button);

      var scalepng_button = create_svg_icon("scale", "Scale PNG");
      scalepng_button.setAttribute(
         "style",
         "width: 50%; margin-right: 0; margin-left: auto; display: block;"
      );
      menu_items.appendChild(scalepng_button);

      var scalepng_ui = create_html_element('div');
      scalepng_ui.style.display = "none";
      scalepng_ui.style.width = "100px";
      menu_items.appendChild(scalepng_ui);
      var png_scale = create_html_element('input');
      png_scale.setAttribute("type", "number");
      png_scale.setAttribute("min", 0);
      png_scale.setAttribute("step", 1);
      png_scale.value = default_png_scale;
      png_scale.setAttribute("style", 'text-align:right;');
      png_scale.style.width = "50px";
      png_scale.style.marginLeft = "10px";
      png_scale.style.display = "inline";
      scalepng_ui.appendChild(png_scale);

      var closeui_button = create_svg_icon("close", "Close");
      closeui_button.style.height = "20px"
      closeui_button.style.display = "inline";
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
         sui.reset_view();
      });
      zoomin_button.addEventListener("click", function(event){
         sui.zoom_in();
      });
      zoomout_button.addEventListener("click", function(event){
         sui.zoom_out();
      });
      savepng_button.addEventListener("click", function(event){
         sui.save_png();
      });
      savesvg_button.addEventListener("click", function(event){
         sui.save_svg();
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

      // SVG groups
      var main_group = svg.querySelector("g");
      var sel_group = create_svg_element("g");
      svg.appendChild(sel_group);

      // Config
      sui.svg = svg;
      sui.main_group = main_group;
      sui.sel_group = sel_group;
      sui.ui_elements = ui_elements;
      sui.select_event = new CustomEvent("elementSelected", {
         detail: {
            id: sui.id,
         },
      });
      sui.operate_event = new CustomEvent("elementOperated", {
         detail: {
            id: sui.id,
         },
      });
      sui.hover_event = new CustomEvent("elementHovered", {
         detail: {
            id: sui.id,
         },
      });
      sui.zoom_current = 1;
      sui.zoom_min = zoom_min;
      sui.zoom_max = zoom_max;
      sui.zoom_step = zoom_step;
      sui.clip = clip;
      sui.default_png_scale = default_png_scale;

      // Update ui elements
      if(ui_elements){
         for (let i = 0; i < ui_elements.id.length; i++) {
            let id = ui_elements.id[i];
            if(ui_elements.ui_type[i] == "selectable"){
               sui.selectable.push(id);
            }
            if (ui_elements.ui_type[i] == "button") {
               sui.buttons.push(id);
            }
            let element = svg.getElementById(id);
            for(let pname in ui_elements){
               if (pname == "opacity") {
                  element.style.opacity = ui_elements.opacity[i];
               }
               if(pname == "fill"){
                  element.style.fill = ui_elements.fill[i];
               }
               if (pname == "fill_opacity") {
                  element.style.fillOpacity = ui_elements.fill_opacity[i];
               }
               if (pname == "stroke") {
                  element.style.stroke = ui_elements.stroke[i];
               }
               if (pname == "stroke_width") {
                  element.style.strokeWidth = ui_elements.stroke_width[i];
               }
               if (pname == "stroke_opacity") {
                  element.style.strokeOpacity = ui_elements.stroke_opacity[i];
               }
            }
         }
      }

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

      // Display Events
      svg.addEventListener("wheel", function(event){
         sui.wheel_zoom(event);
      });

      svg.addEventListener("mousedown", function(event){
         sui.mouse_move(event);
      });

      // Interaction Events
      var mouse_move_timer;
      svg.addEventListener("mousemove", function (event) {
         clearTimeout(mouse_move_timer);
         mouse_move_timer = setTimeout(function(){
            var target = event.target;
            var target_ids = get_ancestors_ids(target);
            var hovered = array_intersect(
               target_ids,
               sui.ui_elements.id
            )[0];
            sui.hovered = hovered;
            sui.clientX = event.clientX;
            sui.clientY = event.clientY;
            svg.dispatchEvent(sui.hover_event)
         }, hover_timeout)
      });

      var container = svg.parentElement;
      var ttid = el.id + "..ui_tooltip";
      var tooltip = create_html_element("div");
      tooltip.id = ttid;
      tooltip.style.visibility = "hidden";
      container.appendChild(tooltip);
      tooltip.addEventListener("mouseover", function (event) {
         clearTimeout(mouse_move_timer);
         sui.hovered = tooltip.getAttribute("data-element");
      })
      svg.addEventListener("elementHovered", function (event) {
         if (sui.hovered) {
            var exists = false;
            if (tooltip.style.visibility == "visible") {
               if (tooltip.getAttribute("data-element") != sui.hovered) {
                  tooltip.style.visibility = "hidden";
               } else {
                  exists = true
               }
            }
            if (!exists) {
               var ind = sui.ui_elements.id.indexOf(sui.hovered);
               var title = sui.ui_elements.title[ind];
               if (title) {
                  tooltip.innerHTML = title;
                  var x = sui.clientX -
                     container.getBoundingClientRect().left +
                     container.scrollLeft + 5;
                  var y = sui.clientY -
                     container.getBoundingClientRect().top +
                     container.scrollTop + 5;
                  tooltip.style.left = x + "px";
                  tooltip.style.top = y + "px";
                  tooltip.style.display = "block";
                  tooltip.style.position = "absolute";
                  tooltip.setAttribute("data-element", sui.hovered);
                  tooltip.style.visibility = "visible";
               }
            }
         } else {
            tooltip.style.visibility = "hidden";
         }
      });

      var clickTimer;
      svg.addEventListener("click", function(event){
         if(sui.moved){
            console.log("moving");
         }else{
            var target = event.target;
            var target_ids = get_ancestors_ids(target);
            var to_update = array_intersect(
               target_ids,
               sui.selectable
            )[0];
            //
            var to_trigger = array_intersect(
               target_ids,
               sui.buttons
            )[0];
            if(to_trigger){
               clearTimeout(clickTimer);
               clickTimer = setTimeout(function () {
                  console.log(to_trigger);
                  console.log("single click");
                  // trigger event
               }, dblclick_timeout);
            }else{
               if (!event.ctrlKey) {
                  if (!to_update) {
                     sui.selected = [];
                  } else {
                     sui.selected = [to_update];
                  }
               } else {
                  if (to_update) {
                     let ind = sui.selected.indexOf(to_update);
                     if (ind == -1) {
                        sui.selected.push(to_update);
                     } else {
                        sui.selected.splice(ind, 1);
                     }
                  }
               }
               // trigger event
               svg.dispatchEvent(sui.select_event);
            }
         }
      });

      svg.addEventListener("elementSelected", function(event){
         var disp_sel = sui.sel_group.children;
         var disp_identifiers = [];
         Array.from(disp_sel).forEach(element => {
            disp_identifiers.push(element.id);
            if(!sui.selected.includes(element.id)){
               sui.sel_group.removeChild(element);
            }
         });
         sui.selected.forEach(id => {
            if(!disp_identifiers.includes(id)){
               var to_add = svg.getElementById(id).cloneNode(true);
               to_add.id = "selection.-_-." + to_add.id;
               to_add.style.fill = "none";
               to_add.style.stroke = selection_color;
               to_add.style.visibility = "visible";
               to_add.style.strokeWidth = to_add.style.strokeWidth +2;
               to_add.style.strokeOpacity = 1;
               to_add.style.opacity = 0.5;
               to_add.style.pointerEvents = 'none';
               sui.sel_group.appendChild(to_add);
            }
         })
      });

      svg.addEventListener("dblclick", function (event) {
         if (sui.moved) {
            console.log("moving");
         } else {
            clearTimeout(clickTimer);
            var target = event.target;
            var target_ids = get_ancestors_ids(target);
            var to_trigger = array_intersect(
               target_ids,
               sui.buttons
            )[0];
            console.log(to_trigger);
            console.log("double click");
            // trigger event
         }
      });

      return(el);
   };

   //////////////////////////////////
   /**
    * Reset view
    *
    */
   this.reset_view = function(){
      var sui = this;
      var svg = sui.svg;
      svg.setAttribute("viewBox", sui.ori_viewBox);
      sui.zoom_current = 1;
   };

   //////////////////////////////////
   /**
    * Zoom in
    *
    */
   this.zoom_in = function(){
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
    */
   this.zoom_out = function(){
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
    * @param {object} event wheel event
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
    * @param {object} event left button mousedown event
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
    */
   this.save_svg = function(){
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
      var a = body.appendChild(create_html_element("a"));
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
    */
   this.save_png = function(){
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
      var canvas = create_html_element("canvas");
      canvas.setAttribute("width", w);
      canvas.setAttribute("height", h);

      var context = canvas.getContext("2d");
      var img = new Image;
      img.onload = function() {
         context.drawImage(img, 0, 0, w, h);
         var canvasdata = canvas.toDataURL("image/png");
         var body = document.querySelector("body");
         var a = body.appendChild(create_html_element("a"));
         a.style.visibility="hidden";
         a.setAttribute("download", fileName);
         a.setAttribute("href", canvasdata);
         a.click();
         body.removeChild(a);
      };
      img.src = imgsrc;
   };

}
