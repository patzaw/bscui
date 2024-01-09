###############################################################################@
#' Remove SVG elements from the UI
#'
#' @param proxy a [`bscui_Proxy`] object
#' @param element_ids the identifiers of the elements to remove
#'
#' @return the provided proxy object
#'
#' @example inst/examples/shiny-example.R
#'
#' @export
#'
remove_bscui_elements <- function(proxy, element_ids){
   if(!any(class(proxy) %in% "bscui_Proxy")){
      stop(
         "You can use remove_bscui_elements only within 'shiny' and ",
         "using bscui_Proxy"
      )
   }
   data <- list(id = proxy$id, element_ids = element_ids)
   proxy$session$sendCustomMessage("bscuiShinyRemoveElements", data)
   proxy
}
