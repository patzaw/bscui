###############################################################################@
#' Get the displayed SVG
#'
#' @param proxy a [`bscui_Proxy`] object
#'
#' @return the provided proxy object
#'
#' @export
#'
get_bscui_svg <- function(proxy){
   if(!any(class(proxy) %in% "bscui_Proxy")){
      stop(
         "You can use get_bscui_svg only within shiny and using bscui_Proxy"
      )
   }
   data <- list(id = proxy$id)
   proxy$session$sendCustomMessage("bscuiShinyGetSvg", data)
   proxy
}
