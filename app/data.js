/** Datos y definición de campos — equivalentes a LISTAS / CONFIG del Excel */

export const DEFAULT_CONFIG = {
  asunto: "Registro Seguimiento Marcas Propias",
  cuerpo: "Buenos días, se adjunta el registro para su revisión.",
  destinatarios: [
    "foodplant.ssf@stolt.com",
    "j.reylago@stolt.com",
    "m.formoso@external.stolt.com",
    "r.nunez@stolt.com",
  ],
  copia: "ma.riveira.da.costa@stolt.com",
  carpetaPdfNota: "En tablet: el PDF se descarga / comparte (equivalente a K:\\...\\Registros)",
};

export const DEFAULT_LISTAS = {
  marcas: [
    "Carrefour",
    "Coop",
    "Oye",
    "Metro Francia",
    "NO ASC",
    "Metro Italia",
    "Metro Alemania",
  ],
  granjas: [
    "Lira",
    "Quilmas",
    "Couso",
    "Palmeira",
    "Merexo",
    "Vilán",
    "Cervo",
    "Anglet",
    "Tocha",
    "Oye",
    "Hafnir",
  ],
  checks: ["si", "No", "N/A"],
  tiposMarchamo: [
    "Metro Francia",
    "Metro Italia",
    "Coop Portugal",
    "Coop España",
    "Neptura",
  ],
  tiposEtiqueta: [
    "ASC",
    "No ASC/Protocolo 1",
    "Coop",
    "Metro Alemania",
    "Metro Italia",
    "Metro Francia",
  ],
  encargados: ["Juan Rey", "Roberto N", "Maika"],
  supervisores: ["Diego", "Roberto", "Isma", "Mary Jo", "Erica"],
};

/** Campos obligatorios según CONFIG del Excel */
export const CAMPOS_OBLIGATORIOS = {
  fechaEmpaque: true,
  producto: false,
  marcaPropia: true,
  granja: true,
  checkOrigen: true,
  fechaDespesque: true,
  fechaEtiqueta: true,
  fechaSalida: true,
  fechaMarchamo: true,
  tipoMarchamo: true,
  tipoEtiqueta: true,
  vaciadoLinea: true,
  checkMarchamo: true,
  checkCambioFechaEtq: true,
  encargado: true,
  marelSupervisor: true,
  observaciones: false,
};

export const META = {
  codigo: "F7.2-01-00-02",
  revision: "6",
  fechaDoc: "06/26",
};

export const REGISTROS = {
  principal: {
    id: "principal",
    nombre: "REGISTRO LÍNEA PRINCIPAL",
    tituloLinea: "Línea principal",
    hoja: "2 de 3",
    headerImg: "assets/header-principal.png",
    pdfPrefix: "Registro_Linea_Principal",
    columnas: 8,
    campos: [
      { key: "fechaEmpaque", label: "FECHA\nEMPAQUE", type: "date" },
      { key: "producto", label: "PRODUCTO", type: "text" },
      { key: "marcaPropia", label: "MARCA PROPIA/\nPRODUCTO NO\nASC", type: "select", list: "marcas" },
      { key: "granja", label: "GRANJA", type: "select", list: "granjas" },
      { key: "checkOrigen", label: "CHECK ORIGEN\n(Ver pie página)", type: "select", list: "checks" },
      { key: "fechaDespesque", label: "FECHA\nDESPESQUE", type: "date" },
      { key: "fechaEtiqueta", label: "FECHA\nETIQUETA", type: "date" },
      { key: "fechaSalida", label: "FECHA SALIDA", type: "date" },
      { key: "fechaMarchamo", label: "FECHA\nMARCHAMO", type: "date" },
      { key: "tipoMarchamo", label: "TIPO\nMARCHAMO", type: "select", list: "tiposMarchamo" },
      { key: "tipoEtiqueta", label: "TIPO ETIQUETA", type: "select", list: "tiposEtiqueta", highlight: true },
      { key: "vaciadoLinea", label: "VACIADO LÍNEA", type: "text" },
      { key: "checkMarchamo", label: "CHECK\nMARCHAMO", type: "select", list: "checks" },
      { key: "checkCambioFechaEtq", label: "CHECK CAMBIO\nFECHA ETQ", type: "select", list: "checks" },
      { key: "encargado", label: "ENCARGADO", type: "select", list: "encargados" },
      { key: "marelSupervisor", label: "MAREL\nSUPERVISOR", type: "select", list: "supervisores" },
      { key: "observaciones", label: "OBSERVACIONES", type: "text", spanAll: true },
    ],
  },
  vap: {
    id: "vap",
    nombre: "REGISTRO LÍNEA VAP",
    tituloLinea: "Línea VAP",
    hoja: "3 de 3",
    headerImg: "assets/header-vap.png",
    pdfPrefix: "Registro_Linea_VAP",
    columnas: 8,
    campos: [
      { key: "fechaEmpaque", label: "FECHA\nEMPAQUE", type: "date" },
      { key: "producto", label: "PRODUCTO", type: "text" },
      { key: "marcaPropia", label: "MARCA PROPIA/\nPRODUCTO NO\nASC", type: "select", list: "marcas" },
      { key: "granja", label: "GRANJA", type: "select", list: "granjas" },
      { key: "checkOrigen", label: "CHECK ORIGEN\n(Ver pie página)", type: "select", list: "checks" },
      { key: "fechaDespesque", label: "FECHA\nDESPESQUE", type: "date" },
      { key: "fechaEtiqueta", label: "FECHA\nETIQUETA", type: "date" },
      { key: "fechaSalida", label: "FECHA SALIDA", type: "date" },
      { key: "tipoEtiqueta", label: "TIPO ETIQUETA", type: "select", list: "tiposEtiqueta", highlight: true },
      { key: "checkCambioFechaEtq", label: "CHECK CAMBIO\nFECHA ETQ", type: "select", list: "checks" },
      { key: "encargado", label: "ENCARGADO", type: "select", list: "encargados" },
      { key: "marelSupervisor", label: "MAREL\nSUPERVISOR", type: "select", list: "supervisores" },
      { key: "observaciones", label: "OBSERVACIONES", type: "text", spanAll: true },
    ],
  },
};

export const STORAGE_KEYS = {
  config: "rmp_config",
  listas: "rmp_listas",
  historico: "rmp_historico",
  draft: (id) => `rmp_draft_${id}`,
};
