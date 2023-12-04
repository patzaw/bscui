###############################################################################@
#' Get the displayed SVG
#'
#' @param bscui a [`bscui_Proxy`] object
#'
#' @export
#'
get_bscui_svg <- function(bscui){
   if(!any(class(bscui) %in% "bscui_Proxy")){
      stop(
         "You can use get_bscui_svg only within shiny and using bscui_Proxy"
      )
   }
   data <- list(id = bscui$id)
   bscui$session$sendCustomMessage("bscuiShinyGetSvg", data)
   bscui
}
