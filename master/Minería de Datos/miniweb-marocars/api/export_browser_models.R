suppressPackageStartupMessages({
  library(jsonlite)
  library(randomForest)
  library(readxl)
})

bundle_path <- "models/model_bundle.rds"
data_path <- "../data/datos_imputados_knn.xlsx"
output_path <- "../web/model-data.json"

if (!file.exists(bundle_path)) {
  stop("No se encontro models/model_bundle.rds")
}

if (!file.exists(data_path)) {
  stop("No se encontro ../data/datos_imputados_knn.xlsx")
}

bundle <- readRDS(bundle_path)
raw_data <- as.data.frame(read_excel(data_path))

raw_data$BrandModel <- as.character(raw_data$BrandModel)

split_brand_model <- function(values) {
  out <- list()
  for (value in sort(unique(na.omit(values)))) {
    parts <- strsplit(value, " ", fixed = TRUE)[[1]]
    brand <- parts[1]
    model <- if (length(parts) > 1) paste(parts[-1], collapse = " ") else parts[1]
    current <- out[[brand]]
    if (is.null(current)) {
      current <- character(0)
    }
    out[[brand]] <- sort(unique(c(current, model)))
  }
  out[sort(names(out))]
}

serialize_tree <- function(rf_model, k) {
  tree <- getTree(rf_model, k = k, labelVar = FALSE)
  list(
    left = as.integer(tree[, "left daughter"]),
    right = as.integer(tree[, "right daughter"]),
    split_var = as.integer(tree[, "split var"]),
    split_point = as.numeric(tree[, "split point"]),
    status = as.integer(tree[, "status"]),
    prediction = as.numeric(tree[, "prediction"])
  )
}

rf_feature_order <- attr(bundle$mod.rf$terms, "term.labels")
rf_xlevels <- bundle$mod.rf$forest$xlevels

rf_model <- list(
  feature_order = rf_feature_order,
  ncat = as.list(as.integer(bundle$mod.rf$forest$ncat)),
  xlevels = lapply(rf_xlevels, function(x) as.list(x)),
  trees = lapply(seq_len(bundle$mod.rf$ntree), function(i) serialize_tree(bundle$mod.rf, i))
)

payload <- list(
  metadata = list(
    age_values = as.list(bundle$age_values),
    fiscal_power_values = as.list(bundle$fiscal_power_values),
    gearbox_values = as.list(bundle$levels$Gearbox),
    fuel_values = as.list(bundle$levels$Fuel),
    condition_values = as.list(bundle$levels$Condition),
    door_values = as.list(bundle$levels$Number.of.Doors),
    first_owner_labels = list(yes = "Si", no = "No"),
    extras = as.list(bundle$extras_catalog),
    brand_model_map = split_brand_model(raw_data$BrandModel),
    luxury_brands = as.list(bundle$luxury_brands)
  ),
  logistic_model = list(
    coefficients = as.list(unname(coef(bundle$mod.logit))),
    coefficient_names = as.list(names(coef(bundle$mod.logit))),
    xlevels = lapply(bundle$mod.logit$xlevels, function(x) as.list(x))
  ),
  random_forest_model = rf_model
)

write_json(payload, output_path, auto_unbox = TRUE, digits = 12)
cat("Modelo de navegador exportado en", output_path, "\n")
