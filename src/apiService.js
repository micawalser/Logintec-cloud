import axios from 'axios';
import { API_BASE_URL, BACKEND_PUBLIC_URL, DEFAULT_ESCANEOS_PAGE_SIZE } from './config/api';

class ApiService {

  /**
   * ✅ Realiza el login del usuario.
   * Si es exitoso, guarda el token y los datos del usuario en localStorage.
   * @param {string} email - El email del usuario.
   * @param {string} password - La contraseña del usuario.
   * @returns {Promise<object|null>} Los datos del usuario o null si falla.
   */
  static async login(email, password) {
    // El backend de FastAPI espera los datos en este formato, no como JSON.
    const params = new URLSearchParams();
    params.append('username', email);
    params.append('password', password);

    const response = await axios.post(`${BACKEND_PUBLIC_URL}/auth/token`, params, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    
    if (response.data.access_token) {
      localStorage.setItem('authToken', response.data.access_token);
      
      // Inmediatamente después del login, obtenemos los datos del usuario.
      const userDetails = await this.getCurrentUser();
      localStorage.setItem('userData', JSON.stringify(userDetails));
      return userDetails;
    }
    return null;
  }
  
  /**
   * ✅ Cierra la sesión del usuario, borrando sus datos del navegador.
   */
  static logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
  }

  /**
   * ✅ Obtiene los headers de autenticación con el token del usuario.
   * @returns {object} Los headers para las peticiones a la API.
   */
  static getAuthHeaders() {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error("No hay token de autenticación.");
    }
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }

  /**
   * ✅ Obtiene los datos del usuario actualmente logueado.
   */
  static async getCurrentUser() {
    const response = await axios.get(`${API_BASE_URL}/api/cloud/me`, {
        headers: this.getAuthHeaders()
    });
    return response.data;
  }

  /**
   * ✅ Obtiene la lista de escaneos del usuario logueado.
   */
  static async getEscaneos(limit = 100) {
    const response = await axios.get(`${API_BASE_URL}/api/cloud/escaneos?limit=${limit}`, {
      headers: this.getAuthHeaders()
    });
    return response.data;
  }

  /**
   * ✅ Obtiene las estadísticas del usuario logueado.
   */
  static async getStats() {
    const response = await axios.get(`${API_BASE_URL}/api/cloud/estadisticas`, {
      headers: this.getAuthHeaders()
    });
    return response.data;
  }

  /**
   * ✅ Obtiene una imagen específica de un escaneo.
   */
  static async getImagen(scanId, tipo) {
     const response = await axios.get(`${API_BASE_URL}/api/cloud/escaneo/${scanId}/imagen?tipo=${tipo}`, { 
        headers: this.getAuthHeaders() 
    });
    return response.data;
  }

  // ============================================================================
  // 🆕 NUEVOS ENDPOINTS PARA SITIOS Y MÁQUINAS
  // ============================================================================

  /**
   * 🆕 Obtiene todos los sitios del cliente (usando endpoint real del backend)
   */
  static async getSitios() {
    const response = await axios.get(`${API_BASE_URL}/api/cloud/sitios`, {
      headers: this.getAuthHeaders()
    });
    return response.data;
  }

  /**
   * 🆕 Obtiene todas las máquinas disponibles (usando endpoint real del backend)
   */
  static async getMaquinas() {
    const response = await axios.get(`${API_BASE_URL}/api/cloud/maquinas`, {
      headers: this.getAuthHeaders()
    });
    return response.data;
  }

  /**
   * 🆕 Obtiene escaneos del cliente (usando endpoint real del backend)
   */
  static async getEscaneosCliente(page = 1, pageSize = DEFAULT_ESCANEOS_PAGE_SIZE) {
    const response = await axios.get(`${API_BASE_URL}/api/cloud/escaneos`, {
      headers: this.getAuthHeaders(),
      params: { page, page_size: pageSize }
    });
    return response.data;
  }

  /**
   * 🆕 Crea un nuevo sitio
   */
  static async crearSitio(sitioData) {
    const response = await axios.post(`${API_BASE_URL}/api/cloud/sitios`, sitioData, {
      headers: this.getAuthHeaders()
    });
    return response.data;
  }

  /**
   * 🆕 Actualiza un sitio existente
   */
  static async actualizarSitio(idsitio, sitioData) {
    const response = await axios.put(`${API_BASE_URL}/api/cloud/sitios/${idsitio}`, sitioData, {
      headers: this.getAuthHeaders()
    });
    return response.data;
  }

  /**
   * 🆕 Obtiene escaneos de un sitio específico
   */
  static async getEscaneosPorSitio(idsitio, page = 1, pageSize = DEFAULT_ESCANEOS_PAGE_SIZE) {
    const response = await axios.get(
      `${API_BASE_URL}/api/cloud/sitios/${idsitio}/escaneos?page=${page}&page_size=${pageSize}`, 
      { headers: this.getAuthHeaders() }
    );
    return response.data;
  }

  /**
   * 🆕 Obtiene estadísticas de un sitio específico
   */
  static async getEstadisticasSitio(idsitio) {
    const response = await axios.get(
      `${API_BASE_URL}/api/cloud/sitios/${idsitio}/estadisticas`, 
      { headers: this.getAuthHeaders() }
    );
    return response.data;
  }

  /**
   * 🆕 Obtiene datos del dashboard con información agrupada por sitio
   */
  static async getDashboard() {
    const response = await axios.get(`${API_BASE_URL}/api/cloud/dashboard`, {
      headers: this.getAuthHeaders()
    });
    return response.data;
  }

  /**
   * 🆕 Obtiene máquinas asignadas al cliente
   */
  static async getMaquinasCliente() {
    const response = await axios.get(`${API_BASE_URL}/api/cloud/maquinas`, {
      headers: this.getAuthHeaders()
    });
    return response.data;
  }

  /**
   * 🆕 Obtiene último escaneo por máquina
   */
  static async getUltimoEscaneoPorMaquina() {
    const response = await axios.get(`${API_BASE_URL}/api/cloud/maquinas/ultimo_escaneo`, {
      headers: this.getAuthHeaders()
    });
    return response.data;
  }

  /**
   * 🆕 Obtiene detalles de bultos individuales desde la tabla escanos_detalle
   * @param {number} escaneoId - ID del escaneo principal
   * @returns {Promise<object>} Datos de los bultos individuales
   */
  static async getDetallesBultos(escaneoId) {
    const response = await axios.get(`${API_BASE_URL}/api/cloud/escaneo/${escaneoId}/detalles`, {
      headers: this.getAuthHeaders()
    });
    return response.data;
  }

  /**
   * 🆕 Sube imagen desde máquina Conlida
   * @param {string} token - Token de autenticación del scanner
   * @param {string} serial - Serial del escaneo
   * @param {string} tipo - Tipo de imagen ('3d' o 'camara')
   * @param {File} file - Archivo de imagen
   * @returns {Promise<object>} Respuesta del servidor
   */
  static async uploadImageConlida(token, serial, tipo, file) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('token', token);
    formData.append('serial', serial);
    formData.append('tipo', tipo);

    const response = await axios.post(
      `${API_BASE_URL}/api/upload_image_conlida`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 300000, // 5 minutos de timeout para subida de imágenes
        maxContentLength: 50 * 1024 * 1024, // 50MB máximo
        maxBodyLength: 50 * 1024 * 1024, // 50MB máximo
      }
    );
    return response.data;
  }
}

export default ApiService;