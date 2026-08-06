#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Genera MANUAL_USUARIO.pdf — instrucciones para planta."""
from pathlib import Path

from fpdf import FPDF

OUT = Path(__file__).resolve().parent / "MANUAL_USUARIO.pdf"
FONT = Path(r"C:\Windows\Fonts\arial.ttf")
FONT_B = Path(r"C:\Windows\Fonts\arialbd.ttf")


class ManualPDF(FPDF):
    def header(self):
        if self.page_no() == 1:
            return
        self.set_x(self.l_margin)
        self.set_font("ArialBody", "B", 9)
        self.set_text_color(80, 80, 80)
        self.cell(0, 8, "Manual de uso - Registros de sala (tablet Android)", align="L", new_x="LMARGIN", new_y="NEXT")
        self.set_draw_color(160, 160, 160)
        y = self.get_y()
        self.line(self.l_margin, y, self.w - self.r_margin, y)
        self.ln(6)

    def footer(self):
        self.set_y(-15)
        self.set_font("ArialBody", size=8)
        self.set_text_color(120, 120, 120)
        self.cell(0, 10, f"Pagina {self.page_no()}/{{nb}}", align="C")


def main():
    pdf = ManualPDF(format="A4")
    pdf.set_margins(18, 16, 18)
    pdf.set_auto_page_break(auto=True, margin=18)
    pdf.alias_nb_pages()
    pdf.add_font("ArialBody", "", str(FONT))
    pdf.add_font("ArialBody", "B", str(FONT_B))
    pdf.add_page()

    def h1(text):
        pdf.ln(4)
        pdf.set_x(pdf.l_margin)
        pdf.set_font("ArialBody", "B", 14)
        pdf.set_text_color(40, 40, 40)
        pdf.multi_cell(0, 8, text, new_x="LMARGIN", new_y="NEXT")
        pdf.ln(1)

    def h2(text):
        pdf.ln(2)
        pdf.set_x(pdf.l_margin)
        pdf.set_font("ArialBody", "B", 12)
        pdf.set_text_color(55, 55, 55)
        pdf.multi_cell(0, 7, text, new_x="LMARGIN", new_y="NEXT")
        pdf.ln(1)

    def p(text):
        pdf.set_x(pdf.l_margin)
        pdf.set_font("ArialBody", size=11)
        pdf.set_text_color(30, 30, 30)
        pdf.multi_cell(0, 6, text, new_x="LMARGIN", new_y="NEXT")
        pdf.ln(1)

    def bullet(text):
        pdf.set_x(pdf.l_margin + 4)
        pdf.set_font("ArialBody", size=11)
        pdf.set_text_color(30, 30, 30)
        pdf.multi_cell(pdf.epw - 4, 6, f"- {text}", new_x="LMARGIN", new_y="NEXT")

    def step(n, text):
        pdf.set_x(pdf.l_margin + 2)
        pdf.set_font("ArialBody", size=11)
        pdf.set_text_color(30, 30, 30)
        pdf.multi_cell(pdf.epw - 2, 6.5, f"{n}. {text}", new_x="LMARGIN", new_y="NEXT")

    def box(text, fill, color):
        pdf.set_x(pdf.l_margin)
        pdf.set_fill_color(*fill)
        pdf.set_font("ArialBody", "B", 10)
        pdf.set_text_color(*color)
        pdf.multi_cell(0, 6, text, fill=True, new_x="LMARGIN", new_y="NEXT")
        pdf.ln(2)

    # Portada
    pdf.set_x(pdf.l_margin)
    pdf.set_font("ArialBody", "B", 20)
    pdf.set_text_color(50, 50, 50)
    pdf.multi_cell(0, 10, "Manual de uso", new_x="LMARGIN", new_y="NEXT")
    pdf.set_font("ArialBody", "B", 15)
    pdf.multi_cell(0, 8, "Registros de sala - Tablet Android", new_x="LMARGIN", new_y="NEXT")
    pdf.ln(2)
    pdf.set_font("ArialBody", size=11)
    pdf.set_text_color(90, 90, 90)
    pdf.multi_cell(
        0,
        6,
        "Guia sencilla para personas de planta. No hace falta saber de ordenadores: "
        "solo seguir los pasos en orden.",
        new_x="LMARGIN",
        new_y="NEXT",
    )

    h1("1. Que es esto")
    p(
        "En la tablet puedes rellenar los mismos registros que antes hacias en Excel. "
        "Cuando pulsas Enviar, se crea un PDF y se manda por correo (como el boton del Excel)."
    )
    p("Registros disponibles:")
    for name in [
        "Marcas propias",
        "Detector de metales",
        "Lava utiles",
        "Calidad del transporte",
        "Estado de los pales",
        "Control de cuchillos",
        "Control de cutters",
    ]:
        bullet(name)

    h1("2. Importante antes de empezar")
    box(
        "IMPORTANTE: Tiene que haber un PC encendido. En ese PC debe estar abierta "
        "la ventana de lanzar-tablet.bat. La tablet y el PC deben estar en la misma "
        "Wi-Fi. En el PC debe estar Outlook configurado (es el que envia el correo).",
        (255, 240, 240),
        (140, 30, 30),
    )
    p("Si el PC esta apagado o la ventana cerrada, la tablet no podra abrir ni enviar.")

    h1("3. Parte 1 - Arrancar en el PC")
    p("Hazlo cada dia o al empezar el turno:")
    step(1, "Enciende el PC.")
    step(2, "Abre Outlook y comprueba que funciona (que puedes ver el correo).")
    step(3, "Busca el archivo llamado: lanzar-tablet.bat")
    step(4, "Haz DOBLE CLIC en ese archivo.")
    step(5, "Se abrira una ventana negra. NO LA CIERRES.")
    step(
        6,
        "En esa ventana veras dos lineas parecidas a:  "
        "PC: http://127.0.0.1:8080/   y   "
        "Tablet: http://192.168.x.x:8080/",
    )
    step(
        7,
        "La linea Tablet: es la direccion que hay que poner en la tablet "
        "(tambien puede salir un codigo QR).",
    )
    box(
        "Nota: Si alguien ya dejo el PC arrancado con esa ventana abierta, "
        "puedes saltarte esta parte.",
        (245, 245, 235),
        (60, 60, 40),
    )

    h1("4. Parte 2 - Abrir en la tablet (primera vez)")
    step(1, "Enciende la tablet.")
    step(2, "Conectala a la MISMA Wi-Fi que el PC.")
    step(3, "Abre Chrome (el navegador de Google).")
    step(
        4,
        "Arriba, en la barra de direccion, escribe exactamente la URL Tablet: "
        "que salio en el PC. Ejemplo: http://192.168.1.45:8080/",
    )
    step(5, "Pulsa Intro / Ir.")
    step(6, "Debe aparecer la pantalla Registros de sala con los 7 registros.")
    step(
        7,
        "Arriba deberia verse en verde algo como: "
        "Outlook PC: listo (envio con adjunto).",
    )

    h2("Dejarlo como app en la tablet (recomendado)")
    step(1, "En Chrome, pulsa los tres puntitos (arriba a la derecha).")
    step(2, "Elige Anadir a la pantalla de inicio (o Instalar aplicacion).")
    step(3, "Confirma.")
    step(4, "En la pantalla de inicio de la tablet te saldra un icono.")
    step(
        5,
        "A partir de entonces, abre por ese icono "
        "(sigue haciendo falta el PC encendido).",
    )

    h1("5. Parte 3 - Rellenar y enviar un registro")
    step(1, "Abre la app / la pagina en la tablet.")
    step(2, "Elige el registro que toque (por ejemplo, Detector de metales).")
    step(3, "Rellena los campos (fechas, desplegables, textos...).")
    step(4, "Si quieres guardar sin enviar: pulsa Guardar borrador.")
    step(5, "Cuando este completo: pulsa Enviar.")
    step(6, "Confirma en el aviso.")
    step(7, "Espera a que diga que se ha enviado.")
    step(
        8,
        "El formulario se limpia (como en el Excel) y el correo sale "
        "desde Outlook del PC con el PDF adjunto.",
    )

    h2("Si sale error al enviar")
    bullet("Mira que el PC sigue con la ventana negra abierta.")
    bullet("Mira que Outlook funciona en el PC.")
    bullet("Mira que arriba pone Outlook PC: listo.")
    bullet("Prueba otra vez.")

    h1("6. Parte 4 - Historico")
    p(
        "En la pestana Historico puedes ver los envios hechos: fecha, registro, "
        "si se envio bien, etc."
    )

    h1("7. Que NO hay que hacer")
    bullet("No cierres la ventana negra del PC mientras se use la tablet.")
    bullet("No apagues el PC a mitad del turno si alguien esta registrando.")
    bullet("No uses otra Wi-Fi distinta a la del PC.")
    bullet(
        "No uses de memoria la URL de ayer: el numero (192.168...) puede cambiar. "
        "Usa siempre la que salga al lanzar el .bat."
    )

    h1("8. Problemas frecuentes")

    h2("No carga la pagina en la tablet")
    step(1, "El PC esta encendido?")
    step(2, "Esta abierta lanzar-tablet.bat?")
    step(3, "Tablet y PC en la misma Wi-Fi?")
    step(4, "Has escrito bien la URL Tablet: (con http:// y :8080)?")
    step(5, "Vuelve a lanzar el .bat y usa la URL nueva.")

    h2("Outlook PC: no listo / no envia el correo")
    step(1, "Abre Outlook en el PC.")
    step(2, "Cierra la ventana negra y vuelve a abrir lanzar-tablet.bat.")
    step(3, "Prueba Enviar otra vez.")

    h2("La URL de ayer ya no funciona")
    p(
        "Es normal. La IP puede cambiar. Vuelve a lanzar el .bat y usa "
        "la URL Tablet: de hoy."
    )

    h2("He perdido lo que escribi")
    p(
        "Si pulsaste Guardar borrador, al volver a abrir ese registro deberia seguir. "
        "Si enviaste o limpiaste, se borra (igual que en el Excel)."
    )

    h1("9. Resumen rapido (chuleta)")
    bullet("PC: Doble clic en lanzar-tablet.bat y dejar la ventana abierta.")
    bullet("PC: Outlook abierto / funcionando.")
    bullet("Tablet: Misma Wi-Fi que el PC.")
    bullet("Tablet: Abrir la URL Tablet: o el icono de la pantalla de inicio.")
    bullet("Tablet: Elegir registro -> rellenar -> Enviar.")

    h1("10. Si necesitas ayuda")
    p(
        "Si algo no funciona y has revisado esta lista, avisa a la persona que "
        "gestiona el PC de planta / calidad e indica:"
    )
    step(1, "Que registro estabas usando.")
    step(2, "Que mensaje de error salia.")
    step(3, "Si el indicador de Outlook estaba en verde o en rojo.")

    pdf.ln(8)
    pdf.set_x(pdf.l_margin)
    pdf.set_font("ArialBody", size=9)
    pdf.set_text_color(110, 110, 110)
    pdf.multi_cell(
        0,
        5,
        "Documento para uso en planta - Registros de sala (tablet Android).",
        new_x="LMARGIN",
        new_y="NEXT",
    )

    pdf.output(str(OUT))
    print(f"OK -> {OUT}")
    print(f"Size: {OUT.stat().st_size} bytes")


if __name__ == "__main__":
    main()
