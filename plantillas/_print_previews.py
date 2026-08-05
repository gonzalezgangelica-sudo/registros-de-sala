import json
from pathlib import Path

base = Path(r"C:\Users\ACZ\.codex\REGISTROS_DE_SALA\plantillas\_analisis")
out_lines = []
for p in sorted(base.glob("*.json")):
    if p.name == "summary.json":
        continue
    data = json.loads(p.read_text(encoding="utf-8"))
    out_lines.append("=" * 70)
    out_lines.append(data["file"])
    out_lines.append("VBA: " + ", ".join(data.get("vba_subs") or []))
    for s in data["sheets"]:
        out_lines.append(f"--- {s['name']} rows={s['max_row']} cols={s['max_col']} ---")
        for row in s["preview"][:40]:
            vals = " | ".join(f"{c['c']}:{c['v'][:50]}" for c in row["cells"][:12])
            out_lines.append(f"  R{row['r']}: {vals}")
    out_lines.append("")

text = "\n".join(out_lines)
(base / "previews.txt").write_text(text, encoding="utf-8")
print(text[:15000])
print("\n... truncated; full in previews.txt, len=", len(text))
