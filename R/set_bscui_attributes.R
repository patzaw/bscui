###############################################################################@
#' Set attributes of elements of a bscui widget
#'
#' @param widget a [`bscui`] object
#' @param element_attributes a data frame with an **id** column
#' providing the element identifier and one column per attribute name.
#' @param to_ignore identifiers of elements to ignore:
#' if those elements are children of elements to update they won't be updated
#' @param targeted_tags targeted_tags affected tag names
#' (by default: structure_shapes of the scui object)
#' @param append if TRUE the value will be concatenate with the existing value
#'
#' @return The modified [`bscui`] object
#'
#' @example inst/examples/main-example.R
#'
#' @export
#'
set_bscui_attributes <- function(
   widget,
   element_attributes,
   to_ignore = NULL,
   targeted_tags = widget$x$structure_shapes,
   append = FALSE
){
   widget$x$element_attributes <- c(
      widget$x$element_attributes,
      list(list(
         element_attributes = element_attributes,
         to_ignore = to_ignore,
         targeted_tags = targeted_tags,
         append = append
      ))
   )
   return(widget)
}
