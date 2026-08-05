"""Exporta la zona de cabecera de cada registro como PNG vía Excel COM."""
from __future__ import annotations

import time
from pathlib import Path

import win32com.client  # type: ignore

OUT = Path(r"C:\Users\ACZ\.codex\REGISTROS_DE_SALA\app\assets\headers")
OUT.mkdir(parents=True, exist_ok=True)

# id -> (path, sheet index 1-based or name, export range)
JOBS = [
    (
        "marcas_principal",
        r"k:\Spain\Food Operations\4. Food Plant\Requisitos sala\Nuevos\Registro de marcas propias V2 .xlsm",
        "REGISTRO LÍNEA PRINCIPAL",
        "A1:I7",
    ),
    (
        "marcas_vap",
        r"k:\Spain\Food Operations\4. Food Plant\Requisitos sala\Nuevos\Registro de marcas propias V2 .xlsm",
        "REGISTRO LÍNEA VAP",
        "A1:I7",
    ),
    (
        "detector_metales",
        r"k:\Spain\Food Operations\4. Food Plant\Requisitos sala\Nuevos\comprobación detector de metales.xlsm",
        1,
        "A1:R10",
    ),
    (
        "pales",
        r"k:\Spain\Food Operations\4. Food Plant\Requisitos sala\Nuevos\Supervisión del estado de los palés R2.xlsm",
        1,
        "A1:H8",
    ),
    (
        "lava_utiles",
        r"k:\Spain\Food Operations\4. Food Plant\Requisitos sala\Nuevos\Registro_LavaUtiles.xlsm",
        1,
        "A1:E5",
    ),
    (
        "transporte",
        r"k:\Spain\Food Operations\4. Food Plant\Requisitos sala\Nuevos\Supervisión de la calidad del transporte R4.xlsm",
        1,
        "A1:G8",
    ),
    (
        "cuchillos",
        r"k:\Spain\Food Operations\4. Food Plant\Requisitos sala\Nuevos\Control de cuchillos produccion R3.xlsm",
        1,
        "A1:I9",
    ),
    (
        "cutters",
        r"k:\Spain\Food Operations\4. Food Plant\Requisitos sala\Nuevos\Control de cutters R4.xlsm",
        1,
        "A1:Q10",
    ),
]


def export_range(excel, path: str, sheet, cell_range: str, out_png: Path):
    wb = excel.Workbooks.Open(path, ReadOnly=True)
    try:
        if isinstance(sheet, int):
            ws = wb.Worksheets(sheet)
        else:
            ws = wb.Worksheets(sheet)
        ws.Activate()
        rng = ws.Range(cell_range)
        rng.CopyPicture(Appearance=1, Format=2)  # xlScreen=1, xlBitmap=2
        # paste into temporary chart/sheet via chart export trick
        # Use ChartObject method:
        ws.Paste()
        # After paste, the shape is selected - export via chart
        # Better approach: ExportAsFixedFormat of print area only of those rows - slow.
        # Alternative: use Range.Copy + PowerPoint - heavy.
        # Use Chart:
        chart_obj = ws.ChartObjects().Add(0, 0, rng.Width, rng.Height)
        chart = chart_obj.Chart
        chart.Paste()
        # Chart.Export needs path
        tmp = str(out_png.with_suffix(".tmp.png"))
        chart.Export(tmp)
        chart_obj.Delete()
        # cleanup leftover picture if any
        try:
            for sh in list(ws.Shapes):
                # don't delete workbook shapes permanently on ReadOnly - skip
                pass
        except Exception:
            pass
        Path(tmp).replace(out_png)
        print("OK", out_png.name)
    finally:
        wb.Close(SaveChanges=False)


def main():
    excel = win32com.client.DispatchEx("Excel.Application")
    excel.Visible = False
    excel.DisplayAlerts = False
    try:
        for key, path, sheet, rng in JOBS:
            out = OUT / f"{key}_capture.png"
            try:
                export_range(excel, path, sheet, rng, out)
            except Exception as e:
                print("FAIL", key, e)
    finally:
        excel.Quit()


if __name__ == "__main__":
    main()
