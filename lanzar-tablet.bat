@echo off
chcp 65001 >nul
title Registro Marcas Propias - Tablet
cd /d "%~dp0"

echo.
echo ============================================
echo   Registro Marcas Propias — servidor tablet
echo ============================================
echo.

where python >nul 2>&1
if errorlevel 1 (
  echo ERROR: No se encuentra Python en el PATH.
  echo Instala Python o usa lanzar-tablet.ps1
  pause
  exit /b 1
)

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0lanzar-tablet.ps1" %*
if errorlevel 1 (
  echo.
  echo El servidor se detuvo o hubo un error.
  pause
)
