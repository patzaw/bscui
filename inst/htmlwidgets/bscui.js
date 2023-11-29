HTMLWidgets.widget({

   name: 'bscui',

   type: 'output',

   factory: function(el, width, height) {

      // TODO: define shared variables for this instance
      var sui = new Sui(el.id);

      return {

         renderValue: function(x) {

            sui.init(
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
               dblclick_timeout = x.dblclick_timeout,
               hover_timeout = x.hover_timeout
            );

            if(window.Shiny){
               sui.svg.addEventListener("elementSelected", function(event){
                  Shiny.setInputValue(el.id + '_selected', sui.selected);
               });
               sui.svg.addEventListener("elementHovered", function(event){
                  var toRet = [] ;
                  if(sui.hovered){
                     toRet.push(sui.hovered);
                  }
                  Shiny.setInputValue(el.id + '_hovered', toRet);
               });
            }

         },

         resize: function(width, height) {

            // TODO: code to re-render the widget with a new size

         },

         sui: sui

      };
   }
});
