@echo off
chcp 65001 >nul
cd /d "%~dp0\.."
python plantillas\generar_xlsx.py --all
echo.
echo Plantillas generadas en plantillas\salida\
pause
