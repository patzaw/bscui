###############################################################################@
#' Update the type and title of bscui ui elements in 'shiny' app
#'
#' @param proxy a [`bscui_Proxy`] object
#' @param ui_elements NULL or a data frame with the following columns:
#'    - **id**: the element identifier
#'    - **ui_type**: either "selectable" (several elements can be selected),
#'    "button" (action will be triggered on click), "none" (no ui)
#'    - **title**: a description of the element to display on mouseover event
#'
#' @return the provided proxy object
#'
#' @example inst/examples/shiny-example.R
#'
#' @export
#'
update_bscui_ui_elements <- function(
      proxy, ui_elements
){
   if(!any(class(proxy) %in% "bscui_Proxy")){
      stop(
         "You can use update_bscui_ui_elements only within 'shiny' and ",
         "using bscui_Proxy"
      )
   }
   data <- list(
      id = proxy$id,
      ui_elements = ui_elements
   )
   proxy$session$sendCustomMessage("bscuiShinyUpdateUI", data)
   proxy

}
