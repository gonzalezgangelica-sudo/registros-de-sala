/** Envío de correo con PDF adjunto (puente Outlook del PC o compartir en tablet) */

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

/**
 * Intenta enviar como el Excel: PDF adjunto vía Outlook del PC.
 * Si no hay puente, usa Web Share / descarga.
 */
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

  // Fallback tablet sin puente: compartir archivo (Gmail/Outlook app)
  const file = new File([blob], filename, { type: "application/pdf" });
  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    await navigator.share({
      files: [file],
      title: subject,
      text: body,
    });
    return { modo: "share", estado: "Compartido" };
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

  return { modo: "download", estado: "PDF listo / mail abierto" };
}
