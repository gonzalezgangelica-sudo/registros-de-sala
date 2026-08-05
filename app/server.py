#!/usr/bin/env python3
"""
Servidor local para tablets Android.

- Sirve la carpeta app/ (hub de registros)
- POST /api/enviar -> recibe PDF (base64) y lo envía por Outlook del PC
  (mismo flujo que los .xlsm: adjunto + Send)

Uso:
  python app/server.py
  python app/server.py --port 8080
"""

from __future__ import annotations

import argparse
import base64
import json
import mimetypes
import os
import tempfile
import traceback
from datetime import datetime
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import unquote, urlparse

APP_DIR = Path(__file__).resolve().parent
HIST_FILE = APP_DIR / "data" / "server_historico.json"


def ensure_hist():
    HIST_FILE.parent.mkdir(parents=True, exist_ok=True)
    if not HIST_FILE.exists():
        HIST_FILE.write_text("[]", encoding="utf-8")


def append_hist(entry: dict):
    ensure_hist()
    try:
        data = json.loads(HIST_FILE.read_text(encoding="utf-8"))
    except Exception:
        data = []
    data.insert(0, entry)
    HIST_FILE.write_text(json.dumps(data[:500], ensure_ascii=False, indent=2), encoding="utf-8")


def split_emails(value) -> list[str]:
    if value is None:
        return []
    if isinstance(value, list):
        parts = value
    else:
        parts = str(value).replace(",", ";").split(";")
    return [p.strip() for p in parts if p and p.strip()]


def send_outlook(to_list, cc_list, subject, body, pdf_path: Path) -> None:
    import win32com.client  # type: ignore

    outlook = win32com.client.Dispatch("Outlook.Application")
    mail = outlook.CreateItem(0)
    mail.To = ";".join(to_list)
    if cc_list:
        mail.CC = ";".join(cc_list)
    mail.Subject = subject or "Registro sala"
    mail.Body = body or "Se adjunta el registro para su revisión."
    mail.Attachments.Add(str(pdf_path))
    mail.Send()


class Handler(BaseHTTPRequestHandler):
    server_version = "RegistrosSala/1.0"

    def log_message(self, fmt, *args):
        print(f"[{datetime.now():%H:%M:%S}] {self.address_string()} {fmt % args}")

    def _cors(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")

    def do_OPTIONS(self):
        self.send_response(204)
        self._cors()
        self.end_headers()

    def do_GET(self):
        parsed = urlparse(self.path)
        path = unquote(parsed.path)

        if path in ("/api/health", "/api/ping"):
            outlook_ok = False
            try:
                import win32com.client  # noqa: F401

                outlook_ok = True
            except Exception:
                outlook_ok = False
            return self._json(200, {"ok": True, "outlook": outlook_ok, "mode": "pc-bridge"})

        if path == "/api/historico":
            ensure_hist()
            try:
                data = json.loads(HIST_FILE.read_text(encoding="utf-8"))
            except Exception:
                data = []
            return self._json(200, {"items": data})

        rel = path.lstrip("/")
        if not rel or rel.endswith("/"):
            rel = "index.html"
        file_path = (APP_DIR / rel).resolve()
        if not str(file_path).startswith(str(APP_DIR)) or not file_path.is_file():
            return self._json(404, {"error": "not found"})

        ctype = mimetypes.guess_type(str(file_path))[0] or "application/octet-stream"
        data = file_path.read_bytes()
        self.send_response(200)
        self._cors()
        self.send_header("Content-Type", ctype)
        self.send_header("Content-Length", str(len(data)))
        self.send_header("Cache-Control", "no-cache")
        self.end_headers()
        self.wfile.write(data)

    def do_POST(self):
        parsed = urlparse(self.path)
        if parsed.path != "/api/enviar":
            return self._json(404, {"error": "not found"})

        try:
            length = int(self.headers.get("Content-Length", "0"))
            raw = self.rfile.read(length)
            payload = json.loads(raw.decode("utf-8"))

            to_list = split_emails(payload.get("to"))
            cc_list = split_emails(payload.get("cc"))
            subject = payload.get("subject") or "Registro sala"
            body = payload.get("body") or "Se adjunta el registro para su revisión."
            registro = payload.get("registro") or ""
            filename = payload.get("filename") or f"Registro_{datetime.now():%Y%m%d_%H%M%S}.pdf"
            filename = Path(filename).name

            b64 = payload.get("pdfBase64") or ""
            if "," in b64:
                b64 = b64.split(",", 1)[1]
            if not b64:
                return self._json(400, {"error": "Falta el PDF adjunto"})
            if not to_list:
                return self._json(400, {"error": "Faltan destinatarios"})

            pdf_bytes = base64.b64decode(b64)
            with tempfile.TemporaryDirectory() as tmp:
                pdf_path = Path(tmp) / filename
                pdf_path.write_bytes(pdf_bytes)
                send_outlook(to_list, cc_list, subject, body, pdf_path)

            entry = {
                "fecha": datetime.now().isoformat(timespec="seconds"),
                "usuario": os.environ.get("USERNAME", "PC"),
                "registro": registro,
                "pdf": filename,
                "estado": "Enviado",
                "observaciones": ";".join(to_list) + f" | Asunto: {subject}",
            }
            append_hist(entry)
            return self._json(200, {"ok": True, "estado": "Enviado", "pdf": filename})
        except Exception as e:
            traceback.print_exc()
            append_hist(
                {
                    "fecha": datetime.now().isoformat(timespec="seconds"),
                    "usuario": os.environ.get("USERNAME", "PC"),
                    "registro": "",
                    "pdf": "",
                    "estado": "Error envío",
                    "observaciones": str(e),
                }
            )
            return self._json(500, {"ok": False, "error": str(e)})

    def _json(self, code: int, obj: dict):
        data = json.dumps(obj, ensure_ascii=False).encode("utf-8")
        self.send_response(code)
        self._cors()
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)


def _guess_lan():
    try:
        import socket

        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        return None


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--host", default="0.0.0.0")
    parser.add_argument("--port", type=int, default=8080)
    args = parser.parse_args()

    ensure_hist()
    httpd = ThreadingHTTPServer((args.host, args.port), Handler)
    lan = _guess_lan()
    print("=" * 56)
    print("  Registros de sala — puente Outlook (PC)")
    print("=" * 56)
    print(f"  PC:     http://127.0.0.1:{args.port}/")
    if lan:
        print(f"  Tablet: http://{lan}:{args.port}/")
    print("  Enviar = PDF adjunto via Outlook de ESTE PC")
    print("  Ctrl+C para detener.")
    print("=" * 56)
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nServidor detenido.")


if __name__ == "__main__":
    main()
