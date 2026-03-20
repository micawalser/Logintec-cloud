// ========================================================================
// IMAGE SYNC UTILITIES
// ========================================================================

/**
 * Verifica si las imágenes de un escaneo están sincronizadas
 * @param {Object} escaneo - Datos del escaneo
 * @returns {Promise<Object>} Estado de sincronización
 */
export const checkImageSync = async (escaneo) => {
  const token = localStorage.getItem('authToken');
  if (!token) {
    return { error: 'No hay token de autenticación' };
  }

  const results = {
    scanId: escaneo.id,
    serial: escaneo.serial,
    images: {
      '3d': { expected: false, actual: false, filename: null },
      'camara': { expected: false, actual: false, filename: null }
    }
  };

  // Verificar imagen 3D
  if (escaneo.tiene_imagen_3d) {
    results.images['3d'].expected = true;
    results.images['3d'].filename = escaneo.imagen_3d_filename;
    
    try {
      const response = await fetch(`https://aghbackend.onrender.com/api/cloud/escaneo/${escaneo.id}/imagen?tipo=3d`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        results.images['3d'].actual = data.success && !!data.imagen_base64;
      }
    } catch (error) {
      console.error('Error verificando imagen 3D:', error);
    }
  }

  // Verificar imagen de cámara
  if (escaneo.tiene_imagen_camara) {
    results.images['camara'].expected = true;
    results.images['camara'].filename = escaneo.imagen_camara_filename;
    
    try {
      const response = await fetch(`https://aghbackend.onrender.com/api/cloud/escaneo/${escaneo.id}/imagen?tipo=camara`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        results.images['camara'].actual = data.success && !!data.imagen_base64;
      }
    } catch (error) {
      console.error('Error verificando imagen cámara:', error);
    }
  }

  return results;
};

/**
 * Verifica la sincronización de múltiples escaneos
 * @param {Array} escaneos - Lista de escaneos
 * @returns {Promise<Object>} Resumen de sincronización
 */
export const checkMultipleImageSync = async (escaneos) => {
  console.log('🔍 Verificando sincronización de imágenes...');
  
  const results = {
    total: escaneos.length,
    withImages: 0,
    synced: 0,
    desynced: 0,
    details: []
  };

  for (const escaneo of escaneos.slice(0, 10)) { // Limitar a 10 para no sobrecargar
    const syncResult = await checkImageSync(escaneo);
    
    if (syncResult.error) {
      console.error('Error en sincronización:', syncResult.error);
      continue;
    }

    const hasExpectedImages = syncResult.images['3d'].expected || syncResult.images['camara'].expected;
    const hasActualImages = syncResult.images['3d'].actual || syncResult.images['camara'].actual;
    
    if (hasExpectedImages) {
      results.withImages++;
      
      if (hasExpectedImages === hasActualImages) {
        results.synced++;
      } else {
        results.desynced++;
        results.details.push({
          serial: syncResult.serial,
          scanId: syncResult.scanId,
          issues: []
        });
        
        if (syncResult.images['3d'].expected && !syncResult.images['3d'].actual) {
          results.details[results.details.length - 1].issues.push('Imagen 3D faltante');
        }
        if (syncResult.images['camara'].expected && !syncResult.images['camara'].actual) {
          results.details[results.details.length - 1].issues.push('Imagen cámara faltante');
        }
      }
    }
  }

  return results;
};

/**
 * Genera un reporte de sincronización
 * @param {Object} syncResults - Resultados de verificación
 * @returns {string} Reporte formateado
 */
export const generateSyncReport = (syncResults) => {
  let report = `📊 REPORTE DE SINCRONIZACIÓN DE IMÁGENES\n\n`;
  report += `Total escaneos verificados: ${syncResults.total}\n`;
  report += `Escaneos con imágenes esperadas: ${syncResults.withImages}\n`;
  report += `Escaneos sincronizados: ${syncResults.synced}\n`;
  report += `Escaneos desincronizados: ${syncResults.desynced}\n\n`;
  
  if (syncResults.desynced > 0) {
    report += `❌ ESCANEOS CON PROBLEMAS:\n`;
    syncResults.details.forEach(detail => {
      report += `• ${detail.serial} (ID: ${detail.scanId}): ${detail.issues.join(', ')}\n`;
    });
  } else {
    report += `✅ Todos los escaneos están sincronizados correctamente.`;
  }
  
  return report;
};



















