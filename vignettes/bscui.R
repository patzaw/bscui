## ----setup, message=FALSE, echo=FALSE, include=FALSE, cache=FALSE-------------
library(knitr)
opts_chunk$set(
   include=TRUE,
   echo=TRUE,
   message=TRUE,
   warning=TRUE,
   cache=FALSE,
   cache.lazy=FALSE
)
library(bscui)
library(dplyr)
library(xml2)
library(dplyr)
library(readr)
library(stringr)
library(glue)
library(DT)

## ----eval = FALSE-------------------------------------------------------------
#  ## Dependencies
#  install.packages("htmlwidgets")
#  ## Install from github
#  devtools::install_github("patzaw/bscui")

## ----eval = FALSE-------------------------------------------------------------
#  library(xml2)
#  library(dplyr)
#  library(readr)
#  library(htmltools)
#  library(stringr)
#  library(glue)
#  library(DT)

## ----class.source='fold-hide'-------------------------------------------------
sessionInfo()

## -----------------------------------------------------------------------------
svg <- xml2::read_xml(system.file(
   "svg-examples", "Animal_cells.svg",
   package="bscui"
))

## -----------------------------------------------------------------------------
figure <- bscui(svg)
figure

## -----------------------------------------------------------------------------
info <- readr::read_tsv(system.file(
   "svg-examples", "uniprot_cellular_locations.txt.gz",
   package="bscui"
), col_types=strrep("c", 6)) |> 
   mutate(id = str_remove(`Subcellular location ID`, "-"))

## -----------------------------------------------------------------------------
ui_elements <- info |> 
   mutate(
      ui_type = "selectable",
      title = glue(
         '<div style="width:300px; height:100px; overflow:auto; padding:5px;',
         'font-size:75%;',
         'border:black 1px solid; background:#FFFFF0AA;">',
         "<strong>{Name}</strong>: {Description}",
         "</div>",
         .sep=" "
      )
   ) |>
   select(id, ui_type, title)
figure <- bscui(svg, ui_elements = ui_elements)
figure

## -----------------------------------------------------------------------------
figure <- figure |> 
   set_bscui_styles(
      bind_rows(
         info |>
            filter(Name == "Cytosol") |>
            mutate(fill = "#FF7F7F"),
         info |>
            filter(Name == "Nucleoplasm") |>
            mutate(fill = "#7F7FFF")
      ) |> 
         select(
            id, fill
         )
   ) |> 
   set_bscui_styles(
      info |>
         filter(Name == "Endosome") |>
         mutate(stroke = "yellow", strokeWidth = "2px") |> 
         select(id, stroke, strokeWidth)
   )
figure

