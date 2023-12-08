library(bscui)
library(xml2)
library(dplyr)
library(stringr)

svg <- read_xml(system.file(
   "svg-examples", "homo_sapiens.male.svg",
   package="bscui"
))
svg |>
   as.character() |>
   bscui()
# bscui(svg, zoom_max=1000, show_menu=FALSE)
# bscui(svg, width="100%", height="91vh")
# bscui(svg, show_menu=FALSE, zoom_min=1, zoom_max=1, clip=TRUE) # no view mod

# image <- read_xml(
#    '<image x="0" y="0" width="50" height="50" xlink:href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg=="/>'
# )
# children <- xml_children(svg)
# xml_add_sibling(children[[1]], image, where = "before")
# # xml_add_sibling(children[[length(children)]], image, where = "after")
# bscui(svg)

# svg <- read_xml(here::here("supp/logo/bscui.svg"))
# bscui(svg)



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
         children_titles <- children_titles |>
            bind_rows(get_element_titles(child))
      }
   }
   toRet <- tibble(id = id, label = label)  |>
      bind_rows(children_titles) |>
      filter(!is.na(id))
   return(toRet)
}
elements <- get_element_titles(svg) |>
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
      ui_type = ifelse(label == "brain", "button", ui_type)
   ) |>
   select(id, ui_type, title)
element_styles <- elements |>
   mutate(
      visibility = ifelse(label %in% elements_to_show, "visible", "hidden"),
      title = ifelse(label == "brain", NA, title)
   ) |>
   select(-ui_type, -title, -label)

## Remove title elements
xml_ns_strip(svg)
titles <- xml_find_all(svg, "//title")
for(to_remove in titles){
   xml_remove(to_remove)
}

bscui(
   svg = svg |> as.character(),
   ui_elements = ui_elements,
   element_styles = element_styles
) |>
   print()
