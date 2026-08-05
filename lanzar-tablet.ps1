<#
.SYNOPSIS
  Lanza el hub de registros para tablet con puente Outlook (PDF adjunto).
#>
param([int]$Port = 8080)

$ErrorActionPreference = "Stop"
$Root = $PSScriptRoot
$AppDir = Join-Path $Root "app"
$Server = Join-Path $AppDir "server.py"

if (-not (Test-Path $Server)) {
  Write-Error "No se encuentra app\server.py"
}

function Get-LanIPv4 {
  $candidates = Get-NetIPAddress -AddressFamily IPv4 -ErrorAction SilentlyContinue |
    Where-Object {
      $_.IPAddress -notlike "127.*" -and
      $_.IPAddress -notlike "169.254.*"
    } | Sort-Object InterfaceMetric
  if ($candidates) { return $candidates[0].IPAddress }
  return $null
}

$lanIp = Get-LanIPv4
Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  Registros de sala — tablet + Outlook PC" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host " PC:     http://127.0.0.1:$Port/"
if ($lanIp) {
  Write-Host " Tablet: http://${lanIp}:$Port/" -ForegroundColor Green
  Write-Host ""
  Write-Host " En la tablet: Chrome -> URL -> Anadir a inicio" -ForegroundColor Yellow
  Write-Host " Enviar = PDF adjunto por Outlook de ESTE PC" -ForegroundColor Yellow
}
Write-Host ""
Write-Host " Ctrl+C para detener." -ForegroundColor DarkGray
Write-Host ""

# QR si es posible
if ($lanIp) {
  $url = "http://${lanIp}:$Port/"
  python -c "import sys; u=sys.argv[1]
try:
 import qrcode
 qr=qrcode.QRCode(border=1); qr.add_data(u); qr.make(fit=True); qr.print_ascii(invert=True)
 img=qrcode.make(u); img.save(r'$AppDir\assets\qr-tablet.png')
except Exception as e:
 print('QR skip:', e)
" $url 2>$null
}

$busy = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
if ($busy) {
  Write-Host "AVISO: puerto $Port en uso. Abriendo navegador sobre el servidor actual." -ForegroundColor Yellow
  Start-Process "http://127.0.0.1:$Port/"
  return
}

Start-Process "http://127.0.0.1:$Port/"
python $Server --port $Port
