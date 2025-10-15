// ========================================================================
// IMAGE UTILITIES
// ========================================================================

/**
 * Verifica el estado de autenticación
 * @returns {Object} Estado de autenticación
 */
export const checkAuthStatus = () => {
  const token = localStorage.getItem('authToken');
  return {
    isAuthenticated: !!token,
    token: token,
    timestamp: token ? Date.now() : null
  };
};

/**
 * Verifica la conectividad con la API
 * @returns {Promise<Object>} Estado de conectividad
 */
export const checkApiConnectivity = async () => {
  try {
    const response = await fetch('https://logintec-1.onrender.com/health', {
      method: 'GET',
      timeout: 5000
    });
    
    return {
      isConnected: response.ok,
      status: response.status,
      statusText: response.statusText,
      timestamp: Date.now()
    };
  } catch (error) {
    return {
      isConnected: false,
      error: error.message,
      timestamp: Date.now()
    };
  }
};

/**
 * Diagnostica problemas con imágenes
 * @param {number} scanId - ID del escaneo
 * @param {string} tipo - Tipo de imagen ('3d' o 'camara')
 * @returns {Promise<Object>} Resultado del diagnóstico
 */
export const diagnoseImageProblem = async (scanId, tipo) => {
  const diagnosis = {
    scanId,
    tipo,
    timestamp: Date.now(),
    checks: {}
  };

  try {
    // 1. Verificar autenticación
    const authStatus = checkAuthStatus();
    diagnosis.checks.auth = {
      passed: authStatus.isAuthenticated,
      details: authStatus
    };

    // 2. Verificar conectividad
    const connectivity = await checkApiConnectivity();
    diagnosis.checks.connectivity = {
      passed: connectivity.isConnected,
      details: connectivity
    };

    // 3. Verificar token válido
    if (authStatus.isAuthenticated) {
      try {
        const response = await fetch(`https://logintec-1.onrender.com/api/cloud/escaneo/${scanId}/imagen?tipo=${tipo}`, {
          headers: {
            'Authorization': `Bearer ${authStatus.token}`
          }
        });
        
        diagnosis.checks.imageRequest = {
          passed: response.ok,
          status: response.status,
          statusText: response.statusText
        };

        if (response.ok) {
          const data = await response.json();
          diagnosis.checks.imageData = {
            passed: data.success && !!data.imagen_base64,
            hasImage: data.success,
            hasBase64: !!data.imagen_base64,
            filename: data.filename,
            serial: data.serial
          };
        }
      } catch (error) {
        diagnosis.checks.imageRequest = {
          passed: false,
          error: error.message
        };
      }
    }

    // 4. Resumen del diagnóstico
    const allChecks = Object.values(diagnosis.checks);
    diagnosis.summary = {
      overallStatus: allChecks.every(check => check.passed) ? 'success' : 'error',
      totalChecks: allChecks.length,
      passedChecks: allChecks.filter(check => check.passed).length,
      failedChecks: allChecks.filter(check => !check.passed).length
    };

  } catch (error) {
    diagnosis.error = error.message;
    diagnosis.summary = {
      overallStatus: 'error',
      error: error.message
    };
  }

  return diagnosis;
};

/**
 * Verifica si una imagen existe en el servidor
 * @param {number} scanId - ID del escaneo
 * @param {string} tipo - Tipo de imagen
 * @returns {Promise<boolean>} True si la imagen existe
 */
export const checkImageExists = async (scanId, tipo) => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) return false;

    const response = await fetch(`https://logintec-1.onrender.com/api/cloud/escaneo/${scanId}/imagen?tipo=${tipo}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.ok) {
      const data = await response.json();
      return data.success && !!data.imagen_base64;
    }

    return false;
  } catch (error) {
    console.error('Error checking image existence:', error);
    return false;
  }
};

/**
 * Obtiene información de una imagen sin cargarla completamente
 * @param {number} scanId - ID del escaneo
 * @param {string} tipo - Tipo de imagen
 * @returns {Promise<Object>} Información de la imagen
 */
export const getImageInfo = async (scanId, tipo) => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('No hay token de autenticación');
    }

    const response = await fetch(`https://logintec-1.onrender.com/api/cloud/escaneo/${scanId}/imagen?tipo=${tipo}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    
    return {
      success: data.success,
      filename: data.filename,
      serial: data.serial,
      hasImage: !!data.imagen_base64,
      imageSize: data.imagen_base64 ? data.imagen_base64.length : 0
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};






