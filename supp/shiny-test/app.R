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

   output$org_interface <- renderBscui({
      bscui(svg, menu_width="30px")
   })
}

runApp(shinyApp(ui, server))
