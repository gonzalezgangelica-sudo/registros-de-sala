/** Formularios tablet de los registros (equivalente visual simplificado de cada .xlsm) */

import { REGISTROS, DEFAULT_LISTAS } from "./data.js";

/** Cabeceras originales extraídas de cada .xlsm */
export const HEADERS = {
  marcas_propias_principal: "assets/headers/marcas_principal.png",
  marcas_propias_vap: "assets/headers/marcas_vap.png",
  marcas_propias_pie: "assets/headers/marcas_pie.png",
  detector_metales: "assets/headers/detector_metales.png",
  lava_utiles: "assets/headers/lava_utiles.png",
  transporte: "assets/headers/transporte.png",
  transporte_pie: "assets/headers/transporte_pie.png",
  pales: "assets/headers/pales.png",
  cuchillos: "assets/headers/cuchillos.png",
  cutters: "assets/headers/cutters.png",
};

const DAYS = Array.from({ length: 31 }, (_, i) => i + 1);
const MESES = [
  "ENERO",
  "FEBRERO",
  "MARZO",
  "ABRIL",
  "MAYO",
  "JUNIO",
  "JULIO",
  "AGOSTO",
  "SEPTIEMBRE",
  "OCTUBRE",
  "NOVIEMBRE",
  "DICIEMBRE",
];

