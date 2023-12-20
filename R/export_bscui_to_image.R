###############################################################################@
#' Save a bscui widget to an image file
#'
#' @param widget a [`bscui`] object
#' @param file name of output file. Should end with an image file type
#' (.png, .jpg, .jpeg, or .webp) or .pdf.
#' @param selector ([webshot2::webshot()]) one or more CSS selectors specifying
#' a DOM element to set the clipping rectangle to (default: ".bscui").
#' @param zoom ([webshot2::webshot()]) If TRUE (default),
#' status updates via console messages are suppressed.
#' @param quiet ([webshot2::webshot()]) a number specifying the zoom factor.
#' @param ... additional parameters for [webshot2::webshot()]
#' suppressed.
#'
#' @seealso [webshot2::webshot()]
#'
#' @return Invisibly returns the normalized path to the image.
#' The character vector will have a class of "webshot".
#'
#' @example inst/examples/main-example.R
#'
#' @export
#'
export_bscui_to_image <- function(
   widget, file,
   selector=".bscui",
   zoom = 1,
   quiet = TRUE,
   ...
){
   html_file <- tempfile(fileext = ".html")
   on.exit(file.remove(html_file))
   htmlwidgets::saveWidget(widget, html_file)
   html_file <- normalizePath(html_file, winslash="/")
   invisible(webshot2::webshot(
      html_file, file=file,
      selector=selector,
      zoom = zoom,
      quiet = quiet,
      ...
   ))
}
