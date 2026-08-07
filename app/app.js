import { REGISTROS_CATALOGO, MAIL_DEFAULTS } from "./registros.js";
import { checkBridge, enviarConAdjunto } from "./mail.js";
import { renderForm } from "./forms.js";
import {
  getSession,
  login,
  clearSession,
  loadUsers,
  saveUsers,
} from "./auth.js";

const toastEl = document.getElementById("toast");
let toastTimer;
let currentRegistroId = null;

function toast(msg, type = "") {
  toastEl.textContent = msg;
  toastEl.className = `toast show ${type}`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toastEl.className = "toast";
  }, 3500);
}

function confirmDialog(title, msg) {
  return new Promise((resolve) => {
    const overlay = document.getElementById("confirm-overlay");
    document.getElementById("confirm-title").textContent = title;
    document.getElementById("confirm-msg").textContent = msg;
    overlay.classList.add("show");
    const ok = document.getElementById("confirm-ok");
    const cancel = document.getElementById("confirm-cancel");
    const done = (v) => {
      overlay.classList.remove("show");
      ok.onclick = null;
      cancel.onclick = null;
      resolve(v);
    };
    ok.onclick = () => done(true);
    cancel.onclick = () => done(false);
  });
}

function showPanel(name) {
  document.querySelectorAll(".tab").forEach((t) => {
    t.classList.toggle("active", t.dataset.panel === name);
  });
  document.querySelectorAll(".panel").forEach((p) => p.classList.remove("active"));
  const panel = document.getElementById(`panel-${name}`);
  if (panel) panel.classList.add("active");
}

function updateSessionUI() {
  const s = getSession();
  const el = document.getElementById("session-user");
  if (!el) return;
  if (s) {
    el.textContent = s.nombre || s.user;
    el.title = `Conectado como ${s.user}${s.admin ? " (admin)" : ""}`;
  } else {
    el.textContent = "—";
  }
  const usersCard = document.getElementById("users-card");
  if (usersCard) usersCard.hidden = !(s && s.admin);
}

function showApp() {
  document.getElementById("login-screen").hidden = true;
  document.getElementById("app-shell").hidden = false;
  updateSessionUI();
  renderHub();
  renderConfig();
  renderUsersEditor();
  refreshBridge();
}

function showLogin() {
  document.getElementById("app-shell").hidden = true;
  document.getElementById("login-screen").hidden = false;
  document.getElementById("login-error").hidden = true;
  document.getElementById("login-pass").value = "";
  setTimeout(() => document.getElementById("login-user").focus(), 50);
}

document.querySelectorAll(".tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    if (!getSession()) return showLogin();
    showPanel(tab.dataset.panel);
    if (tab.dataset.panel === "historico") renderHistorico();
    if (tab.dataset.panel === "config") {
      renderConfig();
      renderUsersEditor();
    }
  });
});

document.getElementById("btn-back-hub").addEventListener("click", () => {
  currentRegistroId = null;
  showPanel("hub");
});

document.getElementById("btn-logout").addEventListener("click", async () => {
  const ok = await confirmDialog("Salir", "¿Cerrar sesión en esta tablet?");
  if (!ok) return;
  clearSession();
  currentRegistroId = null;
  showLogin();
  toast("Sesión cerrada", "ok");
});

document.getElementById("login-form").addEventListener("submit", (ev) => {
  ev.preventDefault();
  const user = document.getElementById("login-user").value;
  const pass = document.getElementById("login-pass").value;
  const err = document.getElementById("login-error");
  const result = login(user, pass);
  if (!result.ok) {
    err.textContent = result.error;
    err.hidden = false;
    return;
  }
  err.hidden = true;
  showApp();
  showPanel("hub");
  toast(`Bienvenido/a, ${result.session.nombre}`, "ok");
});

/* —— Bridge status —— */
async function refreshBridge() {
  const el = document.getElementById("bridge-status");
  if (!el) return;
  const b = await checkBridge();
  if (b.ok && b.outlook) {
    el.textContent = "Outlook PC: listo (envío automático)";
    el.className = "bridge-status ok";
  } else if (b.ok) {
    el.textContent = "Servidor OK · correo: compartir en tablet";
    el.className = "bridge-status ok";
  } else {
    el.textContent = "Modo tablet: Enviar = compartir PDF";
    el.className = "bridge-status ok";
  }
}

