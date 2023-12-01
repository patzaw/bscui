###############################################################################@
#' Add UI elements to the selection
#'
#' @param bscui a [`bscui_Proxy`] object
#' @param element_ids element identifiers to add to the selection
#'
#' @export
#'
select_elements <- function(bscui, element_ids){
   if(!any(class(bscui) %in% "bscui_Proxy")){
      stop(
         "You can use select_elements only within shiny & using bscui_Proxy"
      )
   }

   data <- list(id = bscui$id, element_ids = element_ids)

   bscui$session$sendCustomMessage("bscuiShinySelect", data)

   bscui
}
