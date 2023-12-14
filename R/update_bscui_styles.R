###############################################################################@
#' Update the style of bscui ui elements in Shiny app
#'
#' @param proxy a [`bscui_Proxy`] object
#' @param element_styles a data frame with an "id" column and
#' one column per style to apply. If the "id" column is missing, then the
#' modifications apply to the svg selected elements.
#' @param to_ignore of elements to ignore: if those elements are
#' children of elements to update they won't be updated. This parameter
#' is not taken into account when there is no "id" column in the element_styles
#' data frame.
#' @param targeted_tags affected tag names. If NULL (default),
#' the structure_shapes of the [`bscui`] object
#'
#' @return the provided proxy object
#'
#' @export
#'
update_bscui_styles <- function(
   proxy, element_styles, to_ignore=NULL, targeted_tags = NULL
){
   if(!any(class(proxy) %in% "bscui_Proxy")){
      stop(
         "You can use set_bscui_styles only within shiny and ",
         "using bscui_Proxy"
      )
   }
   data <- list(
      id = proxy$id,
      element_styles = element_styles,
      to_ignore = to_ignore,
      targeted_tags = targeted_tags
   )
   proxy$session$sendCustomMessage("bscuiShinyElementStyles", data)
   proxy
}
