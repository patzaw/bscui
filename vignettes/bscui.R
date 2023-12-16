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
#  library(stringr)
#  library(glue)

## ----class.source='fold-hide'-------------------------------------------------
sessionInfo()

## -----------------------------------------------------------------------------
svg <- xml2::read_xml(system.file(
   "svg-examples", "Animal_cells.svg.gz",
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
figure <- figure |> 
   set_bscui_ui_elements(ui_elements)
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

## -----------------------------------------------------------------------------
nucleus_part <- c(
   "SL0191", "SL0190", "SL0182", "SL0188", "SL0494", "SL0180",
   "SL0031", "SL0465", "SL0127", "SL0186"
)
figure <- figure |>
   set_bscui_attributes(
      info |>
         filter(
            !id %in% nucleus_part
         ) |>
         mutate(display="none") |>
         select(id, display)
   ) |> 
   set_bscui_attributes(tibble(id="sib_copyright", display="none")) |>
   set_bscui_attributes(tibble(id="SL0188", transform="scale(1.8 1.8)")) |> 
   set_bscui_attributes(
      tibble(id="SL0188", transform="translate(-237 -202)"),
      append=TRUE
   )
figure |> 
   set_bscui_options(show_menu=FALSE, zoom_min=1, zoom_max=1, clip=TRUE)

