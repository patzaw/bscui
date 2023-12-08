library(bscui)
library(xml2)
library(dplyr)
library(stringr)
library(glue)
library(readr)

svg <- read_xml(system.file(
   "svg-examples", "Epithelial_cells.svg",
   package="bscui"
))
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

## Remove text elements
xml_ns_strip(svg)
texts <- xml_find_all(svg, "//text")
for(to_remove in texts){
   xml_remove(to_remove)
}

svg |> as.character() |>
   bscui(ui_elements=ui_elements, hover_color=list(selectable="yellow", button="red")) |>
   print()
