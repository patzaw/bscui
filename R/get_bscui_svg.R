###############################################################################@
#' Get the displayed SVG
#'
#' @param proxy a [`bscui_Proxy`] object
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
