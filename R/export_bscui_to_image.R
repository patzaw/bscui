###############################################################################@
#' Save a bscui widget to an image file
#'
#' @param widget a [`bscui`] object
#' @param file name of output file. Should end with an image file type
#' (.png, .jpg, .jpeg, or .webp) or .pdf.
#' @param delay Time to wait before taking screenshot, in seconds.
#' Sometimes a longer delay is needed for all assets to display properly.
#'
#' @seealso [webshot2::webshot()]
#'
#' @export
#'
export_bscui_to_image <- function(widget, file, delay=0.2){
   html_file <- tempfile(fileext = ".html")
   save_bscui(widget, html_file)
   invisible(webshot2::webshot(
      html_file, file=file, selector=".bscui", delay=delay
   ))
}
