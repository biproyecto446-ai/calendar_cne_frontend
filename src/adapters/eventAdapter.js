/**
 * Adaptador de eventos: normaliza filas externas (Google Sheet, CSV, API)
 * al formato interno del calendario sin romper fuentes existentes.
 *
 * Columnas del Google Sheet (formato externo):
 *   Fecha, Hora Inicio, Hora Final, Actividad, Descripcion, Responsable,
 *   Tipo, Componentes, Enlace
 *
 * Formato interno (camelCase, area como array):
 *   fecha, horaInicio, horaFin, actividad, descripcion, responsable,
 *   tipo, area, enlace, id?, prioridad?
 */

/** Nombres de columnas del Google Sheet (pub/html / export CSV) */
export const EXTERNAL_COLUMNS = [
  "Fecha",
  "Hora Inicio",
  "Hora Final",
  "Actividad",
  "Descripcion",
  "Responsable",
  "Tipo",
  "Componentes",
  "Enlace",
]

/**
 * Para cada campo interno, posibles nombres en la fila (externo o interno).
 * El primero de cada lista que exista en la fila se usa.
 */
const KEY_ALIASES = {
  id: ["id", "Id", "ID"],
  fecha: ["Fecha", "fecha"],
  horaInicio: ["Hora Inicio", "hora_inicio", "horaInicio", "Hora", "hora"],
  horaFin: ["Hora Final", "hora_final", "Hora Fin", "horaFin"],
  actividad: ["Actividad", "actividad"],
  descripcion: ["Descripcion", "descripcion"],
  responsable: ["Responsable", "responsable"],
  tipo: ["Tipo", "tipo"],
  prioridad: ["Prioridad", "prioridad"],
  area: ["Componentes", "Area", "area"],
  enlace: ["Enlace", "enlace"],
}

const pick = (row, aliases) => {
  if (!row || typeof row !== "object") return undefined
  for (const key of aliases) {
    if (Object.prototype.hasOwnProperty.call(row, key)) {
      const v = row[key]
      if (v !== undefined && v !== null && String(v).trim() !== "") return v
    }
  }
  return undefined
}

/**
 * Parsea "Componentes" (texto con comas o punto y coma) a array de strings.
 */
export function parseComponentes(value) {
  if (value == null) return []
  const s = String(value).trim()
  if (!s) return []
  const split = s.split(/[,;]/).map((x) => x.trim()).filter(Boolean)
  return Array.isArray(value) ? value : split
}

/**
 * Normaliza una fila (externo o interno) al formato interno.
 * Acepta tanto columnas del Sheet (Hora Final, Componentes) como internas (horaFin, area).
 *
 * @param {Object} row - Fila cruda (objeto con claves externas o internas)
 * @param {number} index - Índice para generar id por defecto
 * @returns {Object|null} - Fila interna o null si no hay fecha/actividad
 */
export function normalizeRow(row, index = 0) {
  if (!row || typeof row !== "object") return null

  const fecha = pick(row, KEY_ALIASES.fecha)
  const actividad = pick(row, KEY_ALIASES.actividad)
  if (!fecha) return null

  const rawArea = pick(row, KEY_ALIASES.area)
  const area = Array.isArray(rawArea)
    ? rawArea.filter(Boolean)
    : parseComponentes(rawArea)

  return {
    id: pick(row, KEY_ALIASES.id) || undefined,
    fecha: fecha ? String(fecha).trim() : "",
    horaInicio: pick(row, KEY_ALIASES.horaInicio) ? String(pick(row, KEY_ALIASES.horaInicio)).trim() : "09:00",
    horaFin: pick(row, KEY_ALIASES.horaFin) ? String(pick(row, KEY_ALIASES.horaFin)).trim() : "10:00",
    actividad: actividad ? String(actividad).trim() : "Actividad",
    descripcion: pick(row, KEY_ALIASES.descripcion) ? String(pick(row, KEY_ALIASES.descripcion)).trim() : "",
    responsable: pick(row, KEY_ALIASES.responsable) ? String(pick(row, KEY_ALIASES.responsable)).trim() : "Sin asignar",
    tipo: pick(row, KEY_ALIASES.tipo) ? String(pick(row, KEY_ALIASES.tipo)).trim() : "General",
    prioridad: pick(row, KEY_ALIASES.prioridad) ? String(pick(row, KEY_ALIASES.prioridad)).trim() : "Media",
    area,
    enlace: pick(row, KEY_ALIASES.enlace) ? String(pick(row, KEY_ALIASES.enlace)).trim() : "",
  }
}

/**
 * Normaliza un array de filas al formato interno.
 * Filtra filas que no tengan al menos fecha o actividad.
 *
 * @param {Array<Object>} rows - Filas crudas (API, CSV, Sheet)
 * @returns {Array<Object>} - Filas en formato interno
 */
export function normalizeRows(rows) {
  if (!Array.isArray(rows)) return []
  return rows
    .map((row, index) => normalizeRow(row, index))
    .filter(Boolean)
}
