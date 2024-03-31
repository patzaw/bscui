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
library(xml2)
library(dplyr)
library(readr)
library(stringr)
library(glue)
library(scales)

## ----eval=FALSE---------------------------------------------------------------
#  install.packages('bscui')

## ----eval = FALSE-------------------------------------------------------------
#  ## Dependencies
#  install.packages("htmlwidgets")
#  ## Install from github
#  devtools::install_github("patzaw/bscui")

## ----eval = FALSE-------------------------------------------------------------
#  library(bscui)
#  library(xml2)
#  library(dplyr)
#  library(readr)
#  library(stringr)
#  library(glue)
#  library(scales)
#  library(reactable)
#  library(reactable.extras)

## ----class.source='fold-hide'-------------------------------------------------
sessionInfo()

## -----------------------------------------------------------------------------
svg <- xml2::read_xml(system.file(
   "examples", "Animal_cells.svg.gz",
   package="bscui"
))

## -----------------------------------------------------------------------------
figure <- bscui(svg)
figure

## -----------------------------------------------------------------------------
info <- readr::read_tsv(system.file(
   "examples", "uniprot_cellular_locations.txt.gz",
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
ui_elements

## -----------------------------------------------------------------------------
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
   set_bscui_options(
      show_menu=FALSE, zoom_min=1, zoom_max=1, clip=TRUE,
      hover_width=1
   )

## ----eval=FALSE---------------------------------------------------------------
#  bscui(svg) |>
#     htmlwidgets::saveWidget(file = "figure.html")

## ----eval=FALSE---------------------------------------------------------------
#  bscui(svg) |>
#     set_bscui_options(show_menu=FALSE) |>
#     export_bscui_to_image(file = "figure.png", zoom=6)

## ----eval=FALSE---------------------------------------------------------------
#  Sys.setenv(
#  	"CHROMOTE_CHROME" = "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"
#  )

## -----------------------------------------------------------------------------
svg <- xml2::read_xml(system.file(
   "examples", "WP112.svg.gz",
   package="bscui"
))
info <- read_tsv(system.file(
   "examples", "WP112.txt.gz",
   package="bscui"
), col_types="c")

## -----------------------------------------------------------------------------
deg <- read_tsv(system.file(
   "examples", "DEG-by-nitrogen-source_MCB-Godard-2007.txt.gz",
   package="bscui"
), col_types=paste0(strrep("c", 3), strrep("n", 41)))

## -----------------------------------------------------------------------------
condition <- "ALANINE"
toTake <- c("ORF", paste(condition, "M"))
cond_deg <- deg |> 
   select(all_of(toTake)) |> 
   setNames(c("ensembl", "M")) |> 
   filter(!is.na(M))

## -----------------------------------------------------------------------------
col_scale <- col_numeric(
   "RdYlBu", domain=range(cond_deg$M), reverse=TRUE
)
styles <- cond_deg |> 
   mutate(
      fill=col_scale(M)
   ) |> 
   inner_join(select(info,id, ensembl), by="ensembl") |> 
   select(id, fill)

## -----------------------------------------------------------------------------
elements <- info |> 
   mutate(
      ui_type="selectable",
      bg = case_when(
         category == "GeneProduct" ~ "#FDFDBD",
         category == "Metabolite" ~ "#BDFDFD",
         TRUE ~ "white"
      )
   ) |> 
   left_join(cond_deg, by="ensembl") |> 
   mutate(
      de = ifelse(
         !is.na(M),
         glue("log2({condition}/UREA) = {round(M,2)}<br/>"),
         ""
      )
   ) |> 
   mutate(
      title = glue(
         '<div style="padding:5px;border:solid;background:{bg}">',
         '<strong>{name}</strong><br/>',
         '{de}',
         '<a href={href} target="_blank">{category} information</a>',
         '</div>'
      )
   ) |> 
   select(id, ui_type, title)

## -----------------------------------------------------------------------------
bscui(svg) |> 
   set_bscui_ui_elements(elements) |> 
   set_bscui_styles(styles)

## ----eval=FALSE---------------------------------------------------------------
#  shiny::runApp(system.file("examples", "shiny-anatomogram", package = "bscui"))

## ----eval=FALSE---------------------------------------------------------------
#  ui <- fluidPage(
#     bscuiOutput("anatomogram")
#  )
#  server <- function(input, output, session){
#     output$anatomogram <- renderBscui({
#        bscui(svg)|>
#           set_bscui_ui_elements(ui_elements)
#     })
#  }

## ----eval=FALSE---------------------------------------------------------------
#  server <- function(input, output, session){
#     output$anatomogram <- renderBscui({
#        bscui(svg)|>
#           set_bscui_ui_elements(ui_elements)
#     })
#     anatomogram_proxy <- bscuiProxy("anatomogram")
#  }

