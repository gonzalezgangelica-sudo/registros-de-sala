"""Captura visual exacta de la cabecera de cada Excel (CopyPicture + clipboard)."""
from __future__ import annotations

import time
from pathlib import Path

import win32com.client  # type: ignore
from PIL import ImageGrab

OUT = Path(r"C:\Users\ACZ\.codex\REGISTROS_DE_SALA\app\assets\headers")
OUT.mkdir(parents=True, exist_ok=True)

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


def capture(excel, path, sheet, cell_range, out_png: Path):
    wb = excel.Workbooks.Open(Filename=str(path), ReadOnly=True, UpdateLinks=0)
    try:
        ws = wb.Worksheets(sheet)
        ws.Activate()
        rng = ws.Range(cell_range)
        # xlScreen=1, xlBitmap=2
        rng.CopyPicture(Appearance=1, Format=2)
        time.sleep(0.35)
        img = ImageGrab.grabclipboard()
        if img is None:
            # retry with xlPicture
            rng.CopyPicture(Appearance=1, Format=1)  # xlPicture
            time.sleep(0.35)
            img = ImageGrab.grabclipboard()
        if img is None:
            raise RuntimeError("Clipboard vacío tras CopyPicture")
        img.convert("RGB").save(out_png, "PNG")
        print(f"OK {out_png.name} {img.size}")
    finally:
        wb.Close(SaveChanges=False)


def main():
    excel = win32com.client.dynamic.Dispatch("Excel.Application")
    excel.Visible = False
    excel.DisplayAlerts = False
    try:
        excel.ScreenUpdating = False
    except Exception:
        pass
    try:
        for key, path, sheet, rng in JOBS:
            out = OUT / f"{key}.png"
            try:
                capture(excel, path, sheet, rng, out)
            except Exception as e:
                print(f"FAIL {key}: {e}")
    finally:
        excel.Quit()


if __name__ == "__main__":
    main()
