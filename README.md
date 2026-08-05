# Registros de sala — Marcas propias (tablet)

App web (PWA) equivalente al Excel `Registro de marcas propias V2.xlsm`, pensada para **tablet Android** (Chrome), con el mismo estilo de formulario Stolt.

## Qué incluye

- **Línea principal** y **Línea VAP** (rejilla 8 columnas, mismos campos)
- Cabecera / pie de notas del Excel
- Desplegables (hoja LISTAS) editables en la app
- Config de correo (hoja CONFIG)
- Botón **Enviar**: genera PDF → compartir/descargar → abre correo → limpia formulario → histórico
- Funciona offline tras la primera carga (service worker)

## Cómo lanzar (PC + tablet)

### Opción A — Script (recomendado)

En PowerShell, desde la raíz del repo:

```powershell
.\lanzar-tablet.ps1
```

Muestra la URL del PC, la URL de red para la tablet y un QR. Mantén esa ventana abierta.

En la tablet (misma Wi‑Fi/red): abre Chrome → URL o QR → menú → **Añadir a la pantalla de inicio**.

### Opción B — Servidor manual

```powershell
cd app
python -m http.server 8080 --bind 0.0.0.0
```

PC: `http://localhost:8080` · Tablet: `http://<IP-del-PC>:8080`

> En Android no hay Outlook VBA: el PDF se genera en la tablet y se adjunta/comparte desde el cliente de correo instalado.

## Estructura

```
app/
  index.html
  styles.css
  app.js
  data.js
  manifest.json
  sw.js
  assets/     # cabeceras, pie, iconos
  vendor/     # html2canvas + jspdf (offline)
```

## Nota

Los borradores, listas, config e histórico se guardan en **localStorage de la tablet**. No sustituye todavía el guardado en `K:\...\Registros` ni el envío automático de Outlook de escritorio.
