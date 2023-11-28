library(shiny)
library(bscui)

ui <- function(req){
   fluidPage(
      title= "Test bscui",
      fluidRow(
         column(
            6,
            bscuiOutput("org_interface", height="94vh"),
            style = "
               margin: 10px;
               padding: 5px;
               border: solid black;
            "
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
         title = sprintf("This is <strong>%s</strong>", label),
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
      mutate(ui_type = ifelse(label == "brain", "button", "selectable"))

   output$org_interface <- renderBscui({
      bscui(svg, elements, menu_width="30px")
   })
   observe({
      print(input$org_interface_selected)
   })
}

runApp(shinyApp(ui, server))