function esc(s) {
  return String(s ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function headerHtml(src, alt = "Cabecera formulario") {
  if (!src) return "";
  return `<div class="doc-header"><img src="${src}" alt="${esc(alt)}" /></div>`;
}

function footerHtml(src, alt = "Pie / notas") {
  if (!src) return "";
  return `<div class="footer-notes"><img src="${src}" alt="${esc(alt)}" /></div>`;
}

function opts(list, selected = "") {
  return (
    `<option value=""></option>` +
    list
      .map(
        (o) =>
          `<option value="${esc(o)}" ${o === selected ? "selected" : ""}>${esc(
            o
          )}</option>`
      )
      .join("")
  );
}

export function emptyState(id) {
  const key = `rmp_form_${id}`;
  try {
    return JSON.parse(localStorage.getItem(key) || "null") || defaultState(id);
  } catch {
    return defaultState(id);
  }
}

export function saveState(id, state) {
  localStorage.setItem(`rmp_form_${id}`, JSON.stringify(state));
}

function defaultState(id) {
  const now = new Date();
  switch (id) {
    case "marcas_propias":
      return { vista: "principal", data: null };
    case "lava_utiles":
      return {
        filas: Array.from({ length: 12 }, (_, i) => ({
          equipo: i % 2 === 0 ? "CALDERÍN ACLARADO" : "CUBA LAVADO",
          temp: "",
          fecha: "",
          hora: "",
          realizado: "",
        })),
        observaciones: "",
        supervisado: "",
      };
    case "transporte":
      return {
        filas: Array.from({ length: 12 }, () => ({
          fecha: "",
          transportista: "",
          matTracora: "",
          matRemolque: "",
          limpieza: "",
          frio: "",
          realizado: "",
        })),
        observaciones: "",
        firma: "",
      };
    case "detector_metales":
      return {
        lineas: {
          vap: emptyDetectorLine(),
          rechazo: emptyDetectorLine(),
          valorizacion: emptyDetectorLine(),
        },
      };
    case "pales":
      return {
        mes: MESES[now.getMonth()],
        anio: String(now.getFullYear()),
        dias: Object.fromEntries(
          DAYS.map((d) => [
            d,
            { estM: "", estT: "", obsM: "", obsT: "", realM: "", realT: "" },
          ])
        ),
        supervisado: "",
      };
    case "cuchillos":
      return {
        mes: MESES[now.getMonth()],
        anio: String(now.getFullYear()),
        dias: Object.fromEntries(
          DAYS.map((d) => [
            d,
            {
              entran: "",
              personas: "",
              retManana: "",
              retTarde: "",
              afilado: "",
              devueltos: "",
              total: "",
              obs: "",
            },
          ])
        ),
        supervisado: "",
      };
    case "cutters":
      return {
        mes: MESES[now.getMonth()],
        anio: String(now.getFullYear()),
        zonas: ["EXPEDICION", "FLEJADORA", "PACKING", "ENVIO AVION"],
        dias: Object.fromEntries(
          DAYS.map((d) => [
            d,
            {
              r1m: "",
              r1t: "",
              e1m: "",
              e1t: "",
              r2m: "",
              r2t: "",
              e2m: "",
              e2t: "",
              r3m: "",
              r3t: "",
              e3m: "",
              e3t: "",
              r4m: "",
              r4t: "",
              e4m: "",
              e4t: "",
            },
          ])
        ),
        observaciones: "",
        firma: "",
      };
    default:
      return {};
  }
}

function emptyDetectorLine() {
  const momentos = [
    "INICIO JORNADA",
    "ANTES SALIDA CAMION",
    "DESPUÉS DEL DESCANSO",
    "ANTES SALIDA CAMION 2",
    "AL FINAL DE LA JORNADA",
    "INICIO JORNADA 2",
    "ANTES SALIDA CAMION 3",
    "DESPUÉS DEL DESCANSO 2",
    "AL FINAL DE LA JORNADA 2",
  ];
  return {
    idDetector: "",
    momentos: momentos.map((m) => ({
      momento: m,
      fe: "",
      nofe: "",
      inox: "",
      ok: "",
      fechaProg: "",
      hora: "",
      realizado: "",
    })),
    supervisado: "",
  };
}

export function renderForm(id, root, { onChange, onEnviar, onLimpiar }) {
  const state = emptyState(id);
  root.innerHTML = "";

  if (id === "marcas_propias") {
    renderMarcas(root, state, { onChange, onEnviar, onLimpiar });
    return;
  }
  if (id === "lava_utiles") {
    renderLava(root, state, { onChange, onEnviar, onLimpiar });
    return;
  }
  if (id === "transporte") {
    renderTransporte(root, state, { onChange, onEnviar, onLimpiar });
    return;
  }
  if (id === "detector_metales") {
    renderDetector(root, state, { onChange, onEnviar, onLimpiar });
    return;
  }
  if (id === "pales") {
    renderMonthSimple(root, state, id, "Estado palés (M/T)", { onChange, onEnviar, onLimpiar });
    return;
  }
  if (id === "cuchillos") {
    renderCuchillos(root, state, { onChange, onEnviar, onLimpiar });
    return;
  }
  if (id === "cutters") {
    renderCutters(root, state, { onChange, onEnviar, onLimpiar });
    return;
  }
  root.innerHTML = `<div class="card"><p>Registro no implementado.</p></div>`;
}

function actionsHtml() {
  return `<div class="sheet-actions">
    <button type="button" class="btn" data-act="guardar">Guardar borrador</button>
    <button type="button" class="btn btn-danger" data-act="limpiar">Limpiar</button>
    <button type="button" class="btn btn-primary" data-act="enviar">Enviar</button>
  </div>`;
}

function bindActions(root, state, id, { onChange, onEnviar, onLimpiar }, collect) {
  root.querySelectorAll("[data-act]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const act = btn.dataset.act;
      if (act === "guardar") {
        const s = collect();
        saveState(id, s);
        onChange?.(s);
        return;
      }
      if (act === "limpiar") {
        onLimpiar?.();
        return;
      }
      if (act === "enviar") {
        const s = collect();
        saveState(id, s);
        await onEnviar?.(s, root.querySelector(".form-sheet") || root);
      }
    });
  });
}

