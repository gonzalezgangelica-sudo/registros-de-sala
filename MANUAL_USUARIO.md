# Manual de uso — Registros de sala (tablet Android)

Guía sencilla para usar los registros de calidad en la tablet.  
No hace falta saber de ordenadores: solo seguir los pasos.

---

## Qué es esto

En la tablet puedes rellenar los mismos registros que antes hacías en Excel:

1. Marcas propias  
2. Detector de metales  
3. Lava útiles  
4. Calidad del transporte  
5. Estado de los palés  
6. Control de cuchillos  
7. Control de cutters  

Cuando pulsas **Enviar**, se crea un PDF y se manda por correo (como el botón del Excel).

---

## Importante antes de empezar

- Tiene que haber un **PC encendido** en la planta (o en la oficina).  
- En ese PC debe estar abierta la ventana negra de **lanzar-tablet** (el “servidor”).  
- La tablet y el PC deben estar en la **misma Wi‑Fi / red**.  
- En el PC debe estar **Outlook** configurado (es el que envía el correo).

Si el PC está apagado o la ventana cerrada, **la tablet no podrá abrir ni enviar**.

---

## Parte 1 — Arrancar en el PC (hacerlo cada día o al empezar el turno)

1. Enciende el PC.  
2. Abre Outlook y comprueba que funciona (que puedes ver el correo).  
3. Busca en el escritorio o en la carpeta del proyecto el archivo:

   **`lanzar-tablet.bat`**

4. Haz **doble clic** en ese archivo.  
5. Se abrirá una ventana negra. **No la cierres.**  
6. En esa ventana verás algo parecido a:

   - `PC:     http://127.0.0.1:8080/`  
   - `Tablet: http://192.168.x.x:8080/`  

7. La línea **Tablet:** es la dirección que hay que poner en la tablet.  
   (También puede salir un código QR.)

> Si alguien ya dejó el PC arrancado con esa ventana abierta, puedes saltar esta parte.

---

## Parte 2 — Abrir en la tablet (la primera vez)

1. Enciende la tablet.  
2. Conéctala a la **misma Wi‑Fi** que el PC.  
3. Abre **Chrome** (el navegador de Google).  
4. Arriba, en la barra de dirección, escribe exactamente la URL **Tablet:** que salió en el PC.  
   Ejemplo: `http://192.168.1.45:8080/`  
5. Pulsa Intro / Ir.  
6. Debe aparecer la pantalla **Registros de sala** con los 7 registros.  
7. Arriba debería verse en verde algo como:  
   **Outlook PC: listo (envío con adjunto)**  

### Dejarlo como “app” en la tablet (recomendado)

1. En Chrome, pulsa los **tres puntitos** `⋮` (arriba a la derecha).  
2. Elige **Añadir a la pantalla de inicio** (o “Instalar aplicación”).  
3. Confirma.  
4. En la pantalla de inicio de la tablet te saldrá un icono.  
5. A partir de entonces, abre por ese icono (sigue haciendo falta el PC encendido).

---

## Parte 3 — Rellenar y enviar un registro

1. Abre la app / la página en la tablet.  
2. Elige el registro que toque (por ejemplo, **Detector de metales**).  
3. Rellena los campos (fechas, desplegables, textos…).  
4. Si quieres guardar sin enviar: pulsa **Guardar borrador**.  
5. Cuando esté completo: pulsa **Enviar**.  
6. Confirma en el aviso.  
7. Espera a que diga que se ha enviado.  
8. El formulario se limpia (como en el Excel) y el correo sale desde Outlook del PC.

### Si sale error al enviar

- Mira que el PC sigue con la ventana negra abierta.  
- Mira que Outlook funciona en el PC.  
- Mira que arriba pone **Outlook PC: listo**.  
- Prueba otra vez.

---

## Parte 4 — Histórico

En la pantalla principal (o pestaña **Histórico**) puedes ver los envíos hechos: fecha, registro, si se envió bien, etc.

---

## Qué NO hay que hacer

- No cierres la ventana negra del PC mientras se use la tablet.  
- No apagues el PC a mitad del turno si alguien está registrando.  
- No uses otra Wi‑Fi distinta a la del PC.  
- No cambies la URL “de memoria”: cada día puede cambiar el número (`192.168…`). Usa la que salga al lanzar el `.bat`.

---

## Problemas frecuentes

### “No carga la página en la tablet”
1. ¿El PC está encendido?  
2. ¿Está abierta `lanzar-tablet.bat`?  
3. ¿Tablet y PC en la misma Wi‑Fi?  
4. ¿Has escrito bien la URL de **Tablet:** (con `http://` y el puerto `:8080`)?  
5. Vuelve a lanzar el `.bat` y usa la URL nueva.

### “Outlook PC: no listo” / no envía el correo
1. Abre Outlook en el PC.  
2. Cierra la ventana negra y vuelve a abrir `lanzar-tablet.bat`.  
3. Prueba Enviar otra vez.

### “La URL de ayer ya no funciona”
Es normal. La IP puede cambiar.  
Vuelve a lanzar el `.bat` y usa la URL **Tablet:** de hoy.

### “He perdido lo que escribí”
Si pulsaste **Guardar borrador**, al volver a abrir ese registro debería seguir.  
Si enviaste o limpiaste, se borra (igual que en el Excel).

---

## Resumen rápido (chuleta)

| Quién | Qué hacer |
|--------|-----------|
| PC | Doble clic en `lanzar-tablet.bat` y dejar la ventana abierta |
| PC | Outlook abierto / funcionando |
| Tablet | Misma Wi‑Fi que el PC |
| Tablet | Abrir la URL **Tablet:** o el icono de la pantalla de inicio |
| Tablet | Elegir registro → rellenar → **Enviar** |

---

## Contacto / ayuda

Si algo no funciona y has revisado esta lista, avisa a la persona que gestiona el PC de planta / calidad (o a quien instaló este sistema) indicando:

1. Qué registro estabas usando  
2. Qué mensaje de error salía  
3. Si el indicador de Outlook estaba en verde o en rojo  

---

*Documento para uso en planta — Registros de sala (tablet Android).*
