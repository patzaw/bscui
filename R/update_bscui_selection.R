###############################################################################@
#' Replace current selection with given element identifiers
#'
#' @param proxy a [`bscui_Proxy`] object
#' @param element_ids element identifiers to add to the selection; empty clear
#' the selection
#'
#' @return the provided proxy object
#'
#' @example inst/examples/shiny-example.R
#'
#' @export
#'
update_bscui_selection <- function(proxy, element_ids){
   if(!any(class(proxy) %in% "bscui_Proxy")){
      stop(
         "You can use update_bscui_selection only within 'shiny' and ",
         "using bscui_Proxy"
      )
   }
   data <- list(id = proxy$id, element_ids = element_ids)
   proxy$session$sendCustomMessage("bscuiShinySelect", data)
   proxy
}
