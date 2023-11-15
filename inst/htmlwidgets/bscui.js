HTMLWidgets.widget({

   name: 'bscui',

   type: 'output',

   factory: function(el, width, height) {

      // TODO: define shared variables for this instance
      var sui = new Sui(el.id);

      return {

         renderValue: function(x) {

            sui.init(x.svg_txt);

         },

         resize: function(width, height) {

            // TODO: code to re-render the widget with a new size

         },

         sui: sui

      };
   }
});
