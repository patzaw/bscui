###############################################################################@
#' Set styles of elements of a bscui widget
#'
#' @param widget a [`bscui`] object
#' @param element_styles NULL or a data frame with an **id** column providing
#' the element identifier and one column per style attribute. Column names
#' @param to_ignore identifiers of elements to ignore:
#' if those elements are children of elements to update they won't be updated
#' @param targeted_tags targeted_tags affected tag names
#' (by default: structure_shapes of the scui object)
#'
#' @return The modified [`bscui`] object
#'
#' @export
#'
set_bscui_styles <- function(
   widget,
   element_styles,
   to_ignore = NULL,
   targeted_tags = widget$x$structure_shapes
){
   widget$x$element_styles <- c(
      widget$x$element_styles,
      list(list(
         element_styles = element_styles,
         to_ignore = to_ignore,
         targeted_tags = targeted_tags
      ))
   )
   return(widget)
}
