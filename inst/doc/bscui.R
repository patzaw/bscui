## ----setup, message=FALSE, echo=FALSE, include=FALSE, cache=FALSE-------------
library(knitr)
opts_chunk$set(
   include=TRUE,
   echo=TRUE,
   message=TRUE,
   warning=TRUE,
   cache=FALSE,
   cache.lazy=FALSE
)
library(bscui)
library(dplyr)
library(xml2)

## ----class.source='fold-hide'-------------------------------------------------
sessionInfo()

## -----------------------------------------------------------------------------
svg <- xml2::read_xml(system.file(
   "svg-examples", "Animal_cells.svg",
   package="bscui"
))
xml2::xml_ns_strip(svg)
texts <- xml2::xml_find_all(svg, "//text")
for(to_remove in texts){
   xml2::xml_remove(to_remove)
}
bscui(svg)

