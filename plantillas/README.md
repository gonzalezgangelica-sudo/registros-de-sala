# Plantillas Excel (sin app) — hasta 7 registros

Formato recomendado cuando hay **varios registros distintos**: un `.xlsx` por registro, **sin macros**, usable en **Excel Android**.

## Por qué este formato

| | App PWA | Plantilla Excel |
|--|---------|-----------------|
| 7 registros distintos | 7 pantallas / mucha lógica | 7 JSON → 7 `.xlsx` |
| Tablet Android | Chrome / PWA | App Excel |
| Mantenimiento | Código | Editar JSON y regenerar |
| Macros / Outlook | No (compartir PDF) | No (guardar / exportar PDF) |

## Uso rápido

1. Edita o crea un JSON en `definiciones/` (copia `_ejemplo_registro_2.json`).
2. Genera los Excel:

```powershell
python plantillas\generar_xlsx.py --all
```

O doble clic en `generar.bat`.

3. Abre el archivo de `salida\` en la tablet con **Excel**.
4. Rellena → Guarda en OneDrive/SharePoint (o Exportar PDF).

## Cómo añadir el registro 2…7

1. Copia `definiciones/_ejemplo_registro_2.json` → `02_nombre.json`
2. Cambia: `id`, `nombre`, `codigo`, `listas`, `hojas` / `campos`
3. Ejecuta el generador
4. Distribuye el `.xlsx` de `salida\`

Campos soportados:

- `"type": "text"` — texto libre  
- `"type": "date"` — fecha  
- `"type": "select"` + `"list": "nombreLista"` — desplegable  

`"highlight": true` pinta la etiqueta en amarillo (como TIPO ETIQUETA).

## Archivos

```
plantillas/
  definiciones/          ← define cada registro (JSON)
  salida/                ← .xlsx generados (para la tablet)
  generar_xlsx.py
  generar.bat
```
