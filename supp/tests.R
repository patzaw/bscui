library(bscui)
svg <- paste(readLines(system.file(
   "svg-examples", "homo_sapiens.male.svg",
   package="bscui"
)), collapse="\n")
bscui(svg)
