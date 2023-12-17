###############################################################################@
#' Build SVG/Shiny custom user interface
#'
#' @param svg_txt a character with svg code
#' @param sanitize_attributes logical indicating if
#' '<' and '>' characters in element attributes must be replaced by text
#' @param width,height widget width: must be a valid CSS unit (like `'100\%'`,
#'   `'400px'`, `'auto'`) or a number, which will be coerced to a
#'   string and have `'px'` appended.
#' @param elementId hmtl identifier of the widget
#'
#' @return An `htmlwidget` object
#'
#' @export
#'
bscui <- function(
      svg_txt,
      sanitize_attributes = TRUE,
      width = NULL, height = NULL, elementId = NULL
) {

   ## Prepare SVG ----
   svg_txt <- paste(svg_txt, collapse = "\n")
   cont <- regmatches(svg_txt, gregexpr("<svg[^>]*>", svg_txt))[[1]]
   if(length(cont) != 1){
      cont <- '<svg xmlns="http://www.w3.org/2000/svg" version="1.1">'
      svg_txt <- paste0(cont, svg_txt,'</svg>')
   }

   ## forward options using x
   x = list(
      svg_txt = svg_txt,
      ui_elements = NULL,
      element_styles = list(),
      element_attributes = list(),
      sanitize_attributes = sanitize_attributes,
      show_menu = TRUE,
      menu_width = "30px",
      zoom_min = 0.5,
      zoom_max = 20,
      zoom_step = 1.1,
      clip = FALSE,
      default_png_scale = 1,
      selection_color = "orange",
      selection_opacity = 0.5,
      hover_color = list(
         button="yellow", selectable="cyan", none="transparent"
      ),
      hover_opacity = 0.5,
      structure_shapes = c(
         "rect", "circle", "ellipse", "line", "polyline", "polygon", "path"
      ),
      dblclick_timeout = 250,
      hover_timeout = 100
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
#' @param shinyId single-element character vector indicating the shiny output ID
#'   of the UI to modify
#' @param session the Shiny session object to which the UI belongs; usually the
#'   default value will suffice
#'
#' @name bscui-shiny
#'
#' @details
#'
#' The UI can be updated with `bscuiProxy`, using different methods:
#' - [add_bscui_elements]: add SVG elements to the UI
#' - [remove_bscui_elements]: remove SVG elements from the UI
#'
#' - [order_bscui_elements]: change elements order (e.g. move them forward)
#' - [update_bscui_attributes] set attributes of a UI element
#' - [update_bscui_styles]: set style of UI elements
#' - [select_bscui_elements]: chose selected elements
#' - [click_bscui_element]: trigger a single or double click on a UI element
#' - [get_bscui_svg]: get the displayed SVG in R session
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
   if(!quoted){
      expr <- substitute(expr)
   } # force quoted
   htmlwidgets::shinyRenderWidget(expr, bscuiOutput, env, quoted = TRUE)
}

###############################################################################@
#' @rdname bscui-shiny
#' @aliases bscui_Proxy
#'
#' @export
bscuiProxy <- function(shinyId,  session = shiny::getDefaultReactiveDomain()){
   if(is.null(session)){
      stop(
         "bscuiProxy must be called from the server function of a Shiny app"
      )
   }
   object <- list(id = shinyId, session = session)
   class(object) <- "bscui_Proxy"
   object
}
