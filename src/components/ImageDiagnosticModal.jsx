import React, { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Typography, Box, Alert, CircularProgress,
  List, ListItem, ListItemText, ListItemIcon,
  Divider, Chip
} from '@mui/material';
import {
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Image as ImageIcon,
  Camera as CameraIcon
} from '@mui/icons-material';

const ImageDiagnosticModal = ({ open, onClose, scanId, tipo, serial }) => {
  const [diagnosticResults, setDiagnosticResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Validar props
  if (!scanId || !tipo || !serial) {
    console.error('ImageDiagnosticModal: Props inválidas', { scanId, tipo, serial });
    return null;
  }

  const runDiagnostic = async () => {
    setLoading(true);
    setDiagnosticResults(null);
    setError(null);

    try {
      const results = {
        timestamp: new Date().toISOString(),
        scanInfo: { scanId, tipo, serial },
        steps: []
      };

      // Paso 1: Verificar autenticación
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          results.steps.push({
            name: 'Verificación de Autenticación',
            status: 'error',
            message: 'No hay token de autenticación',
            details: { token: null }
          });
        } else {
          results.steps.push({
            name: 'Verificación de Autenticación',
            status: 'success',
            message: 'Token encontrado',
            details: { token: token.substring(0, 20) + '...' }
          });
        }
      } catch (error) {
        results.steps.push({
          name: 'Verificación de Autenticación',
          status: 'error',
          message: 'Error verificando autenticación: ' + error.message,
          details: error
        });
      }

      // Paso 2: Verificar conectividad básica
      try {
        const response = await fetch('https://aghbackend.onrender.com/api/cloud/me', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          },
          method: 'GET'
        });
        
        if (response.ok) {
          results.steps.push({
            name: 'Verificación de Conectividad',
            status: 'success',
            message: 'API accesible',
            details: { status: response.status }
          });
        } else {
          results.steps.push({
            name: 'Verificación de Conectividad',
            status: 'error',
            message: `Error HTTP ${response.status}`,
            details: { status: response.status }
          });
        }
      } catch (error) {
        results.steps.push({
          name: 'Verificación de Conectividad',
          status: 'error',
          message: 'Error de conectividad: ' + error.message,
          details: error
        });
      }

      // Paso 3: Probar la imagen específica
      try {
        const response = await fetch(`https://aghbackend.onrender.com/api/cloud/escaneo/${scanId}/imagen?tipo=${tipo}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          results.steps.push({
            name: 'Diagnóstico de Imagen',
            status: 'success',
            message: data.success && data.imagen_base64 ? 'Imagen disponible' : 'Imagen no encontrada',
            details: { 
              success: data.success,
              hasImage: data.success && data.imagen_base64,
              status: response.status
            }
          });
        } else {
          results.steps.push({
            name: 'Diagnóstico de Imagen',
            status: 'error',
            message: `Error HTTP ${response.status}`,
            details: { status: response.status }
          });
        }
      } catch (error) {
        results.steps.push({
          name: 'Diagnóstico de Imagen',
          status: 'error',
          message: 'Error cargando imagen: ' + error.message,
          details: error
        });
      }

      setDiagnosticResults(results);
    } catch (error) {
      console.error('Error en diagnóstico:', error);
      setError(error.message);
      setDiagnosticResults({
        timestamp: new Date().toISOString(),
        scanInfo: { scanId, tipo, serial },
        steps: [{
          name: 'Error en Diagnóstico',
          status: 'error',
          message: error.message,
          details: error
        }]
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success': return <CheckIcon color="success" />;
      case 'error': return <ErrorIcon color="error" />;
      case 'warning': return <WarningIcon color="warning" />;
      default: return <InfoIcon color="info" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success': return 'success.main';
      case 'error': return 'error.main';
      case 'warning': return 'warning.main';
      default: return 'info.main';
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ 
        background: 'linear-gradient(135deg, #6B2C5A 0%, #8E4B7B 100%)', 
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        gap: 2
      }}>
        <ImageIcon />
        <Typography variant="h6">
          Diagnóstico de Imagen - {tipo === '3d' ? '3D' : 'Cámara'}
        </Typography>
      </DialogTitle>
      
      <DialogContent sx={{ p: 3 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>Información del Escaneo</Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Chip label={`Serial: ${serial}`} color="primary" variant="outlined" />
            <Chip label={`ID: ${scanId}`} color="secondary" variant="outlined" />
            <Chip 
              label={`Tipo: ${tipo === '3d' ? 'Imagen 3D' : 'Foto de Cámara'}`} 
              icon={tipo === '3d' ? <ImageIcon /> : <CameraIcon />}
              color="info" 
              variant="outlined" 
            />
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            Error: {error}
          </Alert>
        )}
        
        {!diagnosticResults && !loading && !error && (
          <Alert severity="info" sx={{ mb: 2 }}>
            Haz clic en "Ejecutar Diagnóstico" para verificar el estado de la imagen
          </Alert>
        )}

        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {diagnosticResults && (
          <Box>
            <Typography variant="h6" gutterBottom>Resultados del Diagnóstico</Typography>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
              Ejecutado: {new Date(diagnosticResults.timestamp).toLocaleString('es-AR')}
            </Typography>
            
            <List>
              {diagnosticResults.steps.map((step, index) => (
                <React.Fragment key={index}>
                  <ListItem>
                    <ListItemIcon>
                      {getStatusIcon(step.status)}
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography 
                          variant="subtitle2" 
                          sx={{ color: getStatusColor(step.status), fontWeight: 500 }}
                        >
                          {step.name}
                        </Typography>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" sx={{ mb: 1 }}>
                            {step.message}
                          </Typography>
                          {step.details && (
                            <Typography variant="caption" component="pre" sx={{ 
                              backgroundColor: 'grey.100', 
                              p: 1, 
                              borderRadius: 1,
                              fontSize: '0.7rem',
                              overflow: 'auto'
                            }}>
                              {JSON.stringify(step.details, null, 2)}
                            </Typography>
                          )}
                        </Box>
                      }
                    />
                  </ListItem>
                  {index < diagnosticResults.steps.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>

            {/* Resumen */}
            <Box sx={{ mt: 3, p: 2, backgroundColor: 'grey.50', borderRadius: 2 }}>
              <Typography variant="subtitle2" gutterBottom>Resumen:</Typography>
              {diagnosticResults.steps.every(step => step.status === 'success') ? (
                <Alert severity="success">
                  Todos los diagnósticos pasaron correctamente. La imagen debería estar disponible.
                </Alert>
              ) : (
                <Alert severity="error">
                  Se encontraron problemas. Revisa los detalles arriba para más información.
                </Alert>
              )}
            </Box>
          </Box>
        )}
      </DialogContent>
      
      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose}>Cerrar</Button>
        <Button 
          onClick={runDiagnostic} 
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

export default ImageDiagnosticModal; 