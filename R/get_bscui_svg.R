###############################################################################@
#' Get the displayed SVG
#'
#' @param proxy a [`bscui_Proxy`] object
#'
#' @return the provided proxy object
#'
#' @example inst/examples/shiny-example.R
#'
#' @export
#'
get_bscui_svg <- function(proxy){
   if(!any(class(proxy) %in% "bscui_Proxy")){
      stop(
         "You can use get_bscui_svg only within 'shiny' and using bscui_Proxy"
      )
   }
   data <- list(id = proxy$id)
   proxy$session$sendCustomMessage("bscuiShinyGetSvg", data)
   proxy
}