function renderMarcas(root, state, hooks) {
  // Reuse existing REGISTROS definitions via a compact embedded table builder
  const vista = state.vista || "principal";
  const reg = REGISTROS[vista] || REGISTROS.principal;
  const cols = reg.columnas;
  const data =
    state.data ||
    Object.fromEntries(reg.campos.map((c) => [c.key, Array(cols).fill("")]));

  let rows = "";
  for (const campo of reg.campos) {
    const labelClass = campo.highlight ? "row-label highlight" : "row-label";
    let cells = "";
    for (let i = 0; i < cols; i++) {
      const val = data[campo.key]?.[i] ?? "";
      let control;
      if (campo.type === "select") {
        control = `<select data-f="${campo.key}" data-i="${i}">${opts(
          DEFAULT_LISTAS[campo.list] || [],
          val
        )}</select>`;
      } else if (campo.type === "date") {
        control = `<input type="date" data-f="${campo.key}" data-i="${i}" value="${esc(
          val
        )}" />`;
      } else if (campo.spanAll && i === 0) {
        control = `<textarea data-f="${campo.key}" data-i="${i}" rows="2">${esc(
          val
        )}</textarea>`;
      } else if (campo.spanAll) {
        control = "";
      } else {
        control = `<input type="text" data-f="${campo.key}" data-i="${i}" value="${esc(
          val
        )}" />`;
      }
      cells += `<td class="cell">${control}</td>`;
    }
    rows += `<tr><th class="${labelClass}">${esc(campo.label)}</th>${cells}</tr>`;
  }

  const headerSrc =
    vista === "vap" ? HEADERS.marcas_propias_vap : HEADERS.marcas_propias_principal;
  root.innerHTML = `
    <article class="form-sheet">
      ${headerHtml(headerSrc, reg.tituloLinea)}
      <div class="sheet-actions" style="justify-content:flex-start">
        <button type="button" class="btn ${vista === "principal" ? "btn-primary" : ""}" data-vista="principal">Línea principal</button>
        <button type="button" class="btn ${vista === "vap" ? "btn-primary" : ""}" data-vista="vap">Línea VAP</button>
      </div>
      <div class="line-title">${esc(reg.tituloLinea)}</div>
      <div class="grid-wrap">
        <table class="register-table">
          <thead><tr><th class="corner"></th>${Array.from({ length: cols }, (_, i) => `<th>${i + 1}</th>`).join("")}</tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
      ${footerHtml(HEADERS.marcas_propias_pie, "Notas check origen")}
      ${actionsHtml()}
    </article>`;

  const collect = () => {
    const d = Object.fromEntries(reg.campos.map((c) => [c.key, Array(cols).fill("")]));
    root.querySelectorAll("[data-f]").forEach((el) => {
      d[el.dataset.f][Number(el.dataset.i)] = el.value ?? "";
    });
    return { vista, data: d, registroNombre: reg.nombre, pdfPrefix: reg.pdfPrefix };
  };

  root.querySelectorAll("[data-vista]").forEach((b) => {
    b.addEventListener("click", () => {
      const next = { vista: b.dataset.vista, data: null };
      saveState("marcas_propias", next);
      renderForm("marcas_propias", root, hooks);
    });
  });

  bindActions(root, state, "marcas_propias", hooks, collect);
}

function renderLava(root, state, hooks) {
  const operarios = ["Monica", "Maika", "Maritina", "Tucho", "Pepe", "Leti"];
  const rows = state.filas
    .map(
      (f, i) => `<tr>
      <th>${esc(f.equipo)}</th>
      <td><input data-i="${i}" data-k="temp" value="${esc(f.temp)}" placeholder="ºC"/></td>
      <td><input type="date" data-i="${i}" data-k="fecha" value="${esc(f.fecha)}"/></td>
      <td><input type="time" data-i="${i}" data-k="hora" value="${esc(f.hora)}"/></td>
      <td><select data-i="${i}" data-k="realizado">${opts(operarios, f.realizado)}</select></td>
    </tr>`
    )
    .join("");

  root.innerHTML = `
    <article class="form-sheet">
      ${headerHtml(HEADERS.lava_utiles, "Registro lava útiles")}
      <div class="line-title">Registro lava útiles</div>
      <div class="grid-wrap"><table class="simple-table">
        <thead><tr><th>TESTIGO</th><th>TEMP ºC</th><th>FECHA</th><th>HORA</th><th>REALIZADO POR</th></tr></thead>
        <tbody>${rows}</tbody>
      </table></div>
      <div class="form-grid" style="margin-top:0.75rem">
        <label>Observaciones</label><input id="lava-obs" value="${esc(state.observaciones)}" />
        <label>Supervisado por</label><input id="lava-sup" value="${esc(state.supervisado)}" />
      </div>
      ${actionsHtml()}
    </article>`;

  const collect = () => {
    const filas = state.filas.map((f) => ({ ...f }));
    root.querySelectorAll("[data-i]").forEach((el) => {
      filas[Number(el.dataset.i)][el.dataset.k] = el.value;
    });
    return {
      filas,
      observaciones: root.querySelector("#lava-obs").value,
      supervisado: root.querySelector("#lava-sup").value,
      registroNombre: "REGISTRO LAVA ÚTILES",
      pdfPrefix: "Registro_LavaUtiles",
    };
  };
  bindActions(root, state, "lava_utiles", hooks, collect);
}

