library(shiny)
library(bscui)
library(xml2)
library(dplyr)
library(readr)
library(stringr)

ui <- function(req){
   addResourcePath(
      "www",
      system.file("www", package="bscui")
   )
   fluidPage(
      title= "Test bscui",
      tags$head(
         tags$link(
            rel="icon",
            href='www/bscui-ico.png'
         )
      ),
      fluidRow(
         column(
            6,
            tags$div(
               bscuiOutput("org_interface", height="94vh"),
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
            tags$h4("Operated (button elements)"),
            verbatimTextOutput("operated_org"),
            tags$h3("Test selection"),
            shiny::actionButton(
               "unique_predefined_sel", "Use predefined selection (1)"
            ),
            shiny::actionButton(
               "predefined_sel", "Use predefined selection (2)"
            ),
            shiny::actionButton("clear_sel", "Clear selection"),
            tags$h3("Test click"),
            fluidRow(
               column(
                  12,
                  tags$div(
                     shiny::actionButton("click_test", "Click on brain"),
                     style="display:inline-block;"
                  ),
                  tags$div(
                     shiny::checkboxInput("click_test_dbl", "Double click"),
                     style="display:inline-block;"
                  )
               )
            ),
            uiOutput("format_sel"),
            tags$h3("Test get SVG"),
            shiny::actionButton("getSvg", "Get SVG")
         )
      )
   )
}

server <- function(input, output, session){
   svg <- read_xml(system.file(
      "svg-examples", "homo_sapiens.female.svg.gz",
      package="bscui"
   ))
   element_titles <- read_tsv(system.file(
      "svg-examples", "homo_sapiens.female.txt.gz",
      package="bscui"
   ), col_types = "cc")
   elements <- element_titles |>
      mutate(
         ui_type = "selectable",
         title = sprintf(
            '<div style="background:#FFFF0080; padding:5px;">%s<div>',
            sprintf('This is <strong>%s</strong>', label)
         ),
         visibility = "visible",
         opacity = 0.5,
         fill = "#000080",
         fillOpacity = 0.5,
         stroke = "#000080",
         strokeWidth = 0.5,
         strokeOpacity = 1
      )
   elements_to_show <- c(
      "brain", "heart", "lung",
      "liver", "small_intestine", "stomach", "pancreas"
   )
   ui_elements <- elements |>
      mutate(
         ui_type = ifelse(label %in% elements_to_show, "selectable", "none"),
         ui_type = ifelse(label == "stomach", "none", ui_type),
         ui_type = ifelse(label == "brain", "button", ui_type)
      ) |>
      select(id, ui_type, title)
   element_styles <- elements |>
      mutate(
         visibility = ifelse(label %in% elements_to_show, "visible", "hidden"),
         title = ifelse(label == "brain", NA, title)
      ) |>
      select(-ui_type, -title, -label)
   output$org_interface <- renderBscui({
      ## Remove title elements
      xml_ns_strip(svg)
      titles <- xml_find_all(svg, "//title")
      for(to_remove in titles){
         xml_remove(to_remove)
      }
      bscui(
         svg
      ) |>
         set_bscui_ui_elements(ui_elements) |>
         set_bscui_styles(element_styles) |>
         set_bscui_options(
            menu_width="30px",
            # hover_color=list(button="pink", selectable="cyan", none="green"),
            selection_color="red"
         )
   })
   output$selected_org <- renderPrint({
      paste(input$org_interface_selected, collapse=", ")
   })
   output$hovered_org <- renderPrint({
      input$org_interface_hovered
   })
   output$operated_org <- renderPrint({
      sprintf(
         "%s click on %s (%s)",
         input$org_interface_operated$click,
         input$org_interface_operated$id,
         input$org_interface_operated$n
      )
   })
   ui_prox <- bscuiProxy("org_interface")
   observeEvent(input$unique_predefined_sel, {
      select_bscui_elements(ui_prox, "UBERON_0000948")
   })
   observeEvent(input$predefined_sel, {
      select_bscui_elements(ui_prox, c("UBERON_0000948", "UBERON_0002107"))
   })
   observeEvent(input$clear_sel, {
      select_bscui_elements(ui_prox, c())
   })

   observeEvent(input$click_test, {
      dbl_click <- as.logical(input$click_test_dbl)
      click_bscui_element(ui_prox, "UBERON_0000955", dbl_click)
   })

   observeEvent(input$getSvg, {
      get_bscui_svg(ui_prox)
   })
   observe({
      svg <- input$org_interface_svg
      req(svg)
      svg <- read_xml(svg)
      assign("saved_svg", svg, envir=.GlobalEnv)
   })

   output$format_sel <- renderUI({
      selected <- input$org_interface_selected
      req(selected)
      tagList(
         textInput("fill", "Fill", "#000000"),
         numericInput("fill_opacity", "Fill opacity", value=0.5, min=0, max=1),
         textInput("stroke", "Stroke", "#000000"),
         numericInput("stroke_opacity", "Stroke opacity", value=1, min=0, max=1),
         actionButton("apply_styles", "Apply changes"),
         textInput("scale", "Scale", 2)
      )
   })
   observeEvent(input$apply_styles, {
      update_bscui_styles(
         ui_prox,
         element_styles = tibble(
            fill=input$fill,
            fillOpacity=input$fill_opacity,
            stroke = input$stroke,
            strokeOpacity = input$stroke_opacity
         )
      )
      update_bscui_attributes(
         ui_prox,
         element_attributes = tibble(
            transform=sprintf("scale(%s)", input$scale)
         )
      )
   })
}

runApp(shinyApp(ui, server))
