# V2 sin publicaciones — Tablet Android

Alternativa a Power Apps / IIS / publicar en internet.  
**No hace falta publicar ninguna app** en Power Platform ni en un servidor corporativo.

## Cómo funciona

1. Copias la carpeta `app` (o el ZIP) a la tablet.  
2. En la tablet instalas una app gratuita que sirve esa carpeta en local (una sola vez).  
3. Abres Chrome → `http://127.0.0.1:8080` (en la propia tablet).  
4. Rellenas → **Enviar** → se genera el PDF y **compartes** con Outlook/Gmail de la tablet.

- No necesitas el PC encendido.  
- No hay URL que cambie con la Wi‑Fi.  
- No hay macros VBA.  
- No hay “Publicar” en Power Apps.

---

## Qué necesitas (una sola vez)

### En el PC
1. Carpeta del proyecto o el ZIP generado.  
2. Pasar el ZIP a la tablet (USB, OneDrive, correo interno, carpeta compartida…).

### En la tablet Android
1. **Outlook** o **Gmail** instalado (para adjuntar el PDF).  
2. Una app de servidor local, por ejemplo:
   - **Simple HTTP Server** (o similar en Play Store), **o**
   - **Termux** (más técnico).  
3. Chrome.

> Si IT no permite instalar apps de servidor: usa la **Opción B (Excel en OneDrive)** más abajo.

---

## Pasos — Opción A (recomendada): app en la tablet

### A1. Preparar el paquete (en el PC)
Doble clic o ejecuta:

```powershell
.\empaquetar-tablet.ps1
```

Se crea: `dist\RegistrosSala-portable.zip`

### A2. Copiar a la tablet
Copia el ZIP a la tablet y **descomprímelo** (por ejemplo en `Documents/RegistrosSala`).

### A3. Servidor local en la tablet
1. Abre **Simple HTTP Server** (o la app que uséis).  
2. Elige la carpeta descomprimida (`RegistrosSala` / `app`).  
3. Puerto **8080**.  
4. Pulsa Start / Iniciar.  
5. **No cierres** esa app mientras registres.

### A4. Abrir formularios
1. Chrome → `http://127.0.0.1:8080`  
2. Menú `⋮` → **Añadir a pantalla de inicio**.  
3. Elige un registro → rellena → **Enviar**.  
4. En el menú de Android, elige **Outlook** o **Gmail** y envía el PDF adjunto.

### Destinatarios
Los mismos del Excel (editables en **Config** dentro de la app).

---

## Opción B — Sin instalar nada raro: Excel en OneDrive

Si no podéis poner un servidor local en la tablet:

1. Usad los `.xlsx` de `plantillas\salida\` (sin macros).  
2. Guardadlos en **OneDrive / SharePoint**.  
3. En la tablet abridlos con la app **Excel**.  
4. Rellenad y guardad.  
5. Para el correo: o lo enviáis a mano (Exportar PDF desde Excel), o más adelante se enlaza un flujo Automate **sin** Power App (opcional).

Esto tampoco requiere “publicar” una aplicación.

---

## Qué se mantiene respecto al Excel

| Función Excel (VBA) | En esta V2 |
|---------------------|------------|
| Validación / listas | Sí (desplegables y campos) |
| Histórico | Sí (en la tablet, local) |
| Generar PDF | Sí |
| Enviar correo con adjunto | Sí, vía **compartir** a Outlook/Gmail de la tablet |
| Macros | No |

---

## Comparación rápida

| Método | ¿PC siempre? | ¿Publicar app? | Correo automático |
|--------|--------------|----------------|-------------------|
| V1 puente Outlook PC | Sí | No | Sí (Outlook PC) |
| **V2 portable tablet** | No | No | Semi (compartir PDF) |
| Power Apps | No | Sí (publicar) | Sí (Automate) |
| Excel OneDrive | No | No | Manual / Automate opcional |

---

## Si más adelante IT permite APK
Se puede generar un `.apk` instalable por USB (sin Play Store). Hace falta Node.js + Android SDK en un PC de desarrollo. Hasta entonces, el ZIP + servidor local es el camino sin publicaciones.
