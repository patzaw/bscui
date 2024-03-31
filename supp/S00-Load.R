library(here)

##############################@
## Build js library ----
source(here::here("supp/bscui-js/build-hw_lib.R"))

##############################@
## Build documentation ----
devtools::document(pkg=here::here(), roclets = c('rd', 'collate', 'namespace'))

##############################@
## Install package ----
install.packages(here::here(), repos=NULL)

##############################@
## Vignettes ----
rmarkdown::render(here::here("README.Rmd"))
devtools::build_vignettes(clean=FALSE, quiet=TRUE, install=TRUE)
for(f in list.files(here::here("doc"))){
   file.copy(
      file.path(here::here("doc"), f), file.path(here::here("vignettes"), f),
      overwrite=TRUE
   )
   file.copy(
      file.path(here::here("doc"), f), file.path(here::here("inst/doc"), f),
      overwrite=TRUE
   )
   file.remove(file.path(here::here("doc"), f))
}
file.remove(here::here("doc"))
