###############################################################################@
#' Change element order in the SVG
#'
#' @param proxy a [`bscui_Proxy`] object
#' @param element_ids the identifiers of the element to move
#' @param where where to move the elements (default: "front")
#'
#' @return the provided proxy object
#'
#' @example inst/examples/shiny-example.R
#'
#' @export
#'
order_bscui_elements <- function(
   proxy,
   element_ids,
   where = c("front", "back", "forward", "backward")
){
   if(!any(class(proxy) %in% "bscui_Proxy")){
      stop(
         "You can use order_bscui_elements only within 'shiny' and ",
         "using bscui_Proxy"
      )
   }
   data <- list(id = proxy$id, element_ids = element_ids, where = where)
   proxy$session$sendCustomMessage("bscuiShinyOrder", data)
   proxy
}
