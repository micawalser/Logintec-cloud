/**
 * Utilidades para fechas con zona horaria de Argentina.
 * timestamp_str en PostgreSQL suele ser hora local AR sin sufijo (ej. 2026-06-10T15:01:14).
 */

const ARGENTINA_TZ = 'America/Argentina/Buenos_Aires'
/** Argentina no usa horario de verano desde 2009 */
const ARGENTINA_OFFSET = '-03:00'

const LOCALE_OPTS = {
  timeZone: ARGENTINA_TZ,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
}

function normalizeDateString(input) {
  const trimmed = String(input).trim()
  if (!trimmed) return ''
  if (trimmed.includes(' ') && !trimmed.includes('T')) {
    return trimmed.replace(' ', 'T')
  }
  return trimmed
}

/** true si el string ya trae Z o offset (+/-HH:MM) */
function hasTimezoneInfo(str) {
  return /(?:Z|[+-]\d{2}:?\d{2})$/i.test(str.trim())
}

/**
 * Parsea fechas del backend: naive = hora Argentina; con Z/offset = instante UTC.
 * @param {string|Date|null|undefined} dateInput
 * @returns {Date|null}
 */
export function parseArgentinaDate(dateInput) {
  if (dateInput == null || dateInput === '') return null
  if (dateInput instanceof Date) {
    return Number.isNaN(dateInput.getTime()) ? null : dateInput
  }

  const normalized = normalizeDateString(dateInput)
  if (!normalized) return null

  const iso = hasTimezoneInfo(normalized)
    ? normalized
    : `${normalized}${ARGENTINA_OFFSET}`

  const date = new Date(iso)
  return Number.isNaN(date.getTime()) ? null : date
}

/**
 * Formatea una fecha en formato argentino (dd/mm/yyyy, hh:mm).
 * @param {string|Date} dateInput
 * @returns {string}
 */
export const formatDateArgentina = (dateInput) => {
  if (!dateInput) return 'N/A'

  const date = parseArgentinaDate(dateInput)
  if (!date) return 'Fecha inválida'

  return date.toLocaleString('es-AR', LOCALE_OPTS)
}

/**
 * Obtiene la fecha actual en zona horaria de Argentina
 * @returns {string}
 */
export const getCurrentDateArgentina = () => {
  return new Date().toLocaleString('es-AR', { timeZone: ARGENTINA_TZ })
}

/**
 * Convierte un instante UTC a representación en Argentina
 * @param {string|Date} utcDate
 * @returns {Date}
 */
export const convertUTCToArgentina = (utcDate) => {
  const date = parseArgentinaDate(utcDate)
  if (!date) return new Date(NaN)
  return new Date(date.toLocaleString('en-US', { timeZone: ARGENTINA_TZ }))
}
