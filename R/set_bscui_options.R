###############################################################################@
#' Set options of bscui widget
#'
#' @param widget a [`bscui`] object
#' @param show_menu if TRUE (default) control menu will be available
#' @param menu_width css width value (default: "30px")
#' @param zoom_min smallest zoom value (default: 0.5)
#' @param zoom_max largest zoom value (default: 20)
#' @param zoom_step zooming step: the larger the faster (default: 1.1)
#' @param clip if TRUE (default: FALSE), when the current zoom is 1, the viewBox
#' is automatically set to its original state (the drawing cannot be moved)
#' @param default_png_scale default value for scaling PNG export (default: 1)
#' @param selection_color color used to highlight selection (default: "orange")
#' @param selection_opacity opacity of selection highlight (default: 0.5)
#' @param selection_width the additional stroke width to apply on selection
#'  (default: 4)
#' @param hover_color a list of colors used to highlight hovered elements
#' (default: `list(button="yellow", selectable="cyan", none="transparent")`)
#' @param hover_opacity opacity of hovered highlight (default: 0.5)
#' @param hover_width the additional stroke width to apply on hover (default: 4)
#' @param structure_shapes SVG shapes to considered as concrete
#' drawing
#' (default:
#' `c("rect", "circle", "ellipse", "line", "polyline", "polygon", "path")`:
#' "text" excluded)
#' @param dblclick_timeout minimum time in ms between 2 independant clicks
#' (default: 250)
#' @param hover_timeout time in ms before update hovered element (default: 100)
#' @param width,height widget width: must be a valid CSS unit (like `'100\%'`,
#'   `'400px'`, `'auto'`) or a number, which will be coerced to a
#'   string and have `'px'` appended.
#'
#' @return The modified [`bscui`] object
#'
#' @example inst/examples/main-example.R
#'
#' @export
#'
set_bscui_options <- function(
   widget,
   show_menu,
   menu_width,
   zoom_min,
   zoom_max,
   zoom_step,
   clip,
   default_png_scale,
   selection_color,
   selection_opacity,
   selection_width,
   hover_color,
   hover_opacity,
   hover_width,
   structure_shapes,
   dblclick_timeout,
   hover_timeout,
   width,
   height
){
   foptions <- as.list(match.call())[-1]
   foptions <- foptions[setdiff(
      names(foptions),
      c("widget", "width", "height")
   )]
   if(length(foptions) > 0){
      for(i in 1:length(foptions)){
         on <- names(foptions)[i]
         if(!on %in% names(widget$x)){
            stop(on, " is not a supported option")
         }
         widget$x[[on]] <- eval(foptions[[i]])
      }
   }
   if(!missing(width)){
      widget$width = width
   }
   if(!missing(height)){
      widget$height = height
   }
   return(widget)
}
