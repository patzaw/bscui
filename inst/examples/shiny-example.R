if(interactive()){
   from_shiny <- new.env()
   shiny::runApp(system.file(
      "examples", "shiny-anatomogram", package = "bscui"
   ))
   for(n in names(from_shiny)){
      bscui(from_shiny[[n]]) |> print()
   }
}
