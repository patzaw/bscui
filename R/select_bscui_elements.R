###############################################################################@
#' Replace current selection with given element identifiers
#'
#' @param bscui a [`bscui_Proxy`] object
#' @param element_ids element identifiers to add to the selection; empty clear
#' the selection
#'
#' @export
#'
select_bscui_elements <- function(bscui, element_ids){
   if(!any(class(bscui) %in% "bscui_Proxy")){
      stop(
         "You can use select_bscui_elements only within shiny and ",
         "using bscui_Proxy"
      )
   }
   data <- list(id = bscui$id, element_ids = element_ids)
   bscui$session$sendCustomMessage("bscuiShinySelect", data)
   bscui
}