/* —— Hub —— */
function renderHub() {
  const grid = document.getElementById("hub-grid");
  grid.innerHTML = REGISTROS_CATALOGO.map(
    (r) => `<button type="button" class="hub-card" data-id="${r.id}">
      <h3>${r.nombre}</h3>
      <p>${r.descripcion}</p>
      <div class="src">${r.fuente}</div>
    </button>`
  ).join("");
  grid.querySelectorAll(".hub-card").forEach((btn) => {
    btn.addEventListener("click", () => openRegistro(btn.dataset.id));
  });
}

function openRegistro(id) {
  if (!getSession()) return showLogin();
  currentRegistroId = id;
  const meta = REGISTROS_CATALOGO.find((r) => r.id === id);
  document.getElementById("form-title").textContent = meta?.nombre || id;
  const root = document.getElementById("form-root");
  showPanel("form");
  renderForm(id, root, {
    onEnviar: (state, sheetEl) => handleEnviar(id, state, sheetEl),
    onLimpiar: async () => {
      const ok = await confirmDialog("Limpiar", "¿Vaciar el borrador de este registro?");
      if (!ok) return;
      localStorage.removeItem(`rmp_form_${id}`);
      openRegistro(id);
      toast("Registro limpio", "ok");
    },
    onChange: () => toast("Borrador guardado", "ok"),
  });
}

/* —— PDF —— */
async function generatePdfFromElement(el, filenamePrefix) {
  const cloneHost = document.getElementById("pdf-root");
  cloneHost.innerHTML = "";
  const clone = el.cloneNode(true);
  clone.querySelectorAll(".sheet-actions").forEach((n) => n.remove());
  cloneHost.appendChild(clone);
  await Promise.all(
    [...clone.querySelectorAll("img")].map((img) =>
      img.complete
        ? Promise.resolve()
        : new Promise((res) => {
            img.onload = res;
            img.onerror = res;
          })
    )
  );
  el.querySelectorAll("input, select, textarea").forEach((src, idx) => {
    const dst = clone.querySelectorAll("input, select, textarea")[idx];
    if (!dst) return;
    if (src.tagName === "SELECT") {
      const span = document.createElement("div");
      span.textContent = src.value || "";
      span.style.padding = "8px";
      span.style.textAlign = "center";
      dst.replaceWith(span);
    } else if (src.tagName === "TEXTAREA") {
      const span = document.createElement("div");
      span.textContent = src.value || "";
      span.style.padding = "8px";
      dst.replaceWith(span);
    } else {
      dst.setAttribute("value", src.value || "");
      dst.value = src.value || "";
    }
  });

  const canvas = await html2canvas(clone, {
    scale: 1.5,
    useCORS: true,
    backgroundColor: "#ffffff",
    windowWidth: Math.max(clone.scrollWidth, 1100),
  });
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();
  const margin = 6;
  const imgW = pageW - margin * 2;
  const imgH = (canvas.height * imgW) / canvas.width;
  let heightLeft = imgH;
  let position = margin;
  const imgData = canvas.toDataURL("image/jpeg", 0.92);
  pdf.addImage(imgData, "JPEG", margin, position, imgW, imgH);
  heightLeft -= pageH - margin * 2;
  while (heightLeft > 0) {
    position = margin - (imgH - heightLeft);
    pdf.addPage();
    pdf.addImage(imgData, "JPEG", margin, position, imgW, imgH);
    heightLeft -= pageH - margin * 2;
  }
  const pad = (n) => String(n).padStart(2, "0");
  const d = new Date();
  const filename = `${filenamePrefix}_${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(
    d.getDate()
  )}_${pad(d.getHours())}${pad(d.getMinutes())}.pdf`;
  return { blob: pdf.output("blob"), filename };
}

