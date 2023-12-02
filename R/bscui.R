###############################################################################@
#' Build SVG/Shiny custom user interface
#'
#' @param svg an `xml_document` or a character with svg code
#' @param ui_elements NULL or a data frame with the following columns:
#'    - **id**: the element identifier
#'    - **ui_type**: either "selectable" (several elements can be selected),
#'    "button" (action will be triggered on click), "none" (no ui)
#'    - **title**: a description of the element to display on mouseover event
#' @param element_styles NULL or a data frame with an **id** column providing
#' the element identifier and one column per style attribute. Column names
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
#' @param hover_color color used to highlight hovered element
#' (one for "button", one for "selectable", one for "none")
#' @param dblclick_timeout minimum time between 2 independant clicks
#' @param hover_timeout time before update hovered element
#' @param width,height widget width: must be a valid CSS unit (like `'100\%'`,
#'   `'400px'`, `'auto'`) or a number, which will be coerced to a
#'   string and have `'px'` appended.
#' @param elementId hmtl identifier of the widget
#'
#' @export
#'
bscui <- function(
      svg,
      ui_elements = NULL,
      element_styles = NULL,
      show_menu = TRUE,
      menu_width = "20px",
      zoom_min = 0.5,
      zoom_max = 20,
      zoom_step = 1.1,
      clip = FALSE,
      default_png_scale = 1,
      selection_color = "orange",
      hover_color = list(
         button="yellow", selectable="grey"
      ),
      dblclick_timeout = 250,
      hover_timeout = 500,
      width = NULL, height = NULL, elementId = NULL
) {

   ## Prepare SVG ----
   if(is.character(svg)){
      svg_txt <- paste(svg, collapse = "\n")
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
   }else{
      g <- read_xml('<g></g>')
      for(child in xml_children(svg)){
         xml2::xml_add_child(g, child)
         xml2::xml_remove(child)
      }
      xml2::xml_add_child(svg, g)
      svg_txt <- as.character(svg)
   }

   ## forward options using x
   x = list(
      svg_txt = svg_txt,
      ui_elements = ui_elements,
      element_styles = element_styles,
      show_menu = show_menu,
      menu_width = menu_width,
      zoom_min = zoom_min,
      zoom_max = zoom_max,
      zoom_step = zoom_step,
      clip = clip,
      default_png_scale = default_png_scale,
      selection_color = selection_color,
      hover_color = hover_color,
      dblclick_timeout = dblclick_timeout,
      hover_timeout = hover_timeout
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
#' - [move_elements] (where=c("front", "back", "forward", "backward"))
#' - [set_element_attributes] set attributes of UI elements
#' (e.g. "d" for changing path of a shape or "cx", "cy" for changing circle
#' position)
#' - [set_element_styles]: set style of UI elements
#' (e.g. "visibility", "fillOpacity")
#'
#' - [select_elements]: chose selected elements (replace current selection)
#' - [get_displayed_svg]: get the displayed svg
#'
#' - [click_on_element]: trigger a single or double click on a UI element
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
#' @name bscui-shiny
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
