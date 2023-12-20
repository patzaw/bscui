###############################################################################@
#' Replace current selection with given element identifiers
#'
#' @param proxy a [`bscui_Proxy`] object
#' @param element_ids element identifiers to add to the selection; empty clear
#' the selection
#'
#' @return the provided proxy object
#'
#' @examples
#' \dontrun{
#'    shiny::runApp(system.file(
#'       "examples", "shiny-anatomogram", package = "bscui"
#'    ))
#' }
#'
#' @export
#'
select_bscui_elements <- function(proxy, element_ids){
   if(!any(class(proxy) %in% "bscui_Proxy")){
      stop(
         "You can use select_bscui_elements only within shiny and ",
         "using bscui_Proxy"
      )
   }
   data <- list(id = proxy$id, element_ids = element_ids)
   proxy$session$sendCustomMessage("bscuiShinySelect", data)
   proxy
}
