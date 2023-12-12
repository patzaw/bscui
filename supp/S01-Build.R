library(here)

##############################@
## Build js library ----
source(here::here("supp/bscui-js/build-hw_lib.R"))

##############################@
## Build documentation ----
devtools::document(pkg=here::here(), roclets = c('rd', 'collate', 'namespace'))
# install.packages(here::here(), repos=NULL)

##############################@
## Build and copy vignettes ----
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

##############################@
## Build website ----
unlink(here::here("docs"), recursive=TRUE, force=TRUE)
pkgdown::build_site(pkg=here::here())

##############################@
## Build and check package ----
pv <- desc::desc_get_version(here::here())
system(paste(
   sprintf("cd %s", here::here("..")),
   "R CMD build bscui",
   sprintf("R CMD check --as-cran bscui_%s.tar.gz", pv),
   sep=" ; "
))
install.packages(here::here(sprintf("../bscui_%s.tar.gz", pv)), repos=NULL)
