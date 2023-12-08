HTMLWidgets.widget({

   name: 'bscui',

   type: 'output',

   factory: function(el, width, height) {

      // Shared variables
      var scui = new Scui(el.id);

      return {

         // Render
         renderValue: function(x) {

            // Init bscui
            if(!x.structure_shapes){
               x.structure_shapes = [];
            }
            if(!Array.isArray(x.structure_shapes)){
               x.structure_shapes = [x.structure_shapes];
            }
            scui.init(
               svg_txt = x.svg_txt,
               ui_elements= x.ui_elements,
               element_styles = x.element_styles,
               show_menu = x.show_menu,
               menu_width = x.menu_width,
               zoom_min = x.zoom_min,
               zoom_max = x.zoom_max,
               zoom_step = x.zoom_step,
               clip = x.clip,
               default_png_scale = x.default_png_scale,
               selection_color = x.selection_color,
               selection_opacity = x.selection_opacity,
               hover_color = x.hover_color,
               hover_opacity = x.hover_opacity,
               structure_shapes = x.structure_shapes,
               dblclick_timeout = x.dblclick_timeout,
               hover_timeout = x.hover_timeout
            );

            // Shiny
            if(window.Shiny){

               // Talk
               scui.svg.addEventListener("elementSelected", function(event){
                  Shiny.setInputValue(el.id + '_selected', [...scui.selected]);
               });
               scui.svg.addEventListener("elementHovered", function(event){
                  var toRet = [] ;
                  if(scui.hovered){
                     toRet.push(scui.hovered);
                  }
                  Shiny.setInputValue(el.id + '_hovered', toRet);
               });
               scui.svg.addEventListener("elementOperated", function(event){
                  var toRet = scui.button;
                  Shiny.setInputValue(el.id + '_operated', toRet);
               });

               // Listen
               Shiny.addCustomMessageHandler("bscuiShinySelect", function(data){
                  if(scui.id == data.id){
                     var element_ids = data.element_ids;
                     if(!element_ids){
                        element_ids = [];
                     }
                     if(!Array.isArray(element_ids)){
                        element_ids = [element_ids];
                     }
                     scui.update_selection(element_ids);
                  }
               })
               Shiny.addCustomMessageHandler("bscuiShinyClick", function(data){
                  if(scui.id == data.id){
                     scui.click_element(data.element_id, data.dbl_click);
                  }
               })
               Shiny.addCustomMessageHandler("bscuiShinyGetSvg", function(data){
                  if(scui.id == data.id){
                     toRet = scui.get_core_svg();
                     Shiny.setInputValue(el.id + '_svg', toRet.outerHTML);
                  }
               })
               Shiny.addCustomMessageHandler(
                  "bscuiShinyElementStyles",
                  function(data){
                     if(scui.id == data.id){
                        var to_ignore = data.to_ignore;
                        if(!to_ignore){
                           to_ignore = [];
                        }
                        if(!Array.isArray(to_ignore)){
                           to_ignore = [to_ignore];
                        }
                        var targeted_tags = data.targeted_tags;
                        if(!targeted_tags){
                           targeted_tags = scui.structure_shapes;
                        }
                        if(!Array.isArray(targeted_tags)){
                           targeted_tags = [targeted_tags];
                        }
                        scui.set_element_styles(
                           element_styles = data.element_styles,
                           to_ignore = to_ignore,
                           targeted_tags = targeted_tags
                        )
                     }
                  }
               )
            }

         },

         resize: function(width, height) {
            // Re-render the widget with a new size
         },

         scui: scui

      };
   }
});
