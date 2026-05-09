# SouqAuto Maroc

Miniweb en `HTML/CSS/JS` con backend en `R` para:

- estimar `Price` con el `Random Forest`
- calcular la probabilidad de `First.Owner` con la regresion logistica
- descargar un PDF con el resultado y los datos introducidos

## Estructura

- `api/train_models.R`: reentrena y guarda los modelos en `models/model_bundle.rds`
- `api/plumber.R`: expone la API con `/metadata`, `/predict` y `/health`
- `web/index.html`: interfaz principal
- `web/app.js`: logica del formulario, peticiones y PDF
- `web/styles.css`: estilos

## Dependencias en R

Necesitas tener instalados estos paquetes:

```r
install.packages(c("readxl", "caret", "randomForest", "plumber"))
```

## Paso 1. Datos locales

La miniweb usa su propia copia del dataset en:

- `data/datos_imputados_knn.xlsx`

No depende del `.Rmd` ni necesita leer el Excel desde fuera de `miniweb-marocars`.

## Paso 2. Guardar los modelos

Desde la carpeta `miniweb-marocars/api`:

```powershell
Rscript train_models.R
```

Si `Rscript` no esta en el PATH, puedes abrir R y ejecutar:

```r
setwd("C:/Users/joser/OneDrive/Desktop/Proyecto Final Minería de Datos/miniweb-marocars/api")
source("train_models.R")
```

## Paso 3. Levantar la API

Desde `miniweb-marocars/api`:

```powershell
Rscript -e "pr <- plumber::plumb('plumber.R'); pr$run(host='127.0.0.1', port=8000)"
```

O desde una sesion de R:

```r
setwd("C:/Users/joser/OneDrive/Desktop/Proyecto Final Minería de Datos/miniweb-marocars/api")
pr <- plumber::plumb("plumber.R")
pr$run(host = "127.0.0.1", port = 8000)
```

## Paso 4. Abrir la miniweb

Abre `web/index.html` en el navegador.

Si prefieres servirla localmente:

```powershell
cd "C:\Users\joser\OneDrive\Desktop\Proyecto Final Minería de Datos\miniweb-marocars\web"
python -m http.server 5500
```

Luego entra en `http://127.0.0.1:5500`.

## Notas del comportamiento

- `Brand` y `Model` se piden para mejorar la experiencia y para incluirlos en el PDF, pero no entran en los modelos.
- `Mileage` es el unico campo libre.
- Si el kilometraje supera `700000`, la web muestra un aviso de anomalia.
- Si la marca pertenece al segmento de lujo, la web muestra un aviso de menor fiabilidad.
