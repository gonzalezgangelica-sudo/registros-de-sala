<#
.SYNOPSIS
  Empaqueta la carpeta app/ en un ZIP listo para copiar a la tablet Android.
#>
$ErrorActionPreference = "Stop"
$Root = $PSScriptRoot
$App = Join-Path $Root "app"
$Dist = Join-Path $Root "dist"
$Zip = Join-Path $Dist "RegistrosSala-portable.zip"

if (-not (Test-Path (Join-Path $App "index.html"))) {
  Write-Error "No se encuentra app\index.html"
}

New-Item -ItemType Directory -Force -Path $Dist | Out-Null
if (Test-Path $Zip) { Remove-Item $Zip -Force }

# Exclude server-only / runtime noise from the portable package
$Temp = Join-Path $env:TEMP ("RegistrosSala_pack_" + [guid]::NewGuid().ToString("N"))
New-Item -ItemType Directory -Force -Path $Temp | Out-Null
try {
  Copy-Item -Path (Join-Path $App "*") -Destination $Temp -Recurse -Force
  Remove-Item (Join-Path $Temp "data") -Recurse -Force -ErrorAction SilentlyContinue
  Remove-Item (Join-Path $Temp "server.py") -Force -ErrorAction SilentlyContinue
  # Keep a short readme inside the zip
  @"
Registros de sala — paquete tablet
=================================
1. Descomprime esta carpeta en la tablet.
2. Abre Simple HTTP Server (u otra app similar).
3. Selecciona ESTA carpeta, puerto 8080, Start.
4. Chrome -> http://127.0.0.1:8080
5. Anadir a pantalla de inicio.
6. Enviar = genera PDF y compartir con Outlook/Gmail.

Mas detalle: V2_SIN_PUBLICAR.md en el proyecto.
"@ | Set-Content -Path (Join-Path $Temp "LEEME.txt") -Encoding UTF8

  Compress-Archive -Path (Join-Path $Temp "*") -DestinationPath $Zip -Force
  Write-Host ""
  Write-Host "OK -> $Zip" -ForegroundColor Green
  Write-Host "Copia ese ZIP a la tablet y sigue V2_SIN_PUBLICAR.md"
  Write-Host ""
}
finally {
  Remove-Item $Temp -Recurse -Force -ErrorAction SilentlyContinue
}
