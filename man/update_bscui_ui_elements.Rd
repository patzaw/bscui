% Generated by roxygen2: do not edit by hand
% Please edit documentation in R/update_bscui_ui_elements.R
\name{update_bscui_ui_elements}
\alias{update_bscui_ui_elements}
\title{Update the type and title of bscui ui elements in 'shiny' app}
\usage{
update_bscui_ui_elements(proxy, ui_elements)
}
\arguments{
\item{proxy}{a \code{\link{bscui_Proxy}} object}

\item{ui_elements}{NULL or a data frame with the following columns:
\itemize{
\item \strong{id}: the element identifier
\item \strong{ui_type}: either "selectable" (several elements can be selected),
"button" (action will be triggered on click), "none" (no ui)
\item \strong{title}: a description of the element to display on mouseover event
}}
}
\value{
the provided proxy object
}
\description{
Update the type and title of bscui ui elements in 'shiny' app
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
