###############################################################################@
#' Build SVG/Shiny custom user interface
#'
#' @param svg_txt character string with svg code
#' @param context_elements TBD
#' @param width,height widget width: must be a valid CSS unit (like `'100\%'`,
#'   `'400px'`, `'auto'`) or a number, which will be coerced to a
#'   string and have `'px'` appended.
#' @param elementId hmtl identifier of the widget
#'
#' @export
#'
bscui <- function(
      svg_txt, context_elements=NULL,
      width = NULL, height = NULL, elementId = NULL
) {

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
   svg_txt <- sprintf(
      '<svg width="100%s" height="100%s">%s</svg>',
      "%", "%", svg_txt
   )


   # forward options using x
   x = list(
      svg_txt = svg_txt
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
