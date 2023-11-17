library(bscui)
svg <- paste(readLines(system.file(
   "svg-examples", "homo_sapiens.male.svg",
   package="bscui"
)), collapse="\n")
bscui(svg)

# toadd <- '<image x="0" y="0" width="50" height="50" xlink:href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg=="/>'
# svg <- sub('<g\n', paste(toadd, '<g\n'), svg)