function renderTransporte(root, state, hooks) {
  const rows = state.filas
    .map(
      (f, i) => `<tr>
      <td><input type="date" data-i="${i}" data-k="fecha" value="${esc(f.fecha)}"/></td>
      <td><input data-i="${i}" data-k="transportista" value="${esc(f.transportista)}"/></td>
      <td><input data-i="${i}" data-k="matTracora" value="${esc(f.matTracora)}"/></td>
      <td><input data-i="${i}" data-k="matRemolque" value="${esc(f.matRemolque)}"/></td>
      <td><input data-i="${i}" data-k="limpieza" value="${esc(f.limpieza)}"/></td>
      <td><input data-i="${i}" data-k="frio" value="${esc(f.frio)}"/></td>
      <td><input data-i="${i}" data-k="realizado" value="${esc(f.realizado)}"/></td>
    </tr>`
    )
    .join("");

  root.innerHTML = `
    <article class="form-sheet">
      ${headerHtml(HEADERS.transporte, "Calidad del transporte")}
      <div class="line-title">Supervisión calidad del transporte</div>
      <div class="grid-wrap"><table class="simple-table">
        <thead><tr>
          <th>FECHA</th><th>TRANSPORTISTA</th><th>MAT. TRACTORA</th><th>MAT. REMOLQUE</th>
          <th>LIMPIEZA</th><th>FRÍO</th><th>REALIZADO POR</th>
        </tr></thead>
        <tbody>${rows}</tbody>
      </table></div>
      <div class="form-grid" style="margin-top:0.75rem">
        <label>Observaciones</label><input id="tr-obs" value="${esc(state.observaciones)}" />
        <label>Firma supervisor</label><input id="tr-firma" value="${esc(state.firma)}" />
      </div>
      ${footerHtml(HEADERS.transporte_pie, "Notas transporte")}
      ${actionsHtml()}
    </article>`;

  const collect = () => {
    const filas = state.filas.map((f) => ({ ...f }));
    root.querySelectorAll("[data-i]").forEach((el) => {
      filas[Number(el.dataset.i)][el.dataset.k] = el.value;
    });
    return {
      filas,
      observaciones: root.querySelector("#tr-obs").value,
      firma: root.querySelector("#tr-firma").value,
      registroNombre: "REGISTRO CALIDAD TRANSPORTE",
      pdfPrefix: "Registro_Calidad_Transporte",
    };
  };
  bindActions(root, state, "transporte", hooks, collect);
}

function renderDetector(root, state, hooks) {
  const blocks = ["vap", "rechazo", "valorizacion"]
    .map((key) => {
      const title =
        key === "vap" ? "LÍNEA VAP" : key === "rechazo" ? "LÍNEA RECHAZO" : "VALORIZACIÓN";
      const line = state.lineas[key];
      const rows = line.momentos
        .map(
          (m, i) => `<tr>
          <th>${esc(m.momento)}</th>
          <td><select data-l="${key}" data-i="${i}" data-k="fe">${opts(["", "OK", "NO OK"], m.fe)}</select></td>
          <td><select data-l="${key}" data-i="${i}" data-k="nofe">${opts(["", "OK", "NO OK"], m.nofe)}</select></td>
          <td><select data-l="${key}" data-i="${i}" data-k="inox">${opts(["", "OK", "NO OK"], m.inox)}</select></td>
          <td><input data-l="${key}" data-i="${i}" data-k="fechaProg" value="${esc(m.fechaProg)}"/></td>
          <td><input type="time" data-l="${key}" data-i="${i}" data-k="hora" value="${esc(m.hora)}"/></td>
          <td><input data-l="${key}" data-i="${i}" data-k="realizado" value="${esc(m.realizado)}"/></td>
        </tr>`
        )
        .join("");
      return `<div class="card" style="margin-top:0.5rem">
        <h3>${title}</h3>
        <label>Identificación detector</label>
        <input data-iddet="${key}" value="${esc(line.idDetector)}" style="width:100%;min-height:44px;margin:0.35rem 0" />
        <div class="grid-wrap"><table class="simple-table">
          <thead><tr><th>MOMENTO</th><th>Fe 6mm</th><th>No Fe 6mm</th><th>Inox 7mm</th><th>Fecha/Nº prog</th><th>Hora</th><th>Realizado</th></tr></thead>
          <tbody>${rows}</tbody>
        </table></div>
        <label>Supervisado por</label>
        <input data-sup="${key}" value="${esc(line.supervisado)}" style="width:100%;min-height:44px;margin-top:0.35rem" />
      </div>`;
    })
    .join("");

  root.innerHTML = `
    <article class="form-sheet">
      ${headerHtml(HEADERS.detector_metales, "Detector de metales")}
      <div class="line-title">Comprobación detector de metales</div>
      ${blocks}
      ${actionsHtml()}
    </article>`;

  const collect = () => {
    const lineas = JSON.parse(JSON.stringify(state.lineas));
    root.querySelectorAll("[data-iddet]").forEach((el) => {
      lineas[el.dataset.iddet].idDetector = el.value;
    });
    root.querySelectorAll("[data-sup]").forEach((el) => {
      lineas[el.dataset.sup].supervisado = el.value;
    });
    root.querySelectorAll("[data-l]").forEach((el) => {
      lineas[el.dataset.l].momentos[Number(el.dataset.i)][el.dataset.k] = el.value;
    });
    return {
      lineas,
      registroNombre: "REGISTRO DETECTOR METALES",
      pdfPrefix: "Registro_Detector_Metales",
    };
  };
  bindActions(root, state, "detector_metales", hooks, collect);
}

