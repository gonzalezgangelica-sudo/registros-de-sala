/** Encabezados oficiales de cada formulario (como en el .xlsm) */

export const DOC_HEADERS = {
  marcas_propias_principal: {
    titulo: "REGISTRO SEGUIMIENTO ESPECIFICACIONES MARCAS PROPIAS / PROTOCOLO 1",
    codigo: "F7.2-01-00-02",
    revision: "6",
    fecha: "06/26",
    hoja: "2 de 3",
    img: "assets/headers/marcas_principal.png",
    pie: "assets/headers/marcas_pie.png",
  },
  marcas_propias_vap: {
    titulo: "REGISTRO SEGUIMIENTO ESPECIFICACIONES MARCAS PROPIAS / PROTOCOLO 1",
    codigo: "F7.2-01-00-02",
    revision: "6",
    fecha: "06/26",
    hoja: "3 de 3",
    img: "assets/headers/marcas_vap.png",
    pie: "assets/headers/marcas_pie.png",
  },
  detector_metales: {
    titulo: "COMPROBACIÓN DEL DETECTOR DE METALES",
    codigo: "F7.5-01-13-01",
    revision: "9",
    fecha: "07/24",
    hoja: "2 de 2",
    img: "assets/headers/detector_metales.png",
  },
  lava_utiles: {
    titulo: "COMPROBACIÓN DE TEMPERATURAS DEL LAVA ÚTILES",
    codigo: "F6.3-01-06-02",
    revision: "3",
    fecha: "09/24",
    hoja: "2 de 2",
    img: "assets/headers/lava_utiles.png",
    pie: "assets/headers/lava_utiles_pie.png",
  },
  transporte: {
    titulo: "SUPERVISIÓN DE LA CALIDAD DEL TRANSPORTE",
    codigo: "F7.5-01-00-05",
    revision: "4",
    fecha: "09/24",
    hoja: "2 de 2",
    img: "assets/headers/transporte.png",
    pie: "assets/headers/transporte_pie.png",
  },
  pales: {
    titulo: "SUPERVISIÓN DEL ESTADO DE LOS PALÉS DE MADERA",
    codigo: "F7.5-01-00-07",
    revision: "2",
    fecha: "05/25",
    hoja: "2 de 2",
    img: "assets/headers/pales.png",
  },
  cuchillos: {
    titulo: "CONTROL DE CUCHILLOS DE PRODUCCIÓN",
    codigo: "F7.5-01-07-02",
    revision: "3",
    fecha: "05/24",
    hoja: "2 de 2",
    img: "assets/headers/cuchillos.png",
  },
  cutters: {
    titulo: "CONTROL DE CUTTERS",
    codigo: "F7.5-01-07-01",
    revision: "4",
    fecha: "11/24",
    hoja: "2 de 2",
    img: "assets/headers/cutters.png",
  },
};

const CACHE_BUST = "20260806";

function esc(s) {
  return String(s ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

/** Cabecera visual idéntica al Excel: imagen oficial + bloque HTML de respaldo */
export function excelHeaderHtml(key) {
  const h = DOC_HEADERS[key];
  if (!h) return "";
  const img = `${h.img}?v=${CACHE_BUST}`;
  return `
  <div class="excel-header-wrap">
    <div class="doc-header">
      <img src="${img}" alt="${esc(h.titulo)}" onerror="this.style.display='none'; this.nextElementSibling.style.display='grid';" />
      <div class="excel-header-fallback" style="display:none" aria-hidden="true">
        <div class="eh-brand">Stolt Sea Farm <span class="eh-logo">S</span></div>
        <div class="eh-mid">
          <div class="eh-form">FORMULARIO</div>
          <div class="eh-title">${esc(h.titulo)}</div>
        </div>
        <div class="eh-meta">
          <div>Código:</div><div>${esc(h.codigo)}</div>
          <div>Revisión:</div><div>${esc(h.revision)}</div>
          <div>Fecha:</div><div>${esc(h.fecha)}</div>
          <div>Hoja:</div><div>${esc(h.hoja)}</div>
        </div>
      </div>
    </div>
  </div>`;
}

export function excelFooterHtml(key) {
  const h = DOC_HEADERS[key];
  if (!h?.pie) return "";
  return `<div class="footer-notes"><img src="${h.pie}?v=${CACHE_BUST}" alt="Notas del formulario" /></div>`;
}
