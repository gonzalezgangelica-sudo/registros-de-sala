<#
.SYNOPSIS
  Lanza el registro Marcas Propias para PC y tablet Android en la misma Wi‑Fi/red.
.DESCRIPTION
  Arranca un servidor HTTP en todas las interfaces, muestra la URL local y de red,
  genera un QR (si hay Python + qrcode) y abre el navegador del PC.
#>
param(
  [int]$Port = 8080
)

$ErrorActionPreference = "Stop"
$AppDir = Join-Path $PSScriptRoot "app"

if (-not (Test-Path (Join-Path $AppDir "index.html"))) {
  Write-Error "No se encuentra app\index.html. Ejecuta este script desde la raíz del repo."
}

function Get-LanIPv4 {
  $candidates = Get-NetIPAddress -AddressFamily IPv4 -ErrorAction SilentlyContinue |
    Where-Object {
      $_.IPAddress -notlike "127.*" -and
      $_.IPAddress -notlike "169.254.*" -and
      $_.PrefixOrigin -ne "WellKnown"
    } |
    Sort-Object -Property InterfaceMetric

  if ($candidates) { return $candidates[0].IPAddress }

  # Fallback
  $cfg = Get-NetIPConfiguration | Where-Object { $_.IPv4Address -and $_.NetAdapter.Status -eq "Up" } | Select-Object -First 1
  if ($cfg) { return $cfg.IPv4Address.IPAddress }
  return $null
}

$lanIp = Get-LanIPv4
$localUrl = "http://127.0.0.1:$Port/"
$tabletUrl = if ($lanIp) { "http://${lanIp}:$Port/" } else { $null }

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  Registro Marcas Propias — servidor tablet" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host " PC:     $localUrl"
if ($tabletUrl) {
  Write-Host " Tablet: $tabletUrl" -ForegroundColor Green
  Write-Host ""
  Write-Host " En la tablet (misma Wi‑Fi/red corporativa):" -ForegroundColor Yellow
  Write-Host "  1. Abre Chrome"
  Write-Host "  2. Entra en: $tabletUrl"
  Write-Host "  3. Menu (...) → 'Añadir a la pantalla de inicio'"
  Write-Host "  4. Usa la app en horizontal"
} else {
  Write-Host " No se pudo detectar IP de red. Conecta Wi‑Fi/Ethernet y reintenta." -ForegroundColor Red
}
Write-Host ""
Write-Host " Ctrl+C para detener el servidor." -ForegroundColor DarkGray
Write-Host ""

# QR en consola / PNG si es posible
$qrScript = @"
import sys
url = sys.argv[1]
try:
    import qrcode
    img = qrcode.make(url)
    out = r'$PSScriptRoot\app\assets\qr-tablet.png'
    img.save(out)
    print('QR_PNG=' + out)
    qr = qrcode.QRCode(border=1)
    qr.add_data(url)
    qr.make(fit=True)
    qr.print_ascii(invert=True)
except Exception as e:
    print('QR_SKIP=' + str(e))
"@

if ($tabletUrl) {
  $tmpPy = Join-Path $env:TEMP "rmp_qr.py"
  Set-Content -Path $tmpPy -Value $qrScript -Encoding UTF8
  python $tmpPy $tabletUrl 2>$null
  Remove-Item $tmpPy -ErrorAction SilentlyContinue
}

# Liberar puerto si quedó un servidor previo nuestro (aviso solo)
$busy = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
if ($busy) {
  Write-Host "AVISO: el puerto $Port ya está en uso. Si es el servidor anterior, úsalo o cámbialo con -Port." -ForegroundColor Yellow
  Start-Process $localUrl
  if ($tabletUrl) { Start-Process $tabletUrl }
  return
}

Start-Process $localUrl
python -m http.server $Port --bind 0.0.0.0 --directory $AppDir
