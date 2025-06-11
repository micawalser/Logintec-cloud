// apiService.js - Servicio para conectar con tu backend en Renderr

const API_BASE_URL = 'https://logintec-1.onrender.com';
const API_TOKEN = 'abc123';

// Configuración base para todas las peticiones
const apiConfig = {
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${API_TOKEN}`
  }
};

class ApiService {
  
  // ✅ OBTENER TODOS LOS ESCANEOS
  static async getEscaneos(limit = 100, offset = 0, includeImages = false) {
    try {
      const url = `${API_BASE_URL}/api/escaneos?limit=${limit}&offset=${offset}&include_images=${includeImages}`;
      
      const response = await fetch(url, {
        method: 'GET',
        ...apiConfig
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status} - ${response.statusText}`);
      }

      const data = await response.json();
      return data;
      
    } catch (error) {
      console.error('Error obteniendo escaneos:', error);
      throw error;
    }
  }

  // ✅ OBTENER ESTADÍSTICAS
  static async getStats() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/stats`, {
        method: 'GET',
        ...apiConfig
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status} - ${response.statusText}`);
      }

      const data = await response.json();
      return data;
      
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      throw error;
    }
  }

  // ✅ OBTENER IMAGEN DE UN ESCANEO
  static async getImagen(scanId, tipo) {
    try {
      // tipo puede ser "3d" o "camara"
      const response = await fetch(`${API_BASE_URL}/api/escaneo/${scanId}/imagen/${tipo}`, {
        method: 'GET',
        ...apiConfig
      });

      if (!response.ok) {
        if (response.status === 404) {
          return null; // Imagen no disponible
        }
        throw new Error(`Error: ${response.status} - ${response.statusText}`);
      }

      const data = await response.json();
      return data;
      
    } catch (error) {
      console.error(`Error obteniendo imagen ${tipo}:`, error);
      return null;
    }
  }

  // ✅ PROBAR CONEXIÓN
  static async testConnection() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/test_connection`, {
        method: 'POST',
        ...apiConfig
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status} - ${response.statusText}`);
      }

      const data = await response.json();
      return data;
      
    } catch (error) {
      console.error('Error probando conexión:', error);
      throw error;
    }
  }

  // ✅ OBTENER ESTADO GENERAL (endpoint público)
  static async getHealth() {
    try {
      const response = await fetch(`${API_BASE_URL}/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status} - ${response.statusText}`);
      }

      const data = await response.json();
      return data;
      
    } catch (error) {
      console.error('Error obteniendo estado:', error);
      throw error;
    }
  }

  // ✅ FORMATEAR FECHA PARA MOSTRAR
  static formatDate(dateString) {
    try {
      const date = new Date(dateString);
      return date.toLocaleString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch (error) {
      return dateString; // Devolver original si hay error
    }
  }

  // ✅ CONVERTIR DIMENSIONES DE MM A CM
  static convertToCm(mmValue) {
    return (mmValue / 10).toFixed(1);
  }

  // ✅ CALCULAR VOLUMEN EN CM³
  static calculateVolume(altura, ancho, alto) {
    // Convertir de mm a cm y calcular volumen
    const alturaM = altura / 10;
    const anchoM = ancho / 10;
    const altoM = alto / 10;
    return (alturaM * anchoM * altoM).toFixed(0);
  }
}

export default ApiService;