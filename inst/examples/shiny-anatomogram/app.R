library(shiny)
library(bscui)
library(xml2)
library(dplyr)
library(readr)
library(stringr)
library(glue)
library(reactable)
library(reactable.extras)

###############################################################################@
## Load data ----
svg_txt <- read_xml(system.file(
   "examples", "homo_sapiens.female.svg.gz",
   package="bscui"
)) |>
   as.character()
organs <- read_tsv(system.file(
   "examples", "homo_sapiens.female.txt.gz",
   package="bscui"
), col_types = "cc") |>
   arrange(label)
ols_url <- function(id){
   paste0(
      "https://www.ebi.ac.uk/ols4/ontologies/uberon/classes?obo_id=",
      url_escape(str_replace(id, "_", ":"))
   )
}
ui_elements <- organs |>
   mutate(
      ui_type = "selectable",
      title = glue(
         '<div style="background:#FDFDBD; padding:5px;">',
         '<strong>{label}</strong> ',
         '(<a href="{ols_url(id)}" target="_blank">{id}</a>)',
         '<div>'
      )
   ) |>
   select(id, ui_type, title)
app_colors <- list(
   blue = "#000080",
   green = "#008000",
   orange = "#FAA000"
)
default_color <- "blue"
element_styles <- organs |>
   mutate(
      visibility = "visible",
      opacity = 1,
      fill = app_colors[[default_color]],
      fillOpacity = 0.5,
      stroke = app_colors[[default_color]],
      strokeWidth = 0.5,
      strokeOpacity = 1
   ) |>
   select(-label)
organs_to_show <- c(
      "brain", "heart", "lung",
      "liver", "small_intestine", "stomach", "pancreas"
   )
element_attributes <- organs |>
   mutate(
      display = ifelse(label %in% organs_to_show, "block", "none"),
   ) |>
   select(id, display)
presel <- c("UBERON_0002107", "UBERON_0002048")

###############################################################################@
## UI ----
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
      reactable_extras_dependency(),
      fluidRow(
         column(
            6,
            tags$div(
               bscuiOutput("anatomogram", height="94vh"),
               style = "
                  margin-top: 10px;
                  margin-bottom: 10px;
                  margin-left: 0px;
                  margin-right: 0px;
                  padding: 5px;
                  border: solid black;
               "
            )
         ),
         column(
            6,
            fluidRow(
               column(
                  12,
                  reactableOutput("organs")
               ),
               style = "
                  margin-top: 10px;
                  margin-bottom: 10px;
                  margin-left: 0px;
                  margin-right: 5px;
                  padding: 5px;
                  border: solid black;
               "
            ),
            fluidRow(
               column(
                  6,
                  tags$h3("Status"),
                  tags$h4("Hovered over"),
                  verbatimTextOutput("hovered_org"),
                  tags$h4("Selected (selectable elements)"),
                  verbatimTextOutput("selected_org"),
                  tags$h4("Operated (button elements)"),
                  verbatimTextOutput("operated_org")
               ),
               column(
                  6,
                  tags$h3("Return SVG in R session"),
                  fluidRow(
                     column(8, textInput(
                        "svg_object_name", label=NULL,
                        value="", placeholder="Object name"
                     )),
                     column(4, uiOutput("getSvg"))
                  ),
                  uiOutput("move_sel")
               ),
               style = "
                  margin-top: 10px;
                  margin-bottom: 10px;
                  margin-left: 0px;
                  margin-right: 5px;
                  padding: 5px;
                  border: solid black;
               "
            )
         )
      )
   )
}

