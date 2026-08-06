/**
 * Envío de PDF:
 * 1) Si hay puente Outlook en PC -> envío automático
 * 2) Si no -> compartir PDF con Outlook/Gmail de la tablet (V2 sin PC)
 */

export async function checkBridge() {
  try {
    const r = await fetch("/api/health", { cache: "no-store" });
    if (!r.ok) return { ok: false };
    return await r.json();
  } catch {
    return { ok: false };
  }
}

function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export async function enviarConAdjunto({
  blob,
  filename,
  to,
  cc,
  subject,
  body,
  registro,
}) {
  const bridge = await checkBridge();

  if (bridge.ok && bridge.outlook) {
    const pdfBase64 = await blobToBase64(blob);
    const res = await fetch("/api/enviar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to,
        cc,
        subject,
        body,
        registro,
        filename,
        pdfBase64,
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.ok) {
      throw new Error(data.error || `Error HTTP ${res.status}`);
    }
    return { modo: "outlook", estado: "Enviado", data };
  }

  const file = new File([blob], filename, { type: "application/pdf" });
  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    await navigator.share({
      files: [file],
      title: subject,
      text: `${body || ""}\n\nPara: ${(to || []).join("; ")}\nCC: ${(cc || []).join("; ")}`,
    });
    return { modo: "share", estado: "Compartido (elige Outlook/Gmail)" };
  }

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);

  const toStr = (to || []).join(";");
  const ccStr = (cc || []).filter(Boolean).join(";");
  const ccPart = ccStr ? `&cc=${encodeURIComponent(ccStr)}` : "";
  window.location.href = `mailto:${toStr}?subject=${encodeURIComponent(
    subject || ""
  )}${ccPart}&body=${encodeURIComponent(
    `${body || ""}\n\nPDF: ${filename}\n(Adjunta el PDF descargado.)`
  )}`;

  return { modo: "download", estado: "PDF descargado / mail abierto" };
}
