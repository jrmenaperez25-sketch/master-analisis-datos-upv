@echo off
setlocal

cd /d "%~dp0"

for /f %%i in ('powershell -NoProfile -Command "Get-Date -Format ''yyyy-MM-dd HH:mm:ss''"') do set FECHA=%%i
set COMMIT_MSG=Actualizacion automatica %FECHA%

echo Repositorio actual:
git status --short --branch
echo.

echo Agregando cambios...
git add -A
if errorlevel 1 goto :error

echo.
echo Creando commit automatico...
git commit -m "%COMMIT_MSG%"
if errorlevel 1 goto :error

echo.
echo Subiendo cambios a GitHub...
git push origin master
if errorlevel 1 goto :error

echo.
echo Todo actualizado correctamente con el mensaje:
echo %COMMIT_MSG%
pause
exit /b 0

:error
echo.
echo No se pudo completar la actualizacion.
echo Si no habia cambios, Git puede haber detenido el commit de forma normal.
pause
exit /b 1