function renderMonthSimple(root, state, id, title, hooks) {
  const rows = DAYS.map((d) => {
    const day = state.dias[d];
    return `<tr>
      <th>${d}</th>
      <td><input data-d="${d}" data-k="estM" value="${esc(day.estM)}"/></td>
      <td><input data-d="${d}" data-k="estT" value="${esc(day.estT)}"/></td>
      <td><input data-d="${d}" data-k="obsM" value="${esc(day.obsM)}"/></td>
      <td><input data-d="${d}" data-k="obsT" value="${esc(day.obsT)}"/></td>
      <td><input data-d="${d}" data-k="realM" value="${esc(day.realM)}"/></td>
      <td><input data-d="${d}" data-k="realT" value="${esc(day.realT)}"/></td>
    </tr>`;
  }).join("");

  root.innerHTML = `
    <article class="form-sheet">
      ${headerHtml(HEADERS.pales, title)}
      <div class="line-title">${esc(title)}</div>
      <div class="form-grid">
        <label>Mes</label><select id="m-mes">${opts(MESES, state.mes)}</select>
        <label>Año</label><input id="m-anio" value="${esc(state.anio)}" />
      </div>
      <div class="grid-wrap" style="margin-top:0.5rem"><table class="simple-table">
        <thead><tr><th>DÍA</th><th>Estado M</th><th>Estado T</th><th>Obs M</th><th>Obs T</th><th>Real. M</th><th>Real. T</th></tr></thead>
        <tbody>${rows}</tbody>
      </table></div>
      <div class="form-grid" style="margin-top:0.5rem">
        <label>Supervisado por</label><input id="m-sup" value="${esc(state.supervisado)}" />
      </div>
      ${actionsHtml()}
    </article>`;

  const collect = () => {
    const dias = JSON.parse(JSON.stringify(state.dias));
    root.querySelectorAll("[data-d]").forEach((el) => {
      dias[el.dataset.d][el.dataset.k] = el.value;
    });
    return {
      mes: root.querySelector("#m-mes").value,
      anio: root.querySelector("#m-anio").value,
      dias,
      supervisado: root.querySelector("#m-sup").value,
      registroNombre: "REGISTRO ESTADO PALÉS",
      pdfPrefix: "Registro_Estado_Pales",
    };
  };
  bindActions(root, state, id, hooks, collect);
}

