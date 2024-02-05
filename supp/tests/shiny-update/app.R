library(shiny)
library(bscui)

###############################################################################@
## UI ----

ui <- function(req){
   fluidPage(
      title = "Test updating data",
      fluidRow(
         column(
            6,
            fluidRow(
               column(
                  12,
                  shiny::textInput(
                     "sid1", label = "SVG name", value = "heliocentric"
                  )
               )
            ),
            fluidRow(
               column(
                  12,
                  bscui::bscuiOutput("svg1")
               ),
               style="margin:10px;"
            )
         ),
         column(
            6,
            fluidRow(
               column(
                  12,
                  shiny::textInput(
                     "sid2", label = "SVG name", value = "410"
                  )
               )
            ),
            fluidRow(
               column(
                  12,
                  bscui::bscuiOutput("svg2")
               ),
               style="margin:10px;"
            )
         )
      )
   )
}

###############################################################################@
## SERVER ----
server <- function(input, output, session){

   output$svg1 <- bscui::renderBscui({
      sid <- input$sid1
      svg <- xml2::read_xml(sprintf(
         "https://dev.w3.org/SVG/tools/svgweb/samples/svg-files/%s.svg",
         sid
      ))
      req(svg)
      toRet <- bscui(svg)
      return(toRet)
   })

   output$svg2 <- bscui::renderBscui({
      sid <- input$sid2
      svg <- xml2::read_xml(sprintf(
         "https://dev.w3.org/SVG/tools/svgweb/samples/svg-files/%s.svg",
         sid
      ))
      req(svg)
      toRet <- bscui(svg)
      return(toRet)
   })

}

## Run the application ----
shinyApp(ui, server)
