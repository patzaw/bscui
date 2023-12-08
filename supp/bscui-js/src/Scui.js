"use strict";

////////////////////////////////////////////////////////////////////////////////
/**
 * SVG custom user interface
 *
 * @param {string} element_id parent element identifier
 *
 */
function Scui(element_id){

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
   this.selectable = new Set();
   this.buttons = new Set();
   this.select_event = null;
   this.operate_event = null;
   this.hover_event = null;
   this.selected = new Set();
   this.hovered = null;
   this.clientX = null;
   this.clientY = null;
   this.button = { n: 0, id: null, click: null };
   this.structure_shapes = new Set([
      "rect", "circle", "ellipse", "line", "polyline",
      "polygon", "path"
   ]);

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
    * Initialize the Scui object
    *
    * @param {string} svg_txt string with svg code
    * @param {object} ui_elements a data frame with "id", "ui_type" and "title"
    *    columns
    * @param {object} element_styles a data frame with an "id" column and
    *    column per style to apply
    * @param {binary} show_menu show the menu
    * @param {string} menu_width css width value
    * @param {number} zoom_min smallest zoom value
    * @param {number} zoom_max largest zoom value
    * @param {number} zoom_step zooming step: the larger the faster
    * @param {boolean} clip if true, when the current zoom is 1, the viewBox is
    *    automatically set to its original state (the drawing cannot be moved)
    * @param {number} default_png_scale default value for scaling PNG export
    * @param {string} selection_color color used to highlight selection
    * @param {number} selection_opacity opacity of selection highlight
    * @param {string} hover_color color used to highlight hovered element
    *    (one for "button", one for "selectable", one for "none")
    * @param {number} hover_opacity opacity of hovered highlight
    * @param {Array} structure_shapes SVG shapes to considered as concrete
    * drawing ("text" excluded by default)
    * @param {number} dblclick_timeout minimum time between 2 independant clicks
    * @param {number} hover_timeout time before update hovered element
    *
    */
   this.init = function(
      svg_txt,
      ui_elements,
      element_styles,
      show_menu = true,
      menu_width = "20px",
      zoom_min = 0.5, zoom_max = 20,
      zoom_step = 1.1,
      clip=false,
      default_png_scale = 1,
      selection_color = "orange",
      selection_opacity = 0.5,
      hover_color = {button:"yellow", selectable: "cyan"},
      hover_opacity = 0.5,
      structure_shapes = [
         "rect", "circle", "ellipse", "line", "polyline",
         "polygon", "path"
      ],
      dblclick_timeout = 250,
      hover_timeout = 400,
   ){
      var scui = this;
      var el = document.getElementById(scui.id);

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

      var main_group = create_svg_element("g");
      var svg_elements = Array.from(svg.children);
      svg_elements.forEach(child => {
         main_group.appendChild(child);
      });
      svg.appendChild(main_group);


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

      var msep_elt = create_html_element('div');
      msep_elt.style.height = "20px";

      //
      menu_items.appendChild(msep_elt);
      var select_all_button = create_svg_icon("select_all", "Select all");
      menu_items.appendChild(select_all_button);

      var invert_sel_button = create_svg_icon("invert_sel", "Invert selection");
      menu_items.appendChild(invert_sel_button);

      //
      menu_items.appendChild(msep_elt.cloneNode(true));

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
      select_all_button.addEventListener("click", function (event) {
         scui.update_selection(scui.selectable);
      });
      invert_sel_button.addEventListener("click", function (event) {
         let new_sel = array_setdiff(scui.selectable, scui.selected);
         scui.update_selection(new_sel);
      });
      reset_button.addEventListener("click", function(event){
         scui.reset_view();
      });
      zoomin_button.addEventListener("click", function(event){
         scui.zoom_in();
      });
      zoomout_button.addEventListener("click", function(event){
         scui.zoom_out();
      });
      savepng_button.addEventListener("click", function(event){
         scui.save_png();
      });
      savesvg_button.addEventListener("click", function(event){
         scui.save_svg();
      });
      scalepng_button.addEventListener("click", function(event){
         var v = menu_items.style.display;
         scalepng_button.style.display = "none";
         scalepng_ui.style.display = "block";
         png_scale.focus();
      });
      closeui_button.addEventListener("click", function(event){
         var v = menu_items.style.display;
         scalepng_ui.style.display = "none";
         scalepng_button.style.display = "block";
      });
      // png_scale.addEventListener('focus', function () {
         png_scale.addEventListener("keydown", function(event){
            if(event.key == "Enter"){
               let clickEvent = new Event("click");
               closeui_button.dispatchEvent(clickEvent);
            }
         });
      // });

      // Add to the document
      el.appendChild(div);

      // Selection group
      var sel_group = create_svg_element("g");
      svg.appendChild(sel_group);

      // Config
      scui.svg = svg;
      scui.main_group = main_group;
      scui.sel_group = sel_group;
      scui.structure_shapes = new Set(structure_shapes);
      if(ui_elements){
         scui.ui_elements = ui_elements;
      }else{
         scui.ui_elements = {id:[], ui_type:[], title:[]};
      }
      scui.select_event = new CustomEvent("elementSelected", {
         detail: {
            id: scui.id,
         },
      });
      scui.operate_event = new CustomEvent("elementOperated", {
         detail: {
            id: scui.id,
         },
      });
      scui.hover_event = new CustomEvent("elementHovered", {
         detail: {
            id: scui.id,
         },
      });
      scui.zoom_current = 1;
      scui.zoom_min = zoom_min;
      scui.zoom_max = zoom_max;
      scui.zoom_step = zoom_step;
      scui.clip = clip;
      scui.default_png_scale = default_png_scale;

      // Update ui elements
      if(ui_elements){
         for (let i = 0; i < ui_elements.id.length; i++) {
            let id = ui_elements.id[i];
            if(ui_elements.ui_type[i] == "selectable"){
               scui.selectable.add(id);
            }
            if (ui_elements.ui_type[i] == "button") {
               scui.buttons.add(id);
            }
         }
      }
      scui.set_element_styles(element_styles);

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
            scui.ori_viewBox = vb;
         });
      //

      // Display Events
      svg.addEventListener("wheel", function(event){
         scui.wheel_zoom(event);
      });

      svg.addEventListener("mousedown", function(event){
         scui.mouse_move(event);
      });

      // Interaction Events
      var mouse_move_timer;
      svg.addEventListener("mousemove", function (event) {

         var target = event.target;
         var target_ids = get_ancestors_ids(target);
         var hovered = array_intersect(
            target_ids,
            scui.ui_elements.id
         )[0];
         var existing = svg.getElementById("hovered_shape");
         if(hovered){
            var renew = false;
            if(existing){
               if(hovered == existing.getAttribute("data-element")){
                  renew = false;
               }else{
                  scui.sel_group.removeChild(existing);
                  renew = true;
               }
            }else{
               renew = true;
            }
            if (renew) {
               var element_category = "none";
               if (scui.selectable.has(hovered)){
                  element_category = "selectable";
               }
               if (scui.buttons.has(hovered)) {
                  element_category = "button";
               }
               var color = hover_color[element_category];
               if(color){
                  var to_add = svg.getElementById(hovered).cloneNode(true);
                  to_add.setAttribute("data-element", hovered);
                  to_add.id = "hovered_shape";
                  to_add.style.visibility = "visible";
                  to_add.style.pointerEvents = 'none';
                  if(scui.structure_shapes.has(to_add.tagName)){
                     to_add.style.fill = "none";
                     to_add.style.stroke = color;
                     to_add.style.strokeWidth = to_add.style.strokeWidth + 4;
                     to_add.style.strokeOpacity = 1;
                     to_add.style.opacity = hover_opacity;
                  }
                  scui.structure_shapes.forEach(shape => {
                     let selected_elements = to_add.getElementsByTagName(shape);
                     Array.from(selected_elements).forEach(to_mod => {
                        to_mod.id = null;
                        to_mod.style.fill = "none";
                        to_mod.style.stroke = color;
                        to_mod.style.visibility = "visible";
                        to_mod.style.strokeWidth = to_mod.style.strokeWidth + 4;
                        to_mod.style.strokeOpacity = 1;
                        to_mod.style.opacity = hover_opacity;
                        to_mod.style.pointerEvents = 'none';
                     });
                  });
                  scui.sel_group.appendChild(to_add);
               }
            }
         }else{
            if(existing){
               scui.sel_group.removeChild(existing);
            }
         }

         clearTimeout(mouse_move_timer);
         mouse_move_timer = setTimeout(function(){
            scui.hovered = hovered;
            scui.clientX = event.clientX;
            scui.clientY = event.clientY;
            svg.dispatchEvent(scui.hover_event)
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
         scui.hovered = tooltip.getAttribute("data-element");
      })
      svg.addEventListener("elementHovered", function (event) {
         if (scui.hovered) {
            var exists = false;
            if (tooltip.style.visibility == "visible") {
               if (tooltip.getAttribute("data-element") != scui.hovered) {
                  tooltip.style.visibility = "hidden";
               } else {
                  exists = true
               }
            }
            if (!exists) {
               var ind = scui.ui_elements.id.indexOf(scui.hovered);
               var title = scui.ui_elements.title[ind];
               if (title) {
                  tooltip.innerHTML = title;
                  var x = scui.clientX -
                     container.getBoundingClientRect().left +
                     container.scrollLeft + 10;
                  var y = scui.clientY -
                     container.getBoundingClientRect().top +
                     container.scrollTop + 15;
                  tooltip.style.left = x + "px";
                  tooltip.style.top = y + "px";
                  tooltip.style.display = "block";
                  tooltip.style.position = "absolute";
                  tooltip.setAttribute("data-element", scui.hovered);
                  tooltip.style.visibility = "visible";
               }
            }
         } else {
            tooltip.style.visibility = "hidden";
         }
      });

      var clickTimer;
      svg.addEventListener("click", function(event){
         if(scui.moved){
            // console.log("moving");
         }else{
            var target = event.target;
            var target_ids = get_ancestors_ids(target);
            var to_update = array_intersect(
               target_ids,
               scui.selectable
            )[0];
            //
            var to_trigger = array_intersect(
               target_ids,
               scui.buttons
            )[0];
            if(to_trigger){
               clearTimeout(clickTimer);
               clickTimer = setTimeout(function () {
                  scui.click_element(to_trigger, false)
                  // trigger event
                  svg.dispatchEvent(scui.operate_event);
               }, dblclick_timeout);
            }else{
               var empty_sel = true;
               if(to_update){
                  empty_sel = false;
                  var p = to_update;
                  var sel_element = svg.getElementById(to_update);
                  to_update = [to_update];
                  to_update.push(...get_all_descendant_ids(sel_element));
                  to_update = array_intersect(to_update, scui.selectable);
               }
               if (!event.ctrlKey) {
                  if (empty_sel) {
                     scui.selected.clear() ;
                  } else {
                     scui.selected.clear();
                     for(let tu of to_update){
                        scui.selected.add(tu)
                     };
                  }
               } else {
                  if (!empty_sel) {
                     if(scui.selected.has(p)){
                        for (let tu of to_update) {
                           scui.selected.delete(tu)
                        }
                     }else{
                        for (let tu of to_update) {
                           scui.selected.add(tu)
                        }
                     }
                  }
               }
               // trigger event
               svg.dispatchEvent(scui.select_event);
            }
         }
      });

      svg.addEventListener("elementSelected", function(event){
         var disp_sel = scui.sel_group.getElementsByTagName("*");
         var disp_identifiers = [];
         var selid = [];
         scui.selected.forEach(e => { selid.push("selection.-_-." + e) })
         var allid = [];
         scui.selectable.forEach(e => { allid.push("selection.-_-." + e) })
         Array.from(disp_sel).forEach(element => {
            if(allid.includes(element.id)){
               disp_identifiers.push(element.id);
               if(!selid.includes(element.id)){
                  element.parentElement.removeChild(element);
               }
            }
         });
         scui.selected.forEach(id => {
            var current = svg.getElementById(id);
            if (!disp_identifiers.includes("selection.-_-." + id) && current){
               var to_add = current.cloneNode(true);
               to_add.id = "selection.-_-." + to_add.id;
               to_add.style.visibility = "visible";
               to_add.style.pointerEvents = 'none';
               if (scui.structure_shapes.has(to_add.tagName)) {
                  to_add.style.fill = "none";
                  to_add.style.stroke = selection_color;
                  to_add.style.strokeWidth = to_add.style.strokeWidth + 4;
                  to_add.style.strokeOpacity = 1;
                  to_add.style.opacity = selection_opacity;
               }
               scui.structure_shapes.forEach(shape => {
                  let selected_elements = to_add.getElementsByTagName(shape);
                  Array.from(selected_elements).forEach(to_mod => {
                     // to_mod.id = "selection.-_-." + to_mod.id;
                     to_mod.style.fill = "none";
                     to_mod.style.stroke = selection_color;
                     to_mod.style.visibility = "visible";
                     to_mod.style.strokeWidth = to_mod.style.strokeWidth + 4;
                     to_mod.style.strokeOpacity = 1;
                     to_mod.style.opacity = selection_opacity;
                     to_mod.style.pointerEvents = 'none';
                  });
               });
               var di = array_intersect(
                  get_all_descendant_ids(to_add),
                  scui.selectable
               );
               Array.from(to_add.getElementsByTagName("*")).forEach(e => {
                  if(di.includes(e.id)){
                     e.id = "selection.-_-." + e.id;
                  }
               });
               disp_identifiers.push(id);
               disp_identifiers.push(...di);
               scui.sel_group.appendChild(to_add);
            }
         })
         var disp_sel = scui.sel_group.getElementsByTagName("*");
         Array.from(disp_sel).forEach(element => {
            if (allid.includes(element.id)) {
               if (!selid.includes(element.id)) {
                  element.parentElement.removeChild(element);
               }
            }
         });
      });

      svg.addEventListener("dblclick", function (event) {
         if (scui.moved) {
            // console.log("moving");
         } else {
            clearTimeout(clickTimer);
            var target = event.target;
            var target_ids = get_ancestors_ids(target);
            var to_trigger = array_intersect(
               target_ids,
               scui.buttons
            )[0];
            scui.click_element(to_trigger, true)
            // trigger event
            svg.dispatchEvent(scui.operate_event);
         }
      });

      return(el);
   };

   //////////////////////////////////
   /**
    * Update selection
    * 
    * @param {Array} elements element identifiers to select
    *
    */
   this.update_selection = function (elements) {
      var scui = this;
      var svg = scui.svg;
      scui.selected = new Set(array_intersect(
         elements,
         scui.selectable
      ));
      // trigger event
      svg.dispatchEvent(scui.select_event);
   };

   //////////////////////////////////
   /**
    * Click on an element
    * 
    * @param {string} element identifier of the element to click on
    * @param {boolean} dbl_click if true double click
    *
    */
   this.click_element = function (element, dbl_click) {
      var scui = this;
      var svg = scui.svg;
      if (scui.buttons.has(element) && typeof(dbl_click)==="boolean") {
         scui.button.n = scui.button.n + 1
         scui.button.id = element;
         if(dbl_click){
            scui.button.click = "double";
         }else{
            scui.button.click = "single";
         }
         // trigger event
         svg.dispatchEvent(scui.operate_event);
      }
   };


   //////////////////////////////////
   /**
    * Set element styles
    * 
    * @param {object} element_styles a data frame with an "id" column and
    *    column per style to apply
    * @param {Array} to_ignore identifiers of elements to ignore:
    * if those elements are children of elements to update they won't be updated
    * @param {Array} targeted_tags affected tag names
    * (by default: structure_shapes of the scui object)
    *
    */
   this.set_element_styles = function (
      element_styles, to_ignore = [], targeted_tags = this.structure_shapes
   ){
      var scui = this;
      var svg = scui.svg;
      targeted_tags = new Set(targeted_tags);

      var set_by_node = function(node, i){
         if(to_ignore.includes(node.id)){
            return;
         }
         if(targeted_tags.has(node.tagName)){
            for (let pname in element_styles) {
               if(pname != "id"){
                  node.style[pname] = element_styles[pname][i];
               }
            }
         }
         Array.from(node.children).forEach(child => {
            set_by_node(child, i)
         })
      }

      if (element_styles) {
         for (let i = 0; i < element_styles.id.length; i++) {
            let id = element_styles.id[i];
            let element = svg.getElementById(id);
            set_by_node(element, i)
         }
      }
   }


   //////////////////////////////////
   /**
    * Reset view
    *
    */
   this.reset_view = function(){
      var scui = this;
      var svg = scui.svg;
      svg.setAttribute("viewBox", scui.ori_viewBox);
      scui.zoom_current = 1;
   };

   //////////////////////////////////
   /**
    * Zoom in
    *
    */
   this.zoom_in = function(){
      var scui = this;
      var svg = scui.svg;
      var viewBox = svg.getAttribute("viewBox").split(" ");
      var vbx = Number(viewBox[0]);
      var vby = Number(viewBox[1]);
      var vbw = Number(viewBox[2]);
      var vbh = Number(viewBox[3]);
      var neww, newh;

      var zf = scui.zoom_step;
      var new_zoom = scui.zoom_current * zf;
      if(new_zoom > scui.zoom_max || new_zoom < scui.zoom_min){
         return;
      }
      if(scui.clip && Math.abs(Math.log10(new_zoom)) < 0.001){
         scui.zoom_current = 1;
         svg.setAttribute("viewBox", scui.ori_viewBox);
         return;
      }
      scui.zoom_current = new_zoom;
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
      var scui = this;
      var svg = scui.svg;
      var viewBox = svg.getAttribute("viewBox").split(" ");
      var vbx = Number(viewBox[0]);
      var vby = Number(viewBox[1]);
      var vbw = Number(viewBox[2]);
      var vbh = Number(viewBox[3]);
      var neww, newh;

      var zf = 1/scui.zoom_step;
      var new_zoom = scui.zoom_current * zf;
      if(new_zoom > scui.zoom_max || new_zoom < scui.zoom_min){
         return;
      }
      if(scui.clip && Math.abs(Math.log10(new_zoom)) < 0.001){
         scui.zoom_current = 1;
         svg.setAttribute("viewBox", scui.ori_viewBox);
         return;
      }
      scui.zoom_current = new_zoom;
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
      var scui = this;
      if(scui.stop_zoom){
         scui.stop_zoom = false;
         return;
      }
      var svg = scui.svg;
      var lcp = {x:event.clientX, y:event.clientY};
      var orip = point_to_area_ref(lcp, svg);
      var viewBox = svg.getAttribute("viewBox").split(" ");
      var vbx = Number(viewBox[0]);
      var vby = Number(viewBox[1]);
      var vbw = Number(viewBox[2]);
      var vbh = Number(viewBox[3]);
      var neww, newh;
      var svw = svg.getBoundingClientRect().width;
      var zf = scui.zoom_step;
      if(event.deltaY > 0){
         zf = 1/zf
      }
      var new_zoom = scui.zoom_current * zf;
      if(new_zoom > scui.zoom_max || new_zoom < scui.zoom_min){
         return;
      }
      if(scui.clip && Math.abs(Math.log10(new_zoom)) < 0.001){
         scui.zoom_current = 1;
         scui.stop_zoom = true;
         svg.setAttribute("viewBox", scui.ori_viewBox);
         return;
      }
      scui.zoom_current = new_zoom;
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
      var scui = this;
      scui.moved = false;

      if(
         event.button != 0 ||
         (scui.clip && scui.zoom_current == 1)
      ){
         return;
      }

      var svg = scui.svg;

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
               scui.moved = true;
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
    * Get core SVG (without extra elements used for interaction)
    *
    */
   this.get_core_svg = function(){
      var scui = this;
      var svg = scui.svg;
      var toRet = svg.cloneNode(true);
      toRet.setAttribute("viewBox", scui.ori_viewBox);
      toRet.removeChild(toRet.children[1]);
      var mg = toRet.children[0];
      while (mg.firstChild) {
         toRet.appendChild(mg.firstChild);
      }
      toRet.removeChild(mg);
      return(toRet)
   }

   //////////////////////////////////
   /**
    * Save SVG file
    *
    */
   this.save_svg = function(){
      var fileName = "image.svg";

      var scui = this;
      var tosave = scui.get_core_svg();

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

      var scui = this;
      var svgOri = scui.svg;

      var svg = svgOri.cloneNode(true);
      svg.setAttribute("version", 1.1);
      svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");

      var scale = Number(scui.png_scale.value);
      if(!scale){
         scale = scui.default_png_scale;
      }
      var viewBox = scui.ori_viewBox.split(" ");
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
