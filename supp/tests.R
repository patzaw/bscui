library(bscui)
library(here)
library(xml2)
library(dplyr)
library(magrittr)

svg <- read_svg_lines(system.file(
   "svg-examples", "homo_sapiens.male.svg",
   package="bscui"
))
bscui(svg)
# bscui(svg, zoom_max=1000, show_menu=FALSE)
# bscui(svg, width="100%", height="91vh")
# bscui(svg, show_menu=FALSE, zoom_min=1, zoom_max=1, clip=TRUE) # no view mod

# toadd <- '<image x="0" y="0" width="50" height="50" xlink:href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg=="/>'
# svg <- sub('<g\n', paste(toadd, '<g\n'), svg)

# svg <- read_svg_lines(here("supp/logo/bscui.svg"))
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
         children_titles <- children_titles %>%
            bind_rows(get_element_titles(child))
      }
   }
   toRet <- tibble(id = id, label = label) %>%
      bind_rows(children_titles) %>%
      filter(!is.na(id))
   return(toRet)
}
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
   )
bscui(
   svg %>%
      gsub("<title[^<]*</title>", "", .),
   elements %>%
      filter(
         label %in% c(
            "brain", "heart", "lung",
            "liver", "small_intestine", "stomach", "pancreas"
         )
      ) %>%
      mutate(ui_type = ifelse(label == "brain", "button", "selectable"))
)
