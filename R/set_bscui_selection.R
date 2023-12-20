###############################################################################@
#' Pre-select UI elements in a bscui widget
#'
#' @param widget a [`bscui`] object
#' @param selected identifiers of pre-selected identifiers
#'
#' @return The modified [`bscui`] object
#'
#' @example inst/examples/main-example.R
#'
#' @export
#'
set_bscui_selection <- function(
      widget,
      selected
){
   widget$x$selected <- selected
   return(widget)
}
