import {
  DEFAULT_CONFIG,
  DEFAULT_LISTAS,
  CAMPOS_OBLIGATORIOS,
  REGISTROS,
  STORAGE_KEYS,
} from "./data.js";

/* —— Storage helpers —— */
function loadJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : structuredClone(fallback);
  } catch {
    return structuredClone(fallback);
  }
}

function saveJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

let config = loadJSON(STORAGE_KEYS.config, DEFAULT_CONFIG);
let listas = loadJSON(STORAGE_KEYS.listas, DEFAULT_LISTAS);
let historico = loadJSON(STORAGE_KEYS.historico, []);

function emptyGrid(registro) {
  const cols = registro.columnas;
  const data = {};
  for (const campo of registro.campos) {
    data[campo.key] = Array(cols).fill("");
  }
  return data;
}

function loadDraft(registro) {
  return loadJSON(STORAGE_KEYS.draft(registro.id), emptyGrid(registro));
}

function saveDraft(registro, data) {
  saveJSON(STORAGE_KEYS.draft(registro.id), data);
}

/* —— UI helpers —— */
const toastEl = document.getElementById("toast");
let toastTimer;

function toast(msg, type = "") {
  toastEl.textContent = msg;
  toastEl.className = `toast show ${type}`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toastEl.className = "toast";
  }, 3200);
}

function confirmDialog(title, msg) {
  return new Promise((resolve) => {
    const overlay = document.getElementById("confirm-overlay");
    document.getElementById("confirm-title").textContent = title;
    document.getElementById("confirm-msg").textContent = msg;
    overlay.classList.add("show");
    const ok = document.getElementById("confirm-ok");
    const cancel = document.getElementById("confirm-cancel");
    const done = (val) => {
      overlay.classList.remove("show");
      ok.onclick = null;
      cancel.onclick = null;
      resolve(val);
    };
    ok.onclick = () => done(true);
    cancel.onclick = () => done(false);
  });
}

function usuarioActual() {
  return localStorage.getItem("rmp_usuario") || "tablet";
}

/* —— Tabs —— */
document.querySelectorAll(".tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach((t) => t.classList.remove("active"));
    document.querySelectorAll(".panel").forEach((p) => p.classList.remove("active"));
    tab.classList.add("active");
    document.getElementById(`panel-${tab.dataset.panel}`).classList.add("active");
    if (tab.dataset.panel === "historico") renderHistorico();
  });
});

/* —— Render registro —— */
function optionsHtml(listKey, selected) {
  const opts = listas[listKey] || [];
  return (
    `<option value=""></option>` +
    opts
      .map(
        (o) =>
          `<option value="${escapeAttr(o)}" ${
            o === selected ? "selected" : ""
          }>${escapeHtml(o)}</option>`
      )
      .join("")
  );
}

