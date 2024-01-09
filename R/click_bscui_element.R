###############################################################################@
#' Trigger a click event on a clickable element
#'
#' @param proxy a [`bscui_Proxy`] object
#' @param element_id element identifier on which the click will be triggered
#' @param dbl_click logical indicating the type of click
#' (default: FALSE => single click is triggered)
#'
#' @return the provided proxy object
#'
#' @example inst/examples/shiny-example.R
#'
#' @export
#'
click_bscui_element <- function(proxy, element_id, dbl_click=FALSE){
   if(!any(class(proxy) %in% "bscui_Proxy")){
      stop(
         "You can use click_bscui_element only within 'shiny' and ",
         "using bscui_Proxy"
      )
   }
   data <- list(id = proxy$id, element_id = element_id, dbl_click = dbl_click)
   proxy$session$sendCustomMessage("bscuiShinyClick", data)
   proxy
}
