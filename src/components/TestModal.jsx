import React from 'react';

const TestModal = ({ open, onClose, scanId, tipo, serial }) => {
  console.log('🔄 TestModal renderizando con:', { open, scanId, tipo, serial });

  if (!open) {
    console.log('❌ Modal no está abierto');
    return null;
  }

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
        padding: '20px',
        borderRadius: '8px',
        maxWidth: '500px',
        width: '90%',
        maxHeight: '80vh',
        overflow: 'auto'
      }}>
        <h2>Test Modal - {tipo === '3d' ? '3D' : 'Cámara'}</h2>
        
        <div style={{ marginBottom: '20px' }}>
          <h3>Información del Escaneo</h3>
          <p>Serial: {serial}</p>
          <p>ID: {scanId}</p>
          <p>Tipo: {tipo === '3d' ? 'Imagen 3D' : 'Foto de Cámara'}</p>
        </div>

        <div style={{ 
          padding: '10px', 
          backgroundColor: '#e3f2fd', 
          borderRadius: '4px',
          marginBottom: '20px'
        }}>
          <p>✅ Modal funcionando correctamente</p>
          <p>Si puedes ver esto, el problema no está en el modal básico.</p>
        </div>

        <button 
          onClick={onClose}
          style={{
            backgroundColor: '#6B2C5A',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Cerrar
        </button>
      </div>
    </div>
  );
};

export default TestModal; 