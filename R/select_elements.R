###############################################################################@
#' Replace current selection with given element identifiers
#'
#' @param bscui a [`bscui_Proxy`] object
#' @param element_ids element identifiers to add to the selection; empty clear
#' the selection
#'
#' @export
#'
select_elements <- function(bscui, element_ids){
   if(!any(class(bscui) %in% "bscui_Proxy")){
      stop(
         "You can use select_elements only within shiny & using bscui_Proxy"
      )
   }
   if(length(element_ids) <= 1){
      element_ids = list(element_ids)
   }
   data <- list(id = bscui$id, element_ids = element_ids)
   bscui$session$sendCustomMessage("bscuiShinySelect", data)
   bscui
}
