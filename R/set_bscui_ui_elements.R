###############################################################################@
#' Set UI elements of a bscui widget
#'
#' @param widget a [`bscui`] object
#' @param ui_elements NULL or a data frame with the following columns:
#'    - **id**: the element identifier
#'    - **ui_type**: either "selectable" (several elements can be selected),
#'    "button" (action will be triggered on click), "none" (no ui)
#'    - **title**: a description of the element to display on mouseover event
#'
#' @return The modified [`bscui`] object
#'
#' @example inst/examples/main-example.R
#'
#' @export
#'
set_bscui_ui_elements <- function(
   widget,
   ui_elements
){
   widget$x$ui_elements <- ui_elements
   return(widget)
}
