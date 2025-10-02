import React, { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Typography, Box, Alert
} from '@mui/material';

const BasicImageDiagnosticModal = ({ open, onClose, scanId, tipo, serial }) => {
  const [message, setMessage] = useState('');

  const runBasicTest = () => {
    try {
      console.log('🔍 Modal básico funcionando');
      console.log('Props recibidas:', { open, scanId, tipo, serial });
      
      const token = localStorage.getItem('authToken');
      console.log('Token encontrado:', token ? 'Sí' : 'No');
      
      setMessage(`Modal funcionando. ScanId: ${scanId}, Tipo: ${tipo}, Serial: ${serial}`);
    } catch (error) {
      console.error('Error en modal básico:', error);
      setMessage(`Error: ${error.message}`);
    }
  };

  console.log('🔄 Renderizando BasicImageDiagnosticModal con props:', { open, scanId, tipo, serial });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Diagnóstico Básico - {tipo === '3d' ? '3D' : 'Cámara'}
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>Información del Escaneo</Typography>
          <Typography variant="body2" color="text.secondary">
            Serial: {serial} | ID: {scanId} | Tipo: {tipo === '3d' ? 'Imagen 3D' : 'Foto de Cámara'}
          </Typography>
        </Box>

        {message && (
          <Alert severity="info" sx={{ mb: 2 }}>
            {message}
          </Alert>
        )}

        <Alert severity="info" sx={{ mb: 2 }}>
          Haz clic en "Probar Básico" para verificar que el modal funciona
        </Alert>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose}>Cerrar</Button>
        <Button onClick={runBasicTest} variant="contained">
          Probar Básico
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BasicImageDiagnosticModal; 