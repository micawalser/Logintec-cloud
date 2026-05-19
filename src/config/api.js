/**
 * Backend en Render (o VITE_API_BASE_URL si lo defines).
 */
const DEFAULT_BACKEND = 'https://aghbackend.onrender.com'
const fromEnv = import.meta.env.VITE_API_BASE_URL && String(import.meta.env.VITE_API_BASE_URL).trim()

const escaneosPageFromEnv = import.meta.env.VITE_ESCANEOS_PAGE_SIZE
const escaneosPageParsed =
  escaneosPageFromEnv != null && String(escaneosPageFromEnv).trim() !== ''
    ? parseInt(String(escaneosPageFromEnv).trim(), 10)
    : NaN

/**
 * Filas por página en GET /api/cloud/escaneos. Valores bajos reducen RAM en el worker
 * (Render free ~512MB); sube con VITE_ESCANEOS_PAGE_SIZE si tu plan tiene más memoria.
 */
export const DEFAULT_ESCANEOS_PAGE_SIZE = Number.isFinite(escaneosPageParsed) && escaneosPageParsed > 0
  ? escaneosPageParsed
  : 15

/**
 * Host público del backend: usado solo para POST /auth/token (login directo, sin proxy).
 * Así evitamos el error 500 que a veces daba el proxy de Vite con ese endpoint.
 */
export const BACKEND_PUBLIC_URL = fromEnv || DEFAULT_BACKEND

/**
 * Base para rutas `/api/...`. Siempre URL absoluta del backend (también en dev con Vite).
 * Así no pasas por el proxy de Node (evita 502/503 falsos por timeout o TLS del proxy).
 * El backend debe permitir CORS desde tu origen (p. ej. `http://localhost:5173`).
 * Para otro host: `VITE_API_BASE_URL=https://tu-api.example`.
 */
export const API_BASE_URL = fromEnv || DEFAULT_BACKEND

export default API_BASE_URL
