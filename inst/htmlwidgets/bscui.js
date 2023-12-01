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
            scui.init(
               svg_txt = x.svg_txt,
               ui_elements= x.ui_elements,
               show_menu = x.show_menu,
               menu_width = x.menu_width,
               zoom_min = x.zoom_min,
               zoom_max = x.zoom_max,
               zoom_step = x.zoom_step,
               clip = x.clip,
               default_png_scale = x.default_png_scale,
               selection_color = x.selection_color,
               hover_color = x.hover_color,
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
                     scui.update_selection(data.element_ids);
                  }
               })
            }

         },

         resize: function(width, height) {
            // Re-render the widget with a new size
         },

         scui: scui

      };
   }
});
