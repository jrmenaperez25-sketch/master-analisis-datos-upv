# SouqAuto Maroc

Miniweb en `HTML/CSS/JS` preparada para publicarse en `GitHub Pages`.

La prediccion funciona de forma totalmente estatica en el navegador:

- estima `Price` con el `Random Forest`
- calcula la probabilidad de `First.Owner` con la regresion logistica
- descarga un PDF con el resultado y los datos introducidos

## Estructura

- `api/train_models.R`: reentrena y guarda los modelos en `models/model_bundle.rds`
- `api/export_browser_models.R`: convierte los modelos entrenados a `web/model-data.json`
- `web/index.html`: interfaz principal
- `web/app.js`: logica del formulario y prediccion en cliente
- `web/model-data.json`: modelo exportado para el navegador
- `web/styles.css`: estilos
- `.github/workflows/miniweb-pages.yml`: publicacion automatica en GitHub Pages

## Dependencias en R

Necesitas tener instalados estos paquetes:

```r
install.packages(c("readxl", "caret", "randomForest", "jsonlite"))
```

## Paso 1. Datos locales

La miniweb usa su propia copia del dataset en:

- `data/datos_imputados_knn.xlsx`

No depende del `.Rmd` ni necesita leer el Excel desde fuera de `miniweb-marocars`.

## Paso 2. Guardar los modelos

Desde la carpeta `miniweb-marocars/api`:

```powershell
& 'C:\Program Files\R\R-4.5.2\bin\Rscript.exe' train_models.R
```

## Paso 3. Exportar los modelos al navegador

Desde la carpeta `miniweb-marocars/api`:

```powershell
& 'C:\Program Files\R\R-4.5.2\bin\Rscript.exe' export_browser_models.R
```

Eso genera:

- `web/model-data.json`

## Paso 4. Probar la web en local

Desde `miniweb-marocars/web`:

```powershell
.\serve-local.ps1
```

Luego abre:

- `http://127.0.0.1:5500`

## Publicacion en GitHub Pages

El repo ya incluye el workflow:

- `.github/workflows/miniweb-pages.yml`

Pasos:

1. Haz `git add .`
2. Haz `git commit -m "Publish SouqAuto Maroc static site"`
3. Haz `git push`
4. En GitHub entra en `Settings -> Pages`
5. En `Source` selecciona `GitHub Actions`

GitHub Pages publica sitios estaticos directamente desde el repositorio, asi que esta version encaja bien sin backend adicional.[GitHub Pages docs](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages)

## Flujo cuando cambies los modelos

Si retocas el entrenamiento:

1. Ejecuta `train_models.R`
2. Ejecuta `export_browser_models.R`
3. Haz `git add`, `git commit` y `git push`
4. GitHub Pages publicara la nueva version

## Notas

- `Brand` y `Model` se piden para mejorar la experiencia y para incluirlos en el PDF, pero no entran en los modelos.
- `Mileage` es el unico campo libre.
- Si el kilometraje supera `700000`, la web muestra un aviso de anomalia.
- Si la marca pertenece al segmento de lujo, la web muestra un aviso de menor fiabilidad.
- `model-data.json` pesa bastante porque incluye los 250 arboles del `Random Forest`.
