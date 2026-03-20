import React, { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Typography, Box, Alert, CircularProgress
} from '@mui/material';
import { Image as ImageIcon } from '@mui/icons-material';

const SimpleImageDiagnosticModal = ({ open, onClose, scanId, tipo, serial }) => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const runSimpleDiagnostic = async () => {
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      console.log('🔍 Iniciando diagnóstico simple para:', { scanId, tipo, serial });
      
      // Verificar token
      const token = localStorage.getItem('authToken');
      if (!token) {
        setError('No hay token de autenticación');
        return;
      }

      // Probar la imagen directamente
      const response = await fetch(`https://aghbackend.onrender.com/api/cloud/escaneo/${scanId}/imagen?tipo=${tipo}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      setResult({
        status: response.status,
        success: data.success,
        hasImage: data.success && data.imagen_base64,
        message: data.success && data.imagen_base64 ? 'Imagen disponible' : 'Imagen no encontrada'
      });

    } catch (err) {
      console.error('Error en diagnóstico simple:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ 
        background: 'linear-gradient(135deg, #6B2C5A 0%, #8E4B7B 100%)', 
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        gap: 2
      }}>
        <ImageIcon />
        <Typography variant="h6">
          Diagnóstico Simple - {tipo === '3d' ? '3D' : 'Cámara'}
        </Typography>
      </DialogTitle>
      
      <DialogContent sx={{ p: 3 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>Información del Escaneo</Typography>
          <Typography variant="body2" color="text.secondary">
            Serial: {serial} | ID: {scanId} | Tipo: {tipo === '3d' ? 'Imagen 3D' : 'Foto de Cámara'}
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            Error: {error}
          </Alert>
        )}

        {result && (
          <Alert severity={result.hasImage ? 'success' : 'warning'} sx={{ mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Resultado del Diagnóstico:
            </Typography>
            <Typography variant="body2">
              Status: {result.status} | {result.message}
            </Typography>
            {result.hasImage && (
              <Typography variant="body2" sx={{ mt: 1 }}>
                ✅ La imagen está disponible y debería cargar correctamente.
              </Typography>
            )}
          </Alert>
        )}

        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {!result && !loading && !error && (
          <Alert severity="info" sx={{ mb: 2 }}>
            Haz clic en "Ejecutar Diagnóstico" para verificar el estado de la imagen
          </Alert>
        )}
      </DialogContent>
      
      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose}>Cerrar</Button>
        <Button 
          onClick={runSimpleDiagnostic} 
          variant="contained" 
          disabled={loading}
          startIcon={loading ? <CircularProgress size={16} /> : null}
        >
          {loading ? 'Ejecutando...' : 'Ejecutar Diagnóstico'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SimpleImageDiagnosticModal; 