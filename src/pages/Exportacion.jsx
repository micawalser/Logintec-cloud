import React, { useState } from 'react';
import {
  Box, Typography, Paper, Button, TextField, MenuItem,
  FormControl, InputLabel, Select, Alert, Grid, Card, CardContent
} from '@mui/material';
import {
  FileDownload as FileDownloadIcon,
  GetApp as GetAppIcon,
  Description as DescriptionIcon
} from '@mui/icons-material';

const Exportacion = () => {
  const [formato, setFormato] = useState('excel');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [filtroSitio, setFiltroSitio] = useState('');
  const [filtroMaquina, setFiltroMaquina] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [tipoMensaje, setTipoMensaje] = useState('');

  const handleExportar = async () => {
    try {
      // Aquí irá la lógica de exportación
      setTipoMensaje('success');
      setMensaje('Exportación iniciada. El archivo se descargará en breve.');
      
      // Simular exportación
      setTimeout(() => {
        setMensaje('Exportación completada exitosamente.');
      }, 2000);
    } catch (error) {
      setTipoMensaje('error');
      setMensaje('Error al exportar los datos. Por favor, intente nuevamente.');
    }
  };

  return (
    <Box sx={{ py: 3 }}>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 600, color: '#2C2C2C' }}>
        Exportación de Datos
      </Typography>

      <Grid container spacing={3}>
        {/* Panel de Configuración */}
        <Grid item xs={12} md={8}>
          <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" sx={{ mb: 2, color: '#5b3ea3' }}>
              Configuración de Exportación
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {/* Formato de exportación */}
              <FormControl fullWidth>
                <InputLabel>Formato de Exportación</InputLabel>
                <Select
                  value={formato}
                  label="Formato de Exportación"
                  onChange={(e) => setFormato(e.target.value)}
                >
                  <MenuItem value="excel">Excel (.xlsx)</MenuItem>
                  <MenuItem value="csv">CSV (.csv)</MenuItem>
                  <MenuItem value="pdf">PDF (.pdf)</MenuItem>
                  <MenuItem value="json">JSON (.json)</MenuItem>
                </Select>
              </FormControl>

              {/* Rango de fechas */}
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  fullWidth
                  label="Fecha Inicio"
                  type="date"
                  value={fechaInicio}
                  onChange={(e) => setFechaInicio(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
                <TextField
                  fullWidth
                  label="Fecha Fin"
                  type="date"
                  value={fechaFin}
                  onChange={(e) => setFechaFin(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Box>

              {/* Filtros opcionales */}
              <TextField
                fullWidth
                label="Filtrar por Sitio (opcional)"
                value={filtroSitio}
                onChange={(e) => setFiltroSitio(e.target.value)}
                placeholder="Dejar vacío para todos los sitios"
              />

              <TextField
                fullWidth
                label="Filtrar por Máquina (opcional)"
                value={filtroMaquina}
                onChange={(e) => setFiltroMaquina(e.target.value)}
                placeholder="Dejar vacío para todas las máquinas"
              />

              {/* Botón de exportación */}
              <Button
                variant="contained"
                size="large"
                startIcon={<FileDownloadIcon />}
                onClick={handleExportar}
                sx={{
                  mt: 2,
                  py: 1.5,
                  backgroundColor: '#5b3ea3',
                  '&:hover': { backgroundColor: '#3D2A73' }
                }}
              >
                Exportar Datos
              </Button>

              {mensaje && (
                <Alert severity={tipoMensaje} sx={{ mt: 2 }}>
                  {mensaje}
                </Alert>
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Panel de Información */}
        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 2, boxShadow: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <DescriptionIcon sx={{ color: '#5b3ea3', mr: 1 }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Información
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" paragraph>
                Exporta los datos de escaneos según los filtros seleccionados.
                Los datos incluyen información completa de cada escaneo:
              </Typography>
              <Box component="ul" sx={{ pl: 2, mt: 1 }}>
                <li><Typography variant="body2">Número de serie</Typography></li>
                <li><Typography variant="body2">Dimensiones y volumen</Typography></li>
                <li><Typography variant="body2">Peso</Typography></li>
                <li><Typography variant="body2">Fecha y hora</Typography></li>
                <li><Typography variant="body2">Máquina y sitio</Typography></li>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Exportacion;

