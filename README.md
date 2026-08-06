# Registros de sala (tablet Android)

**Manual usuarios:** [`MANUAL_USUARIO.md`](MANUAL_USUARIO.md) · PDF: [`MANUAL_USUARIO.pdf`](MANUAL_USUARIO.pdf)

## V2 sin publicaciones (recomendado si no quieres Power Apps / servidor)

Ver **[`V2_SIN_PUBLICAR.md`](V2_SIN_PUBLICAR.md)**.

```powershell
.\empaquetar-tablet.ps1
```

Copia `dist\RegistrosSala-portable.zip` a la tablet → servidor local → Chrome → Enviar (compartir PDF).

## V1 — Puente Outlook en el PC (envío automático)

Doble clic en **`lanzar-tablet.bat`**. La tablet usa la URL de red del PC.

Un **hub** con los **7 registros**. Sin macros VBA.

## Cómo funciona el envío

1. En el **PC** (con Outlook instalado) lanzas el servidor.
2. En la **tablet** abres la URL del PC (misma red).
3. Rellenas un registro → **Enviar**.
4. El PC genera/recibe el PDF y Outlook lo envía **con el archivo adjunto**.

Sin el servidor del PC, la tablet puede compartir/descargar el PDF (fallback).

## Lanzar

Doble clic en **`lanzar-tablet.bat`** (o `.\lanzar-tablet.ps1`).

- PC: `http://127.0.0.1:8080/`
- Tablet: `http://<IP-del-PC>:8080/`

El indicador verde **Outlook PC: listo** confirma el puente.

## Registros incluidos

| Registro | Origen Excel |
|----------|----------------|
| Marcas propias / Protocolo 1 | `Registro de marcas propias V2.xlsm` |
| Detector de metales | `comprobación detector de metales.xlsm` |
| Lava útiles | `Registro_LavaUtiles.xlsm` |
| Calidad del transporte | `Supervisión de la calidad del transporte R4.xlsm` |
| Estado de los palés | `Supervisión del estado de los palés R2.xlsm` |
| Control de cuchillos | `Control de cuchillos produccion R3.xlsm` |
| Control de cutters | `Control de cutters R4.xlsm` |

## Carpetas

```
app/                 Hub web + server.py (puente Outlook)
plantillas/          Generador .xlsx opcional (sin botón mail)
lanzar-tablet.bat
lanzar-tablet.ps1
```

## Requisitos PC

- Python 3
- Outlook de escritorio configurado
- `pywin32` (`pip install pywin32`)
