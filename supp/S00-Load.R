library(here)

##############################@
## Build js library ----
source(here::here("supp/bscui-js/build-hw_lib.R"))

##############################@
## Build documentation ----
devtools::document(pkg=here::here(), roclets = c('rd', 'collate', 'namespace'))
install.packages(here::here(), repos=NULL)
