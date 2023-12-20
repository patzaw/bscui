library(bscui)
library(xml2)
library(dplyr)
library(stringr)

svg <- read_xml(system.file(
   "examples", "homo_sapiens.female.svg.gz",
   package="bscui"
))
bscui(svg) |>
   print()

## Add an image
image <- read_xml(
   '<image x="0" y="0" width="50" height="50" xlink:href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg=="/>'
)
children <- xml_children(svg)
xml_add_sibling(children[[1]], image, where = "before")
# xml_add_sibling(children[[length(children)]], image, where = "after")
bscui(svg) |>
   print()