function mailFor(id) {
  const defaults = MAIL_DEFAULTS[id] || {
    asunto: "Registro de sala",
    cuerpo: "Se adjunta el registro.",
    to: [],
    cc: [],
  };
  const cfg = loadConfig();
  const to = (cfg.destinatarios || []).filter(Boolean).length
    ? cfg.destinatarios.filter(Boolean)
    : defaults.to;
  const cc = cfg.copia ? [cfg.copia] : defaults.cc;
  return {
    to,
    cc,
    subject: cfg.asunto || defaults.asunto,
    body: cfg.cuerpo || defaults.cuerpo,
  };
}

function loadConfig() {
  try {
    return JSON.parse(localStorage.getItem("rmp_config_global") || "{}");
  } catch {
    return {};
  }
}

function saveConfig(cfg) {
  localStorage.setItem("rmp_config_global", JSON.stringify(cfg));
}

function addLocalHist(entry) {
  const key = "rmp_historico";
  let hist = [];
  try {
    hist = JSON.parse(localStorage.getItem(key) || "[]");
  } catch {
    hist = [];
  }
  hist.unshift(entry);
  localStorage.setItem(key, JSON.stringify(hist.slice(0, 300)));
}

function currentUserName() {
  const s = getSession();
  return s?.nombre || s?.user || localStorage.getItem("rmp_usuario") || "tablet";
}

async function handleEnviar(id, state, sheetEl) {
  if (!getSession()) return showLogin();
  const ok = await confirmDialog(
    "Enviar registro",
    "Se generará el PDF y se enviará por correo con el archivo adjunto (Outlook del PC si el servidor está activo)."
  );
  if (!ok) return;

  try {
    toast("Generando PDF…");
    const prefix = state.pdfPrefix || id;
    const { blob, filename } = await generatePdfFromElement(sheetEl, prefix);
    const mail = mailFor(id);
    if (!mail.to.length) {
      toast("No hay destinatarios configurados", "error");
      return;
    }
    toast("Enviando correo…");
    const result = await enviarConAdjunto({
      blob,
      filename,
      to: mail.to,
      cc: mail.cc,
      subject: mail.subject,
      body: mail.body,
      registro: state.registroNombre || id,
    });

    addLocalHist({
      fecha: new Date().toISOString(),
      usuario: currentUserName(),
      registro: state.registroNombre || id,
      pdf: filename,
      estado: result.estado,
      observaciones: `${mail.to.join(";")} | Asunto: ${mail.subject}`,
    });

    if (result.modo === "outlook") {
      localStorage.removeItem(`rmp_form_${id}`);
      openRegistro(id);
      toast("Enviado por Outlook con PDF adjunto", "ok");
    } else {
      toast(`PDF listo (${result.modo}). Completa el correo si hace falta.`, "ok");
    }
  } catch (err) {
    console.error(err);
    addLocalHist({
      fecha: new Date().toISOString(),
      usuario: currentUserName(),
      registro: state.registroNombre || id,
      pdf: "",
      estado: "Error envío",
      observaciones: String(err.message || err),
    });
    toast("Error: " + (err.message || err), "error");
  }
}

/* —— Histórico —— */
async function renderHistorico() {
  const tbody = document.querySelector("#hist-table tbody");
  let items = [];
  try {
    items = JSON.parse(localStorage.getItem("rmp_historico") || "[]");
  } catch {
    items = [];
  }
  try {
    const r = await fetch("/api/historico");
    if (r.ok) {
      const data = await r.json();
      if (data.items?.length) {
        const localKeys = new Set(items.map((i) => i.fecha + i.pdf));
        for (const s of data.items) {
          if (!localKeys.has(s.fecha + s.pdf)) items.push(s);
        }
      }
    }
  } catch {
    /* ignore */
  }
  items.sort((a, b) => String(b.fecha).localeCompare(String(a.fecha)));
  if (!items.length) {
    tbody.innerHTML = `<tr><td colspan="7">Sin envíos todavía.</td></tr>`;
    return;
  }
  tbody.innerHTML = items
    .map((h) => {
      const d = new Date(h.fecha);
      const fecha = isNaN(d) ? h.fecha : d.toLocaleDateString("es-ES");
      const hora = isNaN(d) ? "" : d.toLocaleTimeString("es-ES");
      const cls = /enviado/i.test(h.estado)
        ? "estado-enviado"
        : /error|cancel/i.test(h.estado)
          ? "estado-error"
          : "";
      return `<tr>
        <td>${fecha}</td><td>${hora}</td><td>${h.usuario || ""}</td>
        <td>${h.registro || ""}</td><td>${h.pdf || ""}</td>
        <td class="${cls}">${h.estado || ""}</td><td>${h.observaciones || ""}</td>
      </tr>`;
    })
    .join("");
}

