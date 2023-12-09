library(shiny)
library(bscui)
library(xml2)
library(dplyr)
library(stringr)

ui <- function(req){
   fluidPage(
      title= "Test bscui",
      tags$head(tags$link(rel="icon", type="image/png", href="bscui-ico.png")),
      fluidRow(
         column(
            6,
            tags$div(
               bscuiOutput("cell_interface", height="94vh"),
               style = "
                  margin-top: 10px;
                  margin-bottom: 10px;
                  padding: 5px;
                  border: solid black;
               "
            )
         ),
         column(
            6,
            tags$h3("Values"),
            tags$h4("Hovered over (not immediately updated"),
            verbatimTextOutput("hovered_org"),
            tags$h4("Selected (selectable elements)"),
            verbatimTextOutput("selected_org"),
            uiOutput("format_sel")
         )
      )
   )
}

server <- function(input, output, session){
   svg <- read_xml(system.file(
      "svg-examples", "Epithelial_cells.svg",
      package="bscui"
   ))
   ## Remove text elements
   xml_ns_strip(svg)
   texts <- xml_find_all(svg, "//text")
   for(to_remove in texts){
      xml_remove(to_remove)
   }

   elements <- read_tsv(system.file(
      "svg-examples", "locations_all_2023_12_06.tsv.gz",
      package="bscui"
   ), col_types="c")
   ui_elements <- elements |>
      mutate(
         id = str_remove(`Subcellular location ID`, "-"),
         ui_type = "selectable",
         # title = glue(
         #    '<div style="width:300px; height:100px; overflow:auto;',
         #    'border:black 1px solid">',
         #    "<strong>{Name}</strong>: {Description}",
         #    "</div>",
         #    .sep=" "
         # )
         title = glue(
            '<div style="background:#FFFF0080; padding:5px;">',
            '{Name}<div>'
         )
      ) |>
      select(id, ui_type, title)

   output$cell_interface <- renderBscui({
      bscui(
         svg |> as.character(),
         ui_elements = ui_elements,
         menu_width="30px",
         # hover_color=list(button="pink", selectable="cyan", none="green"),
         selection_color="red"
      )
   })
   output$selected_org <- renderPrint({
      paste(input$cell_interface_selected, collapse=", ")
   })
   output$hovered_org <- renderPrint({
      input$cell_interface_hovered
   })
   ui_prox <- bscuiProxy("cell_interface")

   output$format_sel <- renderUI({
      selected <- input$cell_interface_selected
      req(selected)
      tagList(
         textInput("fill", "Fill", "#000000"),
         numericInput("fill_opacity", "Fill opacity", value=0.5, min=0, max=1),
         textInput("stroke", "Stroke", "#000000"),
         numericInput("stroke_opacity", "Stroke opacity", value=1, min=0, max=1),
         actionButton("apply_styles", "Apply changes")
      )
   })
   observeEvent(input$apply_styles, {
      set_bscui_element_styles(
         ui_prox,
         element_styles = tibble(
            fill=input$fill,
            fillOpacity=input$fill_opacity,
            stroke = input$stroke,
            strokeOpacity = input$stroke_opacity
         ),
      )
   })
}

runApp(shinyApp(ui, server))
