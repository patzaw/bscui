###############################################################################@
#' Get the displayed SVG
#'
#' @param bscui a [`bscui_Proxy`] object
#'
#' @export
#'
get_displayed_svg <- function(bscui){
   if(!any(class(bscui) %in% "bscui_Proxy")){
      stop(
         "You can use select_elements only within shiny & using bscui_Proxy"
      )
   }
   data <- list(id = bscui$id)
   bscui$session$sendCustomMessage("bscuiShinyGetSvg", data)
   bscui
}
