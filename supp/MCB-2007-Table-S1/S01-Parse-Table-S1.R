library(readxl)
library(here)
library(dplyr)
library(readr)

## Taken from [Godard et al. 2007](https://doi.org/10.1128/MCB.01084-06):
## Table S1 Table-S1.xls: List of 506 genes displaying significant variation of
## expression in at least one tested nitrogen condition
f <- here("supp/MCB-2007-Table-S1/Table-S1.xls")
cn <- read_xls(
   f,
   n_max=2, col_names=FALSE
)
cn <- lapply(cn, function(x) paste(setdiff(x, NA), collapse=" "))
gt <- read_xls(f, skip=2, col_names=FALSE)
colnames(gt) <- cn

gt <- gt |>
   mutate_at(grep(" [MP]", colnames(gt), value=TRUE), as.numeric) |>
   rename("ALANINE P-VALUE" = "P-VALUE") |>
   select(-all_of(c(
      "ID", "ALIAS", "DESCRIPTION", "GO-PROCESS", "GO-FUNCTION", "GO-COMPONENT"
   )))

write_tsv(
   gt,
   file=here("inst/examples/DEG-by-nitrogen-source_MCB-Godard-2007.txt.gz")
)
