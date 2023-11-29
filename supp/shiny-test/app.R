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
      mutate(ui_type = ifelse(label == "brain", "button", "selectable"))

   output$org_interface <- renderBscui({
      bscui(
         svg %>%
            gsub("<title[^<]*</title>", "", .),
         elements,
         menu_width="30px"
      )
   })
   observe({
      print(input$org_interface_selected)
   })
}

runApp(shinyApp(ui, server))
