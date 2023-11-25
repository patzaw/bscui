library(bscui)
library(here)

svg <- read_svg_lines(system.file(
   "svg-examples", "homo_sapiens.male.svg",
   package="bscui"
))
bscui(svg)
# bscui(svg, zoom_max=1000, show_menu=FALSE)
# bscui(svg, width="100%", height="91vh")

# toadd <- '<image x="0" y="0" width="50" height="50" xlink:href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg=="/>'
# svg <- sub('<g\n', paste(toadd, '<g\n'), svg)

svg <- read_svg_lines(here("supp/logo/bscui.svg"))
bscui(svg)
