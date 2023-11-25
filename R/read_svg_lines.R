#' Read an svg file as a character scalar
#'
#' @param file file path
#'
#' @returns A character vector of length 1
#'
#' @export
#'
read_svg_lines <- function(file){
   paste(readLines(file), collapse="\n")
}
