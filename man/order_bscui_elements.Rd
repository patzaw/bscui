% Generated by roxygen2: do not edit by hand
% Please edit documentation in R/order_bscui_elements.R
\name{order_bscui_elements}
\alias{order_bscui_elements}
\title{Change element order in the SVG}
\usage{
order_bscui_elements(
  proxy,
  element_ids,
  where = c("front", "back", "forward", "backward")
)
}
\arguments{
\item{proxy}{a \code{\link{bscui_Proxy}} object}

\item{element_ids}{the identifiers of the element to move}

\item{where}{where to move the elements (default: "front")}
}
\value{
the provided proxy object
}
\description{
Change element order in the SVG
}
\examples{
if(interactive()){
   from_shiny <- new.env()
   shiny::runApp(system.file(
      "examples", "shiny-anatomogram", package = "bscui"
   ))
   for(n in names(from_shiny)){
      bscui(from_shiny[[n]]) |> print()
   }
}
}
