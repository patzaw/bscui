////////////////////////////////////////////////////////////////////////////////
/**
 * Check a value to be an Array and make an array if necessary
 *
 * @param {object} value the value to check
 * @param {Array} default_value an array to use as default value if the provided
 * object is null
 *
 * @return {Array} the provided value, the default_value or an Array with
 * the provided value as the only element
 *
 */
var check_array = function(value, default_value=[]){
   if(value == null){
      value = default_value;
   }
   if(!Array.isArray(value)){
      value = [value];
   }
   return(value)
}

////////////////////////////////////////////////////////////////////////////////
HTMLWidgets.widget({

   name: 'bscui',

   type: 'output',

   factory: function(el, width, height) {

      // Shared variables
      var scui = new Scui(el.id);

      return {

         // Render
         renderValue: function(x) {

            // Clean
            var cont = document.getElementById(el.id);
            while (cont.hasChildNodes()) {
                cont.removeChild(cont.lastChild);
            }

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
               element_attributes = x.element_attributes,
               show_menu = x.show_menu,
               menu_width = x.menu_width,
               zoom_min = x.zoom_min,
               zoom_max = x.zoom_max,
               zoom_step = x.zoom_step,
               clip = x.clip,
               default_png_scale = x.default_png_scale,
               selection_color = x.selection_color,
               selection_opacity = x.selection_opacity,
               selection_width = x.selection_width,
               hover_color = x.hover_color,
               hover_opacity = x.hover_opacity,
               hover_width = x.hover_width,
               structure_shapes = x.structure_shapes,
               dblclick_timeout = x.dblclick_timeout,
               hover_timeout = x.hover_timeout,
               sanitize_attributes = x.sanitize_attributes
            );
            var selected = check_array(x.selected);
            scui.update_selection(selected);

            // Shiny
            if(window.Shiny){

               // Pre-selection
               Shiny.setInputValue(el.id + '_selected', [...scui.selected]);

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
                     var element_ids = check_array(data.element_ids);
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
                     Shiny.setInputValue(
                        el.id + '_svg',
                        toRet.outerHTML + '\n<!--' + Date() + '-->'
                     );
                  }
               })
               Shiny.addCustomMessageHandler(
                  "bscuiShinyElementStyles",
                  function(data){
                     if(scui.id == data.id){
                        var targeted_tags = check_array(
                           data.targeted_tags,
                           default_value = [...scui.structure_shapes]
                        );
                        if('id' in data.element_styles){
                           var to_ignore = check_array(data.to_ignore);
                           scui.set_element_styles(
                              element_styles = data.element_styles,
                              to_ignore = to_ignore,
                              targeted_tags = targeted_tags,
                              append = data.append
                           )
                        }else{
                           scui.set_selection_styles(
                              element_styles = data.element_styles,
                              targeted_tags = targeted_tags,
                              append = data.append
                           )
                        }
                     }
                  }
               )
               Shiny.addCustomMessageHandler(
                  "bscuiShinyElementAttributes",
                  function(data){
                     if(scui.id == data.id){
                        var targeted_tags = check_array(
                           data.targeted_tags,
                           default_value = [...scui.structure_shapes]
                        );
                        if('id' in data.element_attributes){
                           var to_ignore = check_array(data.to_ignore);
                           scui.set_element_attributes(
                              element_attributes = data.element_attributes,
                              to_ignore = to_ignore,
                              targeted_tags = targeted_tags,
                              append = data.append
                           )
                        }else{
                           scui.set_selection_attributes(
                              element_attributes = data.element_attributes,
                              targeted_tags = targeted_tags,
                              append = data.append
                           )
                        }
                     }
                  }
               )
               Shiny.addCustomMessageHandler("bscuiShinyOrder", function(data){
                  if(scui.id == data.id){
                     var element_ids = check_array(data.element_ids);
                     scui.order_elements(element_ids, where = data.where);
                  }
               })
               Shiny.addCustomMessageHandler(
                  "bscuiShinyAddElement",
                  function(data){
                     if(scui.id == data.id){
                        scui.add_element(
                           element_id = data.element_id,
                           svg_txt = data.svg_txt,
                           ui_type = data.ui_type,
                           title = data.title
                        );
                     }
                  }
               )
               Shiny.addCustomMessageHandler(
                  "bscuiShinyRemoveElements",
                  function(data){
                     if(scui.id == data.id){
                        var element_ids = check_array(data.element_ids);
                        scui.remove_elements(element_ids);
                     }
                  }
               )
               Shiny.addCustomMessageHandler(
                  "bscuiShinyUpdateUI",
                  function(data){
                     if(scui.id == data.id){
                        scui.update_ui_elements(data.ui_elements);
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
