suppressPackageStartupMessages({
  library(readxl)
  library(caret)
  library(randomForest)
})

dir.create("models", showWarnings = FALSE, recursive = TRUE)

data_path <- "../data/datos_imputados_knn.xlsx"
if (!file.exists(data_path)) {
  stop("No se encontro ../data/datos_imputados_knn.xlsx")
}

datos <- as.data.frame(read_excel(data_path))

datos$Price <- as.numeric(datos$Price)
datos$Age <- as.numeric(datos$Age)
datos$Mileage_mid <- as.numeric(datos$Mileage_mid)
datos$Fiscal_Power_num <- as.numeric(datos$Fiscal_Power_num)
datos$First.Owner <- as.factor(datos$First.Owner)
datos$Gearbox <- as.factor(datos$Gearbox)
datos$Fuel <- as.factor(datos$Fuel)
datos$Condition <- as.factor(datos$Condition)
datos$Number.of.Doors <- as.factor(datos$Number.of.Doors)
datos$n_extras_total <- datos$n_extras_seguridad + datos$n_extras_tecnologia

formula_cls <- First.Owner ~ Age + Mileage_mid + Fiscal_Power_num +
  Number.of.Doors + n_extras_total + Gearbox + Fuel + Condition

df_train_cls <- datos[!is.na(datos$First.Owner), ]

set.seed(123)
train_idx_cls <- createDataPartition(df_train_cls$First.Owner, p = 0.75, list = FALSE)
train_cls <- df_train_cls[train_idx_cls, ]

mod.logit <- step(
  glm(formula_cls, data = train_cls, family = binomial),
  direction = "backward",
  trace = 0
)

vars_excluir_rf <- c(
  "BrandModel", "Location", "Sector", "First.Owner", "Origin",
  "n_extras_seguridad", "n_extras_tecnologia"
)

datos_reg <- datos[!is.na(datos$Price), ]

set.seed(1)
train_idx_reg <- createDataPartition(datos_reg$Price, p = 0.75, list = FALSE)
train_reg <- datos_reg[train_idx_reg, ]

train_rf <- train_reg[, !names(train_reg) %in% vars_excluir_rf]
n_pred <- ncol(train_rf) - 1
mtry_val <- max(1, floor(n_pred / 3))

set.seed(123)
mod.rf <- randomForest(
  Price ~ .,
  data = train_rf,
  ntree = 250,
  mtry = mtry_val,
  importance = TRUE
)

bundle <- list(
  mod.logit = mod.logit,
  mod.rf = mod.rf,
  levels = list(
    Gearbox = levels(train_cls$Gearbox),
    Fuel = levels(train_cls$Fuel),
    Condition = levels(train_cls$Condition),
    Number.of.Doors = levels(train_cls$Number.of.Doors)
  ),
  age_values = sort(unique(as.integer(na.omit(datos$Age)))),
  fiscal_power_values = sort(unique(as.integer(na.omit(datos$Fiscal_Power_num)))),
  extras_catalog = c(
    "Airbags",
    "ABS",
    "ESP",
    "Central Locking",
    "Electric Windows",
    "CD/MP3/Bluetooth",
    "Alloy Wheels",
    "Air Conditioning",
    "Rear Camera",
    "Leather Seats",
    "Speed Limiter",
    "Cruise Control",
    "Parking Sensors",
    "Onboard Computer",
    "Navigation System/GPS",
    "Sunroof"
  ),
  luxury_brands = c(
    "Aston", "Audi", "BMW", "Bentley", "Cadillac", "Ferrari", "Jaguar",
    "Lamborghini", "Land", "Lexus", "Maserati", "Mercedes-Benz", "Porsche"
  )
)

saveRDS(bundle, file = "models/model_bundle.rds")
cat("Modelos guardados en miniweb-marocars/api/models/model_bundle.rds\n")
