
# Build SVG Custom User Interface <img src="man/figures/bscui-medium.png" width="100px"/>

<!--
[![CRAN_Status_Badge](http://www.r-pkg.org/badges/version/bscui)](https://cran.r-project.org/package=bsui)
[![](http://cranlogs.r-pkg.org/badges/bsui)](https://cran.r-project.org/package=bsui)
-->

Render SVG as interactive figures to display contextual information,
with selectable and clickable user interface elements. These figures can
be seamlessly integrated into Rmarkdown and Quarto documents or Shiny
applications that react to events triggered within them. Additional
features include pan, zoom in/out functionality, and the ability to
export the figures in SVG or PNG formats.

## Installation

<!--
&#10;## From CRAN
&#10;
```r
install.packages("bscui")
```
&#10;-->

### Dependencies

The following R packages available on CRAN are required:

- [htmlwidgets](https://CRAN.R-project.org/package=htmlwidgets): HTML
  Widgets for R

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
- [shiny](https://CRAN.R-project.org/package=shiny): Web Application
  Framework for R
- [DT](https://CRAN.R-project.org/package=DT): A Wrapper of the
  JavaScript Library ‘DataTables’
- [colourpicker](https://CRAN.R-project.org/package=colourpicker): A
  Colour Picker Tool for Shiny and for Selecting Colours in Plots

### From github

``` r
devtools::install_github("patzaw/bscui")
```

## Documentation

- [Introduction to
  bscui](https://patzaw.github.io/bscui/articles/bscui.html): this
  introduction vignette is also included in the package:

``` r
vignette("bscui")
```

- [Preparing SVG: examples, tips and
  tricks](https://patzaw.github.io/bscui/articles/web_only/SVG-examples.html)

## Examples

``` r
library(bscui)
library(xml2)
library(readr)
library(dplyr)
library(stringr)

#######################################@
## Use an existing SVG file ----
svg <- xml2::read_xml(system.file(
   "svg-examples", "Animal_cells.svg.gz",
   package="bscui"
))
info <- readr::read_tsv(system.file(
   "svg-examples", "uniprot_cellular_locations.txt.gz",
   package="bscui"
), col_types=strrep("c", 6)) |> 
   mutate(id = str_remove(`Subcellular location ID`, "-"))
bscui(svg) |> 
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
   set_bscui_options(zoom_min=1, clip=TRUE)

#######################################@
## Create SVG shapes ----


#######################################@
## Shiny application example ----
```