function renderCuchillos(root, state, hooks) {
  const rows = DAYS.map((d) => {
    const day = state.dias[d];
    return `<tr>
      <th>${d}</th>
      <td><input data-d="${d}" data-k="entran" value="${esc(day.entran)}"/></td>
      <td><input data-d="${d}" data-k="personas" value="${esc(day.personas)}"/></td>
      <td><input data-d="${d}" data-k="retManana" value="${esc(day.retManana)}"/></td>
      <td><input data-d="${d}" data-k="retTarde" value="${esc(day.retTarde)}"/></td>
      <td><input data-d="${d}" data-k="afilado" value="${esc(day.afilado)}"/></td>
      <td><input data-d="${d}" data-k="devueltos" value="${esc(day.devueltos)}"/></td>
      <td><input data-d="${d}" data-k="total" value="${esc(day.total)}"/></td>
      <td><input data-d="${d}" data-k="obs" value="${esc(day.obs)}"/></td>
    </tr>`;
  }).join("");

  root.innerHTML = `
    <article class="form-sheet">
      ${headerHtml(HEADERS.cuchillos, "Control de cuchillos")}
      <div class="line-title">Control de cuchillos producción</div>
      <div class="form-grid">
        <label>Mes</label><select id="c-mes">${opts(MESES, state.mes)}</select>
        <label>Año</label><input id="c-anio" value="${esc(state.anio)}" />
      </div>
      <div class="grid-wrap" style="margin-top:0.5rem"><table class="simple-table">
        <thead><tr>
          <th>DÍA</th><th>Entran sala</th><th>Personas recuento</th><th>Retiran M</th><th>Retiran T</th>
          <th>Afilado</th><th>Devueltos</th><th>Total</th><th>Obs</th>
        </tr></thead>
        <tbody>${rows}</tbody>
      </table></div>
      <div class="form-grid" style="margin-top:0.5rem">
        <label>Supervisado por</label><input id="c-sup" value="${esc(state.supervisado)}" />
      </div>
      ${actionsHtml()}
    </article>`;

  const collect = () => {
    const dias = JSON.parse(JSON.stringify(state.dias));
    root.querySelectorAll("[data-d]").forEach((el) => {
      dias[el.dataset.d][el.dataset.k] = el.value;
    });
    return {
      mes: root.querySelector("#c-mes").value,
      anio: root.querySelector("#c-anio").value,
      dias,
      supervisado: root.querySelector("#c-sup").value,
      registroNombre: "REGISTRO CONTROL CUCHILLOS",
      pdfPrefix: "Registro_Control_Cuchillos",
    };
  };
  bindActions(root, state, "cuchillos", hooks, collect);
}

function renderCutters(root, state, hooks) {
  const rows = DAYS.map((d) => {
    const day = state.dias[d];
    return `<tr>
      <th>${d}</th>
      ${["r1m","r1t","e1m","e1t","r2m","r2t","e2m","e2t","r3m","r3t","e3m","e3t","r4m","r4t","e4m","e4t"]
        .map((k) => `<td><input data-d="${d}" data-k="${k}" value="${esc(day[k])}"/></td>`)
        .join("")}
    </tr>`;
  }).join("");

  root.innerHTML = `
    <article class="form-sheet">
      ${headerHtml(HEADERS.cutters, "Control de cutters")}
      <div class="line-title">Control de cutters</div>
      <div class="form-grid">
        <label>Mes</label><select id="cu-mes">${opts(MESES, state.mes)}</select>
        <label>Año</label><input id="cu-anio" value="${esc(state.anio)}" />
      </div>
      <p class="muted">Por zona: Recogido M/T · Entregado M/T — Expedición / Flejadora / Packing / Envío avión</p>
      <div class="grid-wrap"><table class="simple-table">
        <thead><tr>
          <th>DÍA</th>
          <th colspan="4">1 Expedición</th>
          <th colspan="4">2 Flejadora</th>
          <th colspan="4">3 Packing</th>
          <th colspan="4">4 Avión</th>
        </tr>
        <tr>
          <th></th>
          ${Array(4)
            .fill(0)
            .map(() => "<th>RM</th><th>RT</th><th>EM</th><th>ET</th>")
            .join("")}
        </tr></thead>
        <tbody>${rows}</tbody>
      </table></div>
      <div class="form-grid" style="margin-top:0.5rem">
        <label>Observaciones</label><input id="cu-obs" value="${esc(state.observaciones)}" />
        <label>Firma supervisión</label><input id="cu-firma" value="${esc(state.firma)}" />
      </div>
      ${actionsHtml()}
    </article>`;

  const collect = () => {
    const dias = JSON.parse(JSON.stringify(state.dias));
    root.querySelectorAll("[data-d]").forEach((el) => {
      dias[el.dataset.d][el.dataset.k] = el.value;
    });
    return {
      mes: root.querySelector("#cu-mes").value,
      anio: root.querySelector("#cu-anio").value,
      dias,
      observaciones: root.querySelector("#cu-obs").value,
      firma: root.querySelector("#cu-firma").value,
      registroNombre: "REGISTRO CONTROL CUTTERS",
      pdfPrefix: "Registro_Control_Cutters",
    };
  };
  bindActions(root, state, "cutters", hooks, collect);
}