###############################################################################@
## Server ----
server <- function(input, output, session){

   organ_table <- reactiveVal({
      organs |>
         mutate(
            displayed = ifelse(label %in% organs_to_show, TRUE, FALSE),
            ui_type = "selectable",
            color = default_color,
            selection = ifelse(label %in% presel, "unselect", "select")
         )
   })

   ## Anatomogram ----
   output$anatomogram <- renderBscui({
      bscui(svg_txt) |>
         set_bscui_ui_elements(ui_elements) |>
         set_bscui_styles(element_styles) |>
         set_bscui_attributes(element_attributes) |>
         set_bscui_options(
            menu_width="30px",
            # hover_color=list(button="pink", selectable="cyan", none="green"),
            selection_color="red"
         ) |>
         set_bscui_selection(presel);
   })
   anatomogram_proxy <- bscuiProxy("anatomogram")

   ## Organ table ----
   output$organs <- renderReactable({
      isolate(organ_table())|>
         reactable(
            filterable=TRUE,
            columns=list(
               id = colDef(name = "ID"),
               label = colDef(name = "Name"),
               displayed = colDef(
                  name = "Displayed",
                  cell = checkbox_extra("display_org")
               ),
               ui_type = colDef(
                  name = "UI",
                  cell = dropdown_extra(
                     "ui_type",
                     choices = c("selectable", "button", "none")
                  )
               ),
               color = colDef(
                  name = "Color",
                  cell = dropdown_extra(
                     "org_color",
                     choices = names(app_colors)
                  )
               ),
               selection = colDef(
                  name = "Selection",
                  cell = button_extra("sel_org")
               )
            )
         )
   })

   ## Update anatomogram ----
   observe({
      cur_state <- isolate(getReactableState("organs"))
      updateReactable("organs", data=organ_table(), page=cur_state$page)
   })
   observe({
      disp_org <- input$display_org
      req(disp_org)
      req(disp_org$column == "displayed")
      cur_table <- isolate(organ_table())
      id <- cur_table$id[disp_org$row]
      update_bscui_attributes(
         anatomogram_proxy,
         tibble(
            id = id,
            display = ifelse(disp_org$value, "block", "none")
         )
      )
      cur_table <- cur_table |>
         mutate(displayed = ifelse(id==!!id, disp_org$value, displayed))
      organ_table({cur_table})

   })
   observe({
      ui_type <- input$ui_type
      req(ui_type)
      req(ui_type$column == "ui_type")
      cur_table <- isolate(organ_table())
      id <- cur_table$id[ui_type$row]
      update_bscui_ui_elements(
         anatomogram_proxy,
         tibble(
            id = id,
            ui_type = !!ui_type$value
         )
      )
      cur_table <- cur_table |>
         mutate(ui_type = ifelse(id==!!id, !!ui_type$value, ui_type))
      organ_table({cur_table})

   })
   observe({
      org_color <- input$org_color
      req(org_color)
      req(org_color$column == "color")
      cur_table <- isolate(organ_table())
      id <- cur_table$id[org_color$row]
      update_bscui_styles(
         anatomogram_proxy,
         tibble(
            id = id,
            fill = app_colors[[org_color$value]],
            stroke = app_colors[[org_color$value]]
         )
      )
      cur_table <- cur_table |>
         mutate(color = ifelse(id==!!id, !!org_color$value, color))
      organ_table({cur_table})

   })
   observe({
      sel_org <- input$sel_org
      req(sel_org)
      req(sel_org$column == "selection")
      cur_table <- isolate(organ_table())
      id <- cur_table$id[sel_org$row]
      cur_sel <- isolate(input$anatomogram_selected)
      if(id %in% cur_sel){
         new_sel <- setdiff(cur_sel, id)
         new_lab <- "select"
      }else{
         new_sel <- union(cur_sel, id)
         new_lab <- "unselect"
      }
      select_bscui_elements(anatomogram_proxy, new_sel)
      # cur_table <- cur_table |>
      #    mutate(selection = ifelse(id==!!id, new_lab, selection))
      # organ_table({cur_table})

   })
   observe({
      cur_table <- isolate(organ_table())
      req(cur_table)
      cur_sel <- input$anatomogram_selected
      cur_table <- cur_table |>
         mutate(selection = ifelse(id %in% cur_sel, "unselect", "select"))
      organ_table({cur_table})

   })

   ## bscui event outputs ----
   output$selected_org <- renderPrint({
      paste(input$anatomogram_selected, collapse=", ")
   })
   output$hovered_org <- renderPrint({
      input$anatomogram_hovered
   })
   output$operated_org <- renderPrint({
      sprintf(
         "%s click on %s (%s)",
         input$anatomogram_operated$click,
         input$anatomogram_operated$id,
         input$anatomogram_operated$n
      )
   })

   ## Get SVG ----
   output$getSvg <- renderUI({
      req(input$svg_object_name)
      actionButton("getSvg", "Get SVG")
   })
   observeEvent(input$getSvg, {
      get_bscui_svg(anatomogram_proxy)
   })
   observe({
      req(input$svg_object_name)
      svg <- input$anatomogram_svg
      req(svg)
      svg <- read_xml(svg)
      assign(input$svg_object_name, svg, envir=.GlobalEnv)
   })

   ## Interact with anatomogram ----
   output$move_sel <- renderUI({
      selected <- input$anatomogram_selected
      req(selected)
      tagList(
         tags$h3("Move selection"),
         fluidRow(
            column(6, selectInput(
               "move_sel", label=NULL,
               c("front", "back", "forward", "backward")
            )),
            column(6,actionButton("apply_move", "Move!"))
         )
      )
   })
   observeEvent(input$apply_move, {
      order_bscui_elements(
         anatomogram_proxy, input$anatomogram_selected, where=input$move_sel
      )
   })
}

runApp(shinyApp(ui, server))
