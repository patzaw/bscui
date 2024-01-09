###############################################################################@
#' Update the attributes of bscui elements in 'shiny' app
#'
#' @param proxy a [`bscui_Proxy`] object
#' @param element_attributes a data frame with an **id** column
#' providing the element identifier and one column per attribute name.
#' @param to_ignore of elements to ignore: if those elements are
#' children of elements to update they won't be updated. This parameter
#' is not taken into account when there is no "id" column in the element_styles
#' data frame.
#' @param targeted_tags affected tag names. If NULL (default),
#' the structure_shapes of the [`bscui`] object
#'
#' @return the provided proxy object
#'
#' @example inst/examples/shiny-example.R
#'
#' @export
#'
update_bscui_attributes <- function(
   proxy, element_attributes, to_ignore=NULL, targeted_tags = NULL
){
   if(!any(class(proxy) %in% "bscui_Proxy")){
      stop(
         "You can use update_bscui_attributes only within 'shiny' and ",
         "using bscui_Proxy"
      )
   }
   data <- list(
      id = proxy$id,
      element_attributes = element_attributes,
      to_ignore = to_ignore,
      targeted_tags = targeted_tags
   )
   proxy$session$sendCustomMessage("bscuiShinyElementAttributes", data)
   proxy
}
