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
               show_menu = x.show_menu,
               zoom_min = x.zoom_min,
               zoom_max = x.zoom_max,
               zoom_step = x.zoom_step,
               clip = x.clip,
               default_png_scale = x.default_png_scale
            );

         },

         resize: function(width, height) {

            // TODO: code to re-render the widget with a new size

         },

         sui: sui

      };
   }
});
