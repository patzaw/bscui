###############################################################################@
#' Build SVG/Shiny custom user interface
#'
#' @param svg_txt a character with svg code
#' @param ui_elements NULL or a data frame with the following columns:
#'    - **id**: the element identifier
#'    - **ui_type**: either "selectable" (several elements can be selected),
#'    "button" (action will be triggered on click), "none" (no ui)
#'    - **title**: a description of the element to display on mouseover event
#' @param element_styles NULL or a data frame with an **id** column providing
#' the element identifier and one column per style name. Column names
#' should correspond to a style name in camel case (e.g., "strokeOpacity").
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
#' @param selection_color color used to highlight selection
#' @param selection_opacity opacity of selection highlight
#' @param hover_color color used to highlight hovered element
#' (one for "button", one for "selectable", one for "none")
#' @param hover_opacity opacity of hovered highlight
#' @param structure_shapes SVG shapes to considered as concrete
#' drawing ("text" excluded by default)
#' @param dblclick_timeout minimum time between 2 independant clicks
#' @param hover_timeout time before update hovered element
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
      ui_elements = NULL,
      element_styles = NULL,
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
         button="yellow", selectable="cyan"
      ),
      hover_opacity = 0.5,
      structure_shapes = c(
         "rect", "circle", "ellipse", "line", "polyline", "polygon", "path"
      ),
      dblclick_timeout = 250,
      hover_timeout = 100,
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
      ui_elements = ui_elements,
      element_styles = list(list(
         element_styles = element_styles,
         to_ignore = NULL,
         targeted_tags = structure_shapes
      )),
      element_attributes = list(list(
         element_attributes = NULL,
         to_ignore = NULL,
         targeted_tags = NULL
      )),
      show_menu = show_menu,
      menu_width = menu_width,
      zoom_min = zoom_min,
      zoom_max = zoom_max,
      zoom_step = zoom_step,
      clip = clip,
      default_png_scale = default_png_scale,
      selection_color = selection_color,
      selection_opacity = selection_opacity,
      hover_color = hover_color,
      hover_opacity = hover_opacity,
      structure_shapes = structure_shapes,
      dblclick_timeout = dblclick_timeout,
      hover_timeout = hover_timeout,
      sanitize_attributes = sanitize_attributes
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
#' - [add_elements]: add SVG elements to the UI
#' - [remove_elements]: remove SVG elements from the UI
#' - [order_bscui_elements] (where=c("front", "back", "forward", "backward"))
#'
#' - [update_bscui_attributes] set attributes of a UI element
#' (e.g. "d" for changing path of a shape or "cx", "cy" for changing circle
#' position)
#'
#' - [update_bscui_styles]: set style of UI elements
#' (e.g. "visibility", "fillOpacity")
#' - [select_bscui_elements]: chose selected elements (replace current selection)
#' - [click_bscui_element]: trigger a single or double click on a UI element
#' - [get_bscui_svg]: get the displayed svg
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