/* —— Config —— */
function renderConfig() {
  const cfg = loadConfig();
  const dest = cfg.destinatarios || ["", "", "", ""];
  while (dest.length < 4) dest.push("");
  const s = getSession();
  document.getElementById("config-form").innerHTML = `
    <label>Usuario conectado</label>
    <input id="cfg-usuario" value="${s?.nombre || s?.user || ""}" readonly />
    <label>Asunto (opcional, global)</label>
    <input id="cfg-asunto" value="${cfg.asunto || ""}" placeholder="Vacío = el del registro" />
    <label>Texto correo (opcional)</label>
    <textarea id="cfg-cuerpo" rows="3" placeholder="Vacío = el del registro">${cfg.cuerpo || ""}</textarea>
    <label>Destinatario 1 (override)</label><input id="cfg-d1" value="${dest[0] || ""}" />
    <label>Destinatario 2</label><input id="cfg-d2" value="${dest[1] || ""}" />
    <label>Destinatario 3</label><input id="cfg-d3" value="${dest[2] || ""}" />
    <label>Destinatario 4</label><input id="cfg-d4" value="${dest[3] || ""}" />
    <label>Copia</label><input id="cfg-cc" value="${cfg.copia || ""}" />
  `;
}

function renderUsersEditor() {
  const s = getSession();
  const card = document.getElementById("users-card");
  if (!card) return;
  card.hidden = !(s && s.admin);
  if (!(s && s.admin)) return;
  const lines = loadUsers().map(
    (u) => `${u.user};${u.pass};${u.nombre || u.user};${u.admin ? "si" : "no"}`
  );
  document.getElementById("users-editor").value = lines.join("\n");
}

document.getElementById("btn-save-config").addEventListener("click", () => {
  if (!getSession()) return showLogin();
  saveConfig({
    asunto: document.getElementById("cfg-asunto").value.trim(),
    cuerpo: document.getElementById("cfg-cuerpo").value,
    destinatarios: [
      document.getElementById("cfg-d1").value.trim(),
      document.getElementById("cfg-d2").value.trim(),
      document.getElementById("cfg-d3").value.trim(),
      document.getElementById("cfg-d4").value.trim(),
    ],
    copia: document.getElementById("cfg-cc").value.trim(),
  });
  toast("Configuración guardada", "ok");
});

document.getElementById("btn-save-users").addEventListener("click", () => {
  const s = getSession();
  if (!s?.admin) {
    toast("Solo un administrador puede cambiar usuarios", "error");
    return;
  }
  const text = document.getElementById("users-editor").value;
  const users = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
    .map((line) => {
      const [user, pass, nombre, admin] = line.split(";").map((x) => (x || "").trim());
      return {
        user,
        pass,
        nombre: nombre || user,
        admin: /^(si|sí|yes|true|1|admin)$/i.test(admin || ""),
      };
    })
    .filter((u) => u.user && u.pass);
  if (!users.length) {
    toast("Debe haber al menos un usuario", "error");
    return;
  }
  if (!users.some((u) => u.admin)) {
    toast("Debe haber al menos un admin", "error");
    return;
  }
  saveUsers(users);
  toast("Usuarios guardados", "ok");
});

/* —— Launchers / SW —— */
function init() {
  loadUsers(); // asegura usuarios por defecto
  if (getSession()) {
    showApp();
    showPanel("hub");
  } else {
    showLogin();
  }
  setInterval(refreshBridge, 15000);
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.getRegistrations().then((regs) => {
      regs.forEach((r) => r.unregister());
    });
    if (window.caches && caches.keys) {
      caches.keys().then((keys) => keys.forEach((k) => caches.delete(k)));
    }
  }
}

init();