function escapeHtml(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function escapeAttr(s) {
  return escapeHtml(s).replaceAll('"', "&quot;");
}

function renderRegister(registro) {
  const panel = document.getElementById(`panel-${registro.id}`);
  const data = loadDraft(registro);
  const cols = registro.columnas;

  let rows = "";
  for (const campo of registro.campos) {
    const labelClass = campo.highlight ? "row-label highlight" : "row-label";
    let cells = "";
    for (let i = 0; i < cols; i++) {
      const val = data[campo.key]?.[i] ?? "";
      const name = `${campo.key}__${i}`;
      let control = "";
      if (campo.type === "select") {
        control = `<select name="${name}" data-field="${campo.key}" data-col="${i}">${optionsHtml(
          campo.list,
          val
        )}</select>`;
      } else if (campo.type === "date") {
        control = `<input type="date" name="${name}" data-field="${campo.key}" data-col="${i}" value="${escapeAttr(
          val
        )}" />`;
      } else if (campo.spanAll && i === 0) {
        control = `<textarea name="${name}" data-field="${campo.key}" data-col="${i}" rows="2">${escapeHtml(
          val
        )}</textarea>`;
      } else if (campo.spanAll && i > 0) {
        control = "";
      } else {
        control = `<input type="text" name="${name}" data-field="${campo.key}" data-col="${i}" value="${escapeAttr(
          val
        )}" autocomplete="off" />`;
      }
      cells += `<td class="cell" data-field="${campo.key}" data-col="${i}">${control}</td>`;
    }
    rows += `<tr><th class="${labelClass}">${escapeHtml(campo.label)}</th>${cells}</tr>`;
  }

  const colHeaders = Array.from({ length: cols }, (_, i) => `<th>${i + 1}</th>`).join(
    ""
  );

  panel.innerHTML = `
    <article class="form-sheet" id="sheet-${registro.id}">
      <div class="doc-header">
        <img src="${registro.headerImg}" alt="Cabecera formulario ${registro.tituloLinea}" />
      </div>
      <div class="line-title">${escapeHtml(registro.tituloLinea)}</div>
      <div class="grid-wrap">
        <table class="register-table" id="table-${registro.id}">
          <thead>
            <tr>
              <th class="corner"></th>
              ${colHeaders}
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
      <div class="footer-notes">
        <img src="assets/footer-notas.png" alt="Notas check origen" />
      </div>
      <div class="sheet-actions">
        <button type="button" class="btn" data-action="guardar" data-reg="${registro.id}">Guardar borrador</button>
        <button type="button" class="btn btn-danger" data-action="limpiar" data-reg="${registro.id}">Limpiar</button>
        <button type="button" class="btn btn-primary" data-action="enviar" data-reg="${registro.id}">Enviar</button>
      </div>
    </article>
  `;

  panel.querySelectorAll("input, select, textarea").forEach((el) => {
    el.addEventListener("change", () => persistFromDom(registro));
    el.addEventListener("input", () => persistFromDom(registro));
  });

  panel.querySelectorAll("[data-action]").forEach((btn) => {
    btn.addEventListener("click", () => handleAction(btn.dataset.action, registro));
  });
}

function readFromDom(registro) {
  const data = emptyGrid(registro);
  const table = document.getElementById(`table-${registro.id}`);
  table.querySelectorAll("[data-field]").forEach((el) => {
    const field = el.dataset.field;
    const col = Number(el.dataset.col);
    if (!Number.isFinite(col)) return;
    data[field][col] = el.value ?? "";
  });
  return data;
}

function persistFromDom(registro) {
  saveDraft(registro, readFromDom(registro));
}

function hasAnyData(data, registro) {
  return registro.campos.some((c) =>
    (data[c.key] || []).some((v) => String(v).trim() !== "")
  );
}

function columnasUsadas(data, registro) {
  const used = [];
  for (let i = 0; i < registro.columnas; i++) {
    const filled = registro.campos.some(
      (c) => String(data[c.key]?.[i] ?? "").trim() !== ""
    );
    if (filled) used.push(i);
  }
  // observaciones solo en col 0 cuenta como uso de col 0
  return used;
}

function validate(data, registro) {
  const errors = [];
  const used = columnasUsadas(data, registro);
  if (used.length === 0) {
    return { ok: false, errors: ["No hay datos en el registro para enviar."] };
  }

  // limpiar marcas invalid
  document
    .querySelectorAll(`#table-${registro.id} .invalid`)
    .forEach((td) => td.classList.remove("invalid"));

  for (const col of used) {
    for (const campo of registro.campos) {
      if (campo.spanAll && col > 0) continue;
      const obligatorio =
        CAMPOS_OBLIGATORIOS[campo.key] === true &&
        !(campo.key === "observaciones");
      // VAP no tiene algunos campos → solo validar los del registro
      if (!obligatorio) continue;
      // producto no es obligatorio en CONFIG Excel
      const val = String(data[campo.key]?.[col] ?? "").trim();
      if (!val) {
        errors.push(`Columna ${col + 1}: falta ${campo.label.replaceAll("\n", " ")}`);
        const td = document.querySelector(
          `#table-${registro.id} td[data-field="${campo.key}"][data-col="${col}"]`
        );
        td?.classList.add("invalid");
      }
    }
  }
  return { ok: errors.length === 0, errors };
}

async function handleAction(action, registro) {
  if (action === "guardar") {
    persistFromDom(registro);
    toast("Borrador guardado en la tablet", "ok");
    return;
  }
  if (action === "limpiar") {
    const ok = await confirmDialog(
      "Limpiar registro",
      `¿Vaciar todos los datos de ${registro.tituloLinea}?`
    );
    if (!ok) return;
    saveDraft(registro, emptyGrid(registro));
    renderRegister(registro);
    toast("Registro limpio", "ok");
    return;
  }
  if (action === "enviar") {
    await enviarRegistro(registro);
  }
}

/* —— PDF + envío —— */
function stampName(prefix) {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${prefix}_${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}_${pad(
    d.getHours()
  )}${pad(d.getMinutes())}.pdf`;
}

function buildPdfClone(registro, data) {
  const root = document.getElementById("pdf-root");
  const cols = registro.columnas;
  let body = "";
  for (const campo of registro.campos) {
    const labelClass = campo.highlight ? "row-label highlight" : "row-label";
    let cells = "";
    for (let i = 0; i < cols; i++) {
      const val = data[campo.key]?.[i] ?? "";
      cells += `<td class="cell" style="text-align:center;padding:6px;font-size:11px;">${escapeHtml(
        val
      )}</td>`;
    }
    body += `<tr><th class="${labelClass}" style="white-space:pre-line;font-size:10px;padding:4px;">${escapeHtml(
      campo.label
    )}</th>${cells}</tr>`;
  }
  const headers = Array.from({ length: cols }, (_, i) => `<th>${i + 1}</th>`).join("");
  root.innerHTML = `
    <div class="form-sheet" style="box-shadow:none;border:none;">
      <div class="doc-header"><img src="${registro.headerImg}" style="width:100%"/></div>
      <div class="line-title">${escapeHtml(registro.tituloLinea)}</div>
      <table class="register-table" style="min-width:0;width:100%;">
        <thead><tr><th class="corner"></th>${headers}</tr></thead>
        <tbody>${body}</tbody>
      </table>
      <div class="footer-notes" style="margin-top:12px;"><img src="assets/footer-notas.png" style="width:100%"/></div>
    </div>
  `;
  return root.firstElementChild;
}

async function generatePdfBlob(registro, data) {
  const el = buildPdfClone(registro, data);
  // wait images
  await Promise.all(
    [...el.querySelectorAll("img")].map(
      (img) =>
        img.complete
          ? Promise.resolve()
          : new Promise((res) => {
              img.onload = res;
              img.onerror = res;
            })
    )
  );
  const canvas = await html2canvas(el, {
    scale: 2,
    useCORS: true,
    backgroundColor: "#ffffff",
  });
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();
  const margin = 8;
  const imgW = pageW - margin * 2;
  const imgH = (canvas.height * imgW) / canvas.width;
  const y = Math.max(margin, (pageH - imgH) / 2);
  pdf.addImage(canvas.toDataURL("image/png"), "PNG", margin, y, imgW, Math.min(imgH, pageH - margin * 2));
  return {
    blob: pdf.output("blob"),
    filename: stampName(registro.pdfPrefix),
  };
}

function addHistorico(entry) {
  historico.unshift(entry);
  saveJSON(STORAGE_KEYS.historico, historico);
}

async function shareOrDownload(blob, filename) {
  const file = new File([blob], filename, { type: "application/pdf" });
  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({
        files: [file],
        title: config.asunto,
        text: config.cuerpo,
      });
      return "compartido";
    } catch (e) {
      if (e.name === "AbortError") return "cancelado";
    }
  }
  // fallback download
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
  return "descargado";
}

function openMailDraft(filename) {
  const to = (config.destinatarios || []).filter(Boolean).join(";");
  const cc = config.copia || "";
  const subject = encodeURIComponent(config.asunto || "");
  const body = encodeURIComponent(
    `${config.cuerpo || ""}\n\nPDF: ${filename}\n(Adjunta el PDF descargado/compartido desde la tablet.)`
  );
  const ccPart = cc ? `&cc=${encodeURIComponent(cc)}` : "";
  window.location.href = `mailto:${to}?subject=${subject}${ccPart}&body=${body}`;
}

async function enviarRegistro(registro) {
  const data = readFromDom(registro);
  persistFromDom(registro);

  if (!hasAnyData(data, registro)) {
    toast("No hay datos en el registro para enviar.", "error");
    return;
  }

  const { ok, errors } = validate(data, registro);
  if (!ok) {
    toast(errors[0] || "Faltan campos obligatorios", "error");
    return;
  }

  const dest = (config.destinatarios || []).filter(Boolean).join(";");
  if (!dest) {
    toast("No hay destinatarios en Config.", "error");
    return;
  }

  const confirmed = await confirmDialog(
    "Enviar registro",
    `Se generará el PDF de ${registro.tituloLinea}, se podrá compartir/adjuntar al correo y se vaciará el formulario (como en Excel).`
  );
  if (!confirmed) return;

  try {
    toast("Generando PDF…");
    const { blob, filename } = await generatePdfBlob(registro, data);
    const modo = await shareOrDownload(blob, filename);

    if (modo === "cancelado") {
      addHistorico({
        fecha: new Date().toISOString(),
        usuario: usuarioActual(),
        registro: registro.nombre,
        pdf: filename,
        estado: "Cancelado",
        observaciones: "Usuario canceló compartir",
      });
      toast("Envío cancelado", "error");
      return;
    }

    // Abrir cliente de correo (Android Gmail / Outlook app)
    openMailDraft(filename);

    addHistorico({
      fecha: new Date().toISOString(),
      usuario: usuarioActual(),
      registro: registro.nombre,
      pdf: filename,
      estado: modo === "compartido" ? "Compartido" : "PDF listo / mail abierto",
      observaciones: `${dest} | Asunto: ${config.asunto}`,
    });

    saveDraft(registro, emptyGrid(registro));
    renderRegister(registro);
    toast("PDF generado. Completa el envío del correo si aplica.", "ok");
  } catch (err) {
    console.error(err);
    addHistorico({
      fecha: new Date().toISOString(),
      usuario: usuarioActual(),
      registro: registro.nombre,
      pdf: "",
      estado: "Error PDF",
      observaciones: String(err.message || err),
    });
    toast("Error al generar el PDF: " + (err.message || err), "error");
  }
}

/* —— Histórico —— */
function renderHistorico() {
  const tbody = document.querySelector("#hist-table tbody");
  if (!historico.length) {
    tbody.innerHTML = `<tr><td colspan="7">Sin registros todavía.</td></tr>`;
    return;
  }
  tbody.innerHTML = historico
    .map((h) => {
      const d = new Date(h.fecha);
      const fecha = d.toLocaleDateString("es-ES");
      const hora = d.toLocaleTimeString("es-ES");
      const estadoClass =
        /error/i.test(h.estado) || /cancel/i.test(h.estado)
          ? "estado-error"
          : /compart|envi|listo/i.test(h.estado)
            ? "estado-enviado"
            : "";
      return `<tr>
        <td>${escapeHtml(fecha)}</td>
        <td>${escapeHtml(hora)}</td>
        <td>${escapeHtml(h.usuario || "")}</td>
        <td>${escapeHtml(h.registro || "")}</td>
        <td>${escapeHtml(h.pdf || "")}</td>
        <td class="${estadoClass}">${escapeHtml(h.estado || "")}</td>
        <td>${escapeHtml(h.observaciones || "")}</td>
      </tr>`;
    })
    .join("");
}

document.getElementById("btn-clear-hist").addEventListener("click", async () => {
  const ok = await confirmDialog("Vaciar histórico", "¿Borrar el histórico local de esta tablet?");
  if (!ok) return;
  historico = [];
  saveJSON(STORAGE_KEYS.historico, historico);
  renderHistorico();
  toast("Histórico vacío", "ok");
});

/* —— Config —— */
function renderConfig() {
  const form = document.getElementById("config-form");
  const dest = (config.destinatarios || []).slice(0, 4);
  while (dest.length < 4) dest.push("");
  form.innerHTML = `
    <label>Usuario tablet</label>
    <input id="cfg-usuario" value="${escapeAttr(usuarioActual())}" />
    <label>Asunto correo</label>
    <input id="cfg-asunto" value="${escapeAttr(config.asunto || "")}" />
    <label>Texto correo</label>
    <textarea id="cfg-cuerpo" rows="3">${escapeHtml(config.cuerpo || "")}</textarea>
    <label>Destinatario 1</label>
    <input id="cfg-d1" value="${escapeAttr(dest[0])}" />
    <label>Destinatario 2</label>
    <input id="cfg-d2" value="${escapeAttr(dest[1])}" />
    <label>Destinatario 3</label>
    <input id="cfg-d3" value="${escapeAttr(dest[2])}" />
    <label>Destinatario 4</label>
    <input id="cfg-d4" value="${escapeAttr(dest[3])}" />
    <label>Copia</label>
    <input id="cfg-cc" value="${escapeAttr(config.copia || "")}" />
    <label>Nota carpeta PDF</label>
    <input id="cfg-nota" value="${escapeAttr(config.carpetaPdfNota || "")}" readonly />
  `;
}

document.getElementById("btn-save-config").addEventListener("click", () => {
  localStorage.setItem("rmp_usuario", document.getElementById("cfg-usuario").value.trim() || "tablet");
  config = {
    ...config,
    asunto: document.getElementById("cfg-asunto").value.trim(),
    cuerpo: document.getElementById("cfg-cuerpo").value,
    destinatarios: [
      document.getElementById("cfg-d1").value.trim(),
      document.getElementById("cfg-d2").value.trim(),
      document.getElementById("cfg-d3").value.trim(),
      document.getElementById("cfg-d4").value.trim(),
    ],
    copia: document.getElementById("cfg-cc").value.trim(),
  };
  saveJSON(STORAGE_KEYS.config, config);
  toast("Configuración guardada", "ok");
});

/* —— Listas —— */
const LIST_LABELS = {
  marcas: "Marcas",
  granjas: "Granjas",
  checks: "Check",
  tiposMarchamo: "Tipo de marchamo",
  tiposEtiqueta: "Tipo de etiqueta",
  encargados: "Encargados",
  supervisores: "Supervisores",
};

function renderListas() {
  const form = document.getElementById("listas-form");
  form.innerHTML = Object.keys(LIST_LABELS)
    .map((key) => {
      const text = (listas[key] || []).join("\n");
      return `<div>
        <h3>${LIST_LABELS[key]}</h3>
        <textarea data-list="${key}">${escapeHtml(text)}</textarea>
      </div>`;
    })
    .join("");
}

function parseListText(text) {
  return text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
}

document.getElementById("btn-save-listas").addEventListener("click", () => {
  document.querySelectorAll("#listas-form textarea").forEach((ta) => {
    listas[ta.dataset.list] = parseListText(ta.value);
  });
  saveJSON(STORAGE_KEYS.listas, listas);
  renderRegister(REGISTROS.principal);
  renderRegister(REGISTROS.vap);
  toast("Listas guardadas", "ok");
});

document.getElementById("btn-reset-listas").addEventListener("click", async () => {
  const ok = await confirmDialog("Restaurar listas", "¿Volver a las listas por defecto del Excel?");
  if (!ok) return;
  listas = structuredClone(DEFAULT_LISTAS);
  saveJSON(STORAGE_KEYS.listas, listas);
  renderListas();
  renderRegister(REGISTROS.principal);
  renderRegister(REGISTROS.vap);
  toast("Listas restauradas", "ok");
});

/* —— Init —— */
function init() {
  renderRegister(REGISTROS.principal);
  renderRegister(REGISTROS.vap);
  renderConfig();
  renderListas();
  renderHistorico();

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./sw.js").catch(() => {});
  }
}

init();
