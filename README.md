
# Build SVG Custom User Interface <img src="man/figures/bscui-medium.png" align="right" alt="" width="120" />

[![CRAN_Status_Badge](http://www.r-pkg.org/badges/version/bscui)](https://cran.r-project.org/package=bscui)
[![CRAN Download
Badge](http://cranlogs.r-pkg.org/badges/bscui)](https://cran.r-project.org/package=bscui)

Render SVG as interactive figures to display contextual information,
with selectable and clickable user interface elements. These figures can
be seamlessly integrated into ‘rmarkdown’ and ‘Quarto’ documents, as
well as ‘shiny’ applications, allowing manipulation of elements and
reporting actions performed on them. Additional features include pan,
zoom in/out functionality, and the ability to export the figures in SVG
or PNG formats.

## Installation

### From CRAN

``` r
install.packages("bscui")
```

### Dependencies

The following R packages available on CRAN are required:

- [htmlwidgets](https://CRAN.R-project.org/package=htmlwidgets): HTML
  Widgets for R
- [webshot2](https://CRAN.R-project.org/package=webshot2): Take
  Screenshots of Web Pages

And those are suggested for building the vignettes and running some
examples:

- [knitr](https://CRAN.R-project.org/package=knitr): A General-Purpose
  Package for Dynamic Report Generation in R
- [rmarkdown](https://CRAN.R-project.org/package=rmarkdown): Dynamic
  Documents for R
- [here](https://CRAN.R-project.org/package=here): A Simpler Way to Find
  Your Files
- [xml2](https://CRAN.R-project.org/package=xml2): Parse XML
- [dplyr](https://CRAN.R-project.org/package=dplyr): A Grammar of Data
  Manipulation
- [readr](https://CRAN.R-project.org/package=readr): Read Rectangular
  Text Data
- [stringr](https://CRAN.R-project.org/package=stringr): Simple,
  Consistent Wrappers for Common String Operations
- [glue](https://CRAN.R-project.org/package=glue): Interpreted String
  Literals
- [scales](https://CRAN.R-project.org/package=scales): Scale Functions
  for Visualization
- [shiny](https://CRAN.R-project.org/package=shiny): Web Application
  Framework for R
- [reactable](https://CRAN.R-project.org/package=reactable): Interactive
  Data Tables for R
- [reactable.extras](https://CRAN.R-project.org/package=reactable.extras):
  Extra Features for ‘reactable’ Package

### From github

``` r
devtools::install_github("patzaw/bscui")
```

## Documentation

- [Introduction to
  bscui](https://patzaw.github.io/bscui/articles/bscui.html); this
  introduction vignette is also included in the package:

``` r
vignette("bscui")
```

- [Preparing SVG: examples, tips and
  tricks](https://patzaw.github.io/bscui/articles/web_only/SVG-examples.html)

## Examples

### Building figures

This example relies on a figure of animal cells taken from
[SwissBioPics](https://www.swissbiopics.org/name/Animal_cell).

``` r
##################################@
### Preparing data ----

library(bscui)
library(xml2)
library(readr)
library(dplyr)

svg <- xml2::read_xml(system.file(
   "examples", "Animal_cells.svg.gz",
   package="bscui"
))
info <- readr::read_tsv(system.file(
   "examples", "uniprot_cellular_locations.txt.gz",
   package="bscui"
), col_types=strrep("c", 6)) |>
   mutate(id = sub("-", "", `Subcellular location ID`))

##################################@
### Building the figure ----

figure <- bscui(svg) |>
   set_bscui_ui_elements(
      info |>
         mutate(
            ui_type = "selectable",
            title = Name
         ) |>
         select(id, ui_type, title)
   ) |>
   set_bscui_styles(
      info |>
         filter(Name == "Cytosol") |>
         mutate(fill = "#FF7F7F") |>
         select(id, fill)
   ) |>
   set_bscui_attributes(
      info |>
         filter(Name == "Cytoskeleton") |>
         mutate(display = "none") |>
         select(id, display)
   ) |>
   set_bscui_selection("SL0188") |>
   set_bscui_options(zoom_min=1, clip=TRUE)
figure

##################################@
### Saving the figure ----

if(interactive()){
   ## Temporary directory to save example file
   tdir <- tempdir()

   ## Interactive html file
   f_path <- file.path(tdir, "figure.html")
   figure |> htmlwidgets::saveWidget(file=f_path)
   cat(f_path)

   ## PNG image
   f_path <- file.path(tdir, "figure.png")
   figure |>
      set_bscui_options(show_menu = FALSE) |>
      export_bscui_to_image(file=f_path, zoom=2)
   cat(f_path)
}
```

### Figures in ‘shiny’

The following ‘shiny’ application relies on human female anatomical
diagram taken from the [EBI gene expression
group](https://github.com/ebi-gene-expression-group/anatomogram).

``` r
shiny::runApp(system.file("examples", "shiny-anatomogram", package = "bscui"))
```
