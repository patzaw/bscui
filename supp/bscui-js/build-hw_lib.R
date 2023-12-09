library(here)
library(magrittr)
library(jsonlite)
library(glue)

###############################################################################@
## This script is used to build the javascript bscui minified library
###############################################################################@

###############################################################################@
## Sources ----
js_package <- read_json(here("supp/bscui-js/package.json"))
js_src_dir <- here("supp/bscui-js/src/")
pname <- js_package$name
pversion <- js_package$version

## YAML ----
hw_yaml_file <- here(glue("inst/htmlwidgets/{pname}.yaml"))
hw_yaml <- glue(
   'dependencies:
   - name: {pname}
     version: {pversion}
     src: htmlwidgets/lib/{pname}-{pversion}
     script:
      - {pname}.min.js

')
writeLines(hw_yaml, hw_yaml_file)

###############################################################################@
## htmlwidgets min lib ----
hw_js_path <- here(glue(
   "inst/htmlwidgets/lib/{pname}-{pversion}/{pname}.min.js"
))
dir.create(dirname(hw_js_path), showWarnings=FALSE)
system(glue(
   'uglifyjs {js_src_dir}/*.js --mangle --compress -o {hw_js_path}'
))
