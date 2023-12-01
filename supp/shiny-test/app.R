library(shiny)
library(bscui)
library(xml2)
library(magrittr)
library(dplyr)

get_element_titles <- function(x){
   id <- xml_attr(x, "id")
   children <- xml_children(x)
   children_titles <- tibble(id=character(), label=character())
   label <- character()
   if(length(children) > 0) for(i in 1:length(children)){
      child <- children[[i]]
      if(xml_name(child) == "title"){
         label <- xml_attr(child, "id")
      }else{
         children_titles <- children_titles %>%
            bind_rows(get_element_titles(child))
      }
   }
   toRet <- tibble(id = id, label = label) %>%
      bind_rows(children_titles) %>%
      filter(!is.na(id))
   return(toRet)
}

ui <- function(req){
   fluidPage(
      title= "Test bscui",
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
            tags$h5("Test selection"),
            shiny::actionButton(
               "unique_predefined_sel", "Use predefined selection (1)"
            ),
            shiny::actionButton(
               "predefined_sel", "Use predefined selection (2)"
            ),
            shiny::actionButton("clear_sel", "Clear selection")
         )
      )
   )
}

server <- function(input, output, session){
   svg <- paste(readLines(system.file(
      "svg-examples", "homo_sapiens.male.svg",
      package="bscui"
   )), collapse="\n")
   xml <- read_xml(svg)
   elements <- get_element_titles(xml) %>%
      mutate(
         ui_type = "selectable",
         title = sprintf(
            '<div style="background:#FFFF0080; padding:5px;">This is <strong>%s</strong><div>',
            label
         ),
         visibility = "visible",
         opacity = 0.5,
         fill = "#000080",
         fill_opacity = 0.5,
         stroke = "#000080",
         stroke_width = 0.5,
         stroke_opacity = 1
      )%>%
      filter(
         label %in% c(
            "brain", "heart", "lung",
            "liver", "small_intestine", "stomach", "pancreas"
         )
      ) %>%
      mutate(ui_type = ifelse(label == "stomach", "none", ui_type)) %>%
      mutate(ui_type = ifelse(label == "brain", "button", ui_type)) %>%
      mutate(title = ifelse(label == "brain", NA, title))

   output$org_interface <- renderBscui({
      bscui(
         svg %>%
            gsub("<title[^<]*</title>", "", .),
         elements,
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
      select_elements(ui_prox, "UBERON_0000948")
   })
   observeEvent(input$predefined_sel, {
      select_elements(ui_prox, c("UBERON_0000948", "UBERON_0002107"))
   })
   observeEvent(input$clear_sel, {
      select_elements(ui_prox, c())
   })
}

runApp(shinyApp(ui, server))
