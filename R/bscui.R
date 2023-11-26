###############################################################################@
#' Build SVG/Shiny custom user interface
#'
#' @param svg_txt character string with svg code
#' @param ui_elements NULL or a data frame with the following columns:
#'    - **id**: the element identifier
#'    - **ui_type**: either "selectable" (several elements can be selected),
#'    "button" (action will be triggered on click), "none" (no ui)
#'    - **title**: a description of the element to display on mouseover event
#'    (support html tags). If NA, no description will be displayed.
#'    - **visibility**: the css visibility of the element. NA values
#'    are interpreted as "hidden".
#'    - **opacity**: the opacity of the element between 0 and 1
#'    (if NA, the value in the svg is kept)
#'    - **fill**: the color used to fill the element
#'    (if NA, the value in the svg is kept)
#'    - **fill_opacity**: opacity of fill
#'    (if NA, the value in the svg is kept)
#'    - **stroke**: the color used for element border
#'    (if NA, the value in the svg is kept)
#'    - **stroke_width**: the width of the element border
#'    (if NA, the value in the svg is kept)
#'    - **stroke_opacity**: opacity of stroke
#'    (if NA, the value in the svg is kept)
#' @param selection_color the color with which selected elements will be
#' highlighted
#'
#' @param show_menu if TRUE (default) control menu will be available
#' @param menu_width css width value
#' @param zoom_min smallest zoom value
#' @param zoom_max largest zoom value
#' @param zoom_step zooming step: the larger the faster
#' @param clip if true, when the current zoom is 1, the viewBox is
#'    automatically set to its original state (the drawing cannot be moved)
#' @param default_png_scale default value for scaling PNG export
#'
#' @param width,height widget width: must be a valid CSS unit (like `'100\%'`,
#'   `'400px'`, `'auto'`) or a number, which will be coerced to a
#'   string and have `'px'` appended.
#' @param elementId hmtl identifier of the widget
#'
#' @export
#'
bscui <- function(
      svg_txt,
      ui_elements=NULL,
      show_menu = TRUE,
      menu_width = "20px",
      zoom_min = 0.5,
      zoom_max = 20,
      zoom_step = 1.1,
      clip = FALSE,
      default_png_scale = 1,
      width = NULL, height = NULL, elementId = NULL
) {

   ## Prepare SVG ----
   cont <- regmatches(svg_txt, gregexpr("<svg[^>]*>", svg_txt))[[1]]
   if(length(cont) != 1){
      cont <- '<svg xmlns="http://www.w3.org/2000/svg" version="1.1">'
   }
   svg_txt <- sub(
      '.*<svg\n[^>]*>', '', svg_txt
   )
   svg_txt <- sub(
      '</svg>.*', '', svg_txt
   )
   svg_txt <- sprintf(
      '<g>%s</g>',
      svg_txt
   )
   svg_txt <- paste0(cont, svg_txt,'</svg>')


   ## forward options using x
   x = list(
      svg_txt = svg_txt,
      ui_elements = ui_elements,
      show_menu = show_menu,
      menu_width = menu_width,
      zoom_min = zoom_min,
      zoom_max = zoom_max,
      zoom_step = zoom_step,
      clip = clip,
      default_png_scale = default_png_scale
   )

   # create widget
   htmlwidgets::createWidget(
      name = 'bscui',
      x,
      width = width,
      height = height,
      package = 'bscui',
      elementId = elementId
   )
}

###############################################################################@
#' Shiny bindings for bscui
#'
#' Output and render functions for using bscui within Shiny applications.
#'
#' @param outputId output variable to read from
#' @param width,height Must be a valid CSS unit (like `'100\%'`,
#'   `'400px'`, `'auto'`) or a number, which will be coerced to a
#'   string and have `'px'` appended.
#' @param expr An expression that generates a bscui
#' @param env The environment in which to evaluate `expr`.
#' @param quoted Is `expr` a quoted expression (with `quote()`)? This
#'   is useful if you want to save an expression in a variable.
#'
#' @name bscui-shiny
#'
#' @export
#'
bscuiOutput <- function(outputId, width = '100%', height = '400px'){
   htmlwidgets::shinyWidgetOutput(
      outputId, 'bscui', width, height, package = 'bscui'
   )
}

###############################################################################@
#' @rdname bscui-shiny
#'
#' @export
#'
renderBscui <- function(expr, env = parent.frame(), quoted = FALSE) {
   if(!quoted) {
      expr <- substitute(expr)
   } # force quoted
   htmlwidgets::shinyRenderWidget(expr, bscuiOutput, env, quoted = TRUE)
}
