###############################################################################@
#' Add an SVG element to the UI
#'
#' @param proxy a [`bscui_Proxy`] object
#' @param id the identifier of the element to add (will replace the id
#' attribute of the provided svg if any)
#' @param svg_txt a character with SVG code of one element and its children
#' @param ui_type either "selectable", "button" or "none". If NULL (default),
#' the element won't be available as UI
#' @param title a description of the element to display on mouseover event
#'
#' @return the provided proxy object
#'
#' @example inst/examples/shiny-example.R
#'
#' @export
#'
add_bscui_element <- function(proxy, id, svg_txt, ui_type=NULL, title=NULL){
   if(!any(class(proxy) %in% "bscui_Proxy")){
      stop(
         "You can use add_bscui_element only within 'shiny' and ",
         "using bscui_Proxy"
      )
   }
   data <- list(
      id = proxy$id,
      element_id = id, svg_txt = svg_txt, ui_type = ui_type, title = title
   )
   proxy$session$sendCustomMessage("bscuiShinyAddElement", data)
   proxy
}
