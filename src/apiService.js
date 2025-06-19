import axios from 'axios';

// La URL de tu backend. Para desarrollo, apunta al servidor local.
const API_BASE_URL = 'http://127.0.0.1:8000';

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

    const response = await axios.post(`${API_BASE_URL}/auth/token`, params, {
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
}

export default ApiService;
