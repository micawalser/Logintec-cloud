import React, { useState } from 'react';

const WorkingImageDiagnosticModal = ({ open, onClose, scanId, tipo, serial }) => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const runDiagnostic = async () => {
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      console.log('🔍 Iniciando diagnóstico para:', { scanId, tipo, serial });
      
      // Verificar token
      const token = localStorage.getItem('authToken');
      if (!token) {
        setError('No hay token de autenticación');
        return;
      }

      // Probar la imagen directamente
      const response = await fetch(`https://logintec-1.onrender.com/api/cloud/escaneo/${scanId}/imagen?tipo=${tipo}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      setResult({
        status: response.status,
        success: data.success,
        hasImage: data.success && data.imagen_base64,
        message: data.success && data.imagen_base64 ? 'Imagen disponible' : 'Imagen no encontrada',
        details: data
      });

    } catch (err) {
      console.error('Error en diagnóstico:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 9999
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '12px',
        maxWidth: '600px',
        width: '90%',
        maxHeight: '80vh',
        overflow: 'auto',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)'
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #6B2C5A 0%, #8E4B7B 100%)',
          color: 'white',
          padding: '20px',
          margin: '-30px -30px 20px -30px',
          borderRadius: '12px 12px 0 0',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <span style={{ fontSize: '24px' }}>🔍</span>
          <h2 style={{ margin: 0, fontSize: '20px' }}>
            Diagnóstico de Imagen - {tipo === '3d' ? '3D' : 'Cámara'}
          </h2>
        </div>

        {/* Información del Escaneo */}
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ color: '#6B2C5A', marginBottom: '10px' }}>Información del Escaneo</h3>
          <div style={{ 
            display: 'flex', 
            gap: '10px', 
            flexWrap: 'wrap',
            marginBottom: '15px'
          }}>
            <span style={{
              backgroundColor: '#e3f2fd',
              padding: '5px 10px',
              borderRadius: '15px',
              fontSize: '12px',
              color: '#1976d2'
            }}>
              Serial: {serial}
            </span>
            <span style={{
              backgroundColor: '#f3e5f5',
              padding: '5px 10px',
              borderRadius: '15px',
              fontSize: '12px',
              color: '#7b1fa2'
            }}>
              ID: {scanId}
            </span>
            <span style={{
              backgroundColor: '#e8f5e8',
              padding: '5px 10px',
              borderRadius: '15px',
              fontSize: '12px',
              color: '#388e3c'
            }}>
              Tipo: {tipo === '3d' ? 'Imagen 3D' : 'Foto de Cámara'}
            </span>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            backgroundColor: '#ffebee',
            color: '#c62828',
            padding: '15px',
            borderRadius: '8px',
            marginBottom: '20px',
            border: '1px solid #ffcdd2'
          }}>
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Resultado */}
        {result && (
          <div style={{
            backgroundColor: result.hasImage ? '#e8f5e8' : '#fff3e0',
            color: result.hasImage ? '#2e7d32' : '#f57c00',
            padding: '15px',
            borderRadius: '8px',
            marginBottom: '20px',
            border: `1px solid ${result.hasImage ? '#c8e6c9' : '#ffcc02'}`
          }}>
            <h4 style={{ margin: '0 0 10px 0' }}>Resultado del Diagnóstico:</h4>
            <p style={{ margin: '5px 0' }}><strong>Status:</strong> {result.status}</p>
            <p style={{ margin: '5px 0' }}><strong>Mensaje:</strong> {result.message}</p>
            {result.hasImage && (
              <p style={{ margin: '10px 0 0 0', fontWeight: 'bold' }}>
                ✅ La imagen está disponible y debería cargar correctamente.
              </p>
            )}
            {!result.hasImage && result.status === 200 && (
              <p style={{ margin: '10px 0 0 0', fontWeight: 'bold' }}>
                ⚠️ La API responde correctamente pero no hay imagen disponible.
              </p>
            )}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            padding: '40px',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '15px'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              border: '4px solid #f3f3f3',
              borderTop: '4px solid #6B2C5A',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}></div>
            <p style={{ margin: 0, color: '#666' }}>Ejecutando diagnóstico...</p>
          </div>
        )}

        {/* Instrucciones iniciales */}
        {!result && !loading && !error && (
          <div style={{
            backgroundColor: '#e3f2fd',
            color: '#1976d2',
            padding: '15px',
            borderRadius: '8px',
            marginBottom: '20px',
            border: '1px solid #bbdefb'
          }}>
            <p style={{ margin: 0 }}>
              Haz clic en "Ejecutar Diagnóstico" para verificar el estado de la imagen
            </p>
          </div>
        )}

        {/* Botones */}
        <div style={{
          display: 'flex',
          gap: '10px',
          justifyContent: 'flex-end',
          marginTop: '20px'
        }}>
          <button 
            onClick={onClose}
            style={{
              backgroundColor: '#f5f5f5',
              color: '#333',
              border: '1px solid #ddd',
              padding: '10px 20px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Cerrar
          </button>
          <button 
            onClick={runDiagnostic} 
            disabled={loading}
            style={{
              backgroundColor: loading ? '#ccc' : '#6B2C5A',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '6px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: 'bold'
            }}
          >
            {loading ? 'Ejecutando...' : 'Ejecutar Diagnóstico'}
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default WorkingImageDiagnosticModal; 