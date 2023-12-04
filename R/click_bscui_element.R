###############################################################################@
#' Trigger a click event on a clickable element
#'
#' @param bscui a [`bscui_Proxy`] object
#' @param element_id element identifier on which the click will be triggered
#'
#' @export
#'
click_bscui_element <- function(bscui, element_id, dbl_click=FALSE){
   if(!any(class(bscui) %in% "bscui_Proxy")){
      stop(
         "You can use click_bscui_element only within shiny & using bscui_Proxy"
      )
   }
   data <- list(id = bscui$id, element_id = element_id, dbl_click = dbl_click)
   bscui$session$sendCustomMessage("bscuiShinyClick", data)
   bscui
}
