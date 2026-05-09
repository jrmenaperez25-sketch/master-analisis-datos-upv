# SouqAuto Maroc

Version final estatica de la miniweb.

La app funciona solo con los archivos de `web/` y ya no necesita:

- carpeta `api`
- carpeta `data`
- backend en `R`

## Archivos que usa de verdad

- `web/index.html`
- `web/app.js`
- `web/model-data.js`
- `web/styles.css`
- `web/serve-local.ps1`

## Uso local

Puedes abrir `web/index.html` directamente.

Si prefieres servirla en local:

```powershell
cd "C:\Proyectos Portfolio\master\Minería de Datos\miniweb-marocars\web"
.\serve-local.ps1
```

Luego abre:

- `http://127.0.0.1:5500`

## Publicacion

Para compartirla, publica directamente el contenido de `web/` en GitHub Pages o en cualquier hosting estatico.
