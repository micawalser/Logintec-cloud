import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Button, TextField, MenuItem,
  FormControl, InputLabel, Select, Grid, Card, CardContent,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip, CircularProgress, Alert
} from '@mui/material';
import {
  Assessment as AssessmentIcon,
  BarChart as BarChartIcon,
  TrendingUp as TrendingUpIcon,
  DateRange as DateRangeIcon
} from '@mui/icons-material';

const Reportes = () => {
  const [tipoReporte, setTipoReporte] = useState('resumen');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [cargando, setCargando] = useState(false);
  const [datosReporte, setDatosReporte] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    // Cargar datos iniciales si es necesario
  }, []);

  const handleGenerarReporte = async () => {
    setCargando(true);
    setError('');
    setDatosReporte(null);

    try {
      // Aquí irá la lógica para generar el reporte
      // Simular carga
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Datos de ejemplo
      setDatosReporte({
        totalEscaneos: 150,
        volumenTotal: 1250.5,
        pesoTotal: 850.3,
        promedioVolumen: 8.34,
        escaneosPorDia: 12.5
      });
    } catch (err) {
      setError('Error al generar el reporte. Por favor, intente nuevamente.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <Box sx={{ py: 3 }}>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 600, color: '#2C2C2C' }}>
        Reportes y Análisis
      </Typography>

      <Grid container spacing={3}>
        {/* Panel de Configuración */}
        <Grid item xs={12} md={4}>
          <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" sx={{ mb: 2, color: '#5b3ea3' }}>
              Configuración del Reporte
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {/* Tipo de reporte */}
              <FormControl fullWidth>
                <InputLabel>Tipo de Reporte</InputLabel>
                <Select
                  value={tipoReporte}
                  label="Tipo de Reporte"
                  onChange={(e) => setTipoReporte(e.target.value)}
                >
                  <MenuItem value="resumen">Resumen General</MenuItem>
                  <MenuItem value="diario">Reporte Diario</MenuItem>
                  <MenuItem value="semanal">Reporte Semanal</MenuItem>
                  <MenuItem value="mensual">Reporte Mensual</MenuItem>
                  <MenuItem value="por-sitio">Por Sitio</MenuItem>
                  <MenuItem value="por-maquina">Por Máquina</MenuItem>
                </Select>
              </FormControl>

              {/* Rango de fechas */}
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

              {/* Botón de generar */}
              <Button
                variant="contained"
                size="large"
                startIcon={cargando ? <CircularProgress size={20} color="inherit" /> : <AssessmentIcon />}
                onClick={handleGenerarReporte}
                disabled={cargando}
                sx={{
                  mt: 2,
                  py: 1.5,
                  backgroundColor: '#5b3ea3',
                  '&:hover': { backgroundColor: '#3D2A73' }
                }}
              >
                {cargando ? 'Generando...' : 'Generar Reporte'}
              </Button>

              {error && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {error}
                </Alert>
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Panel de Resultados */}
        <Grid item xs={12} md={8}>
          {datosReporte ? (
            <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
              <Typography variant="h6" sx={{ mb: 3, color: '#5b3ea3' }}>
                Resultados del Reporte
              </Typography>

              {/* Tarjetas de resumen */}
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={{ bgcolor: '#e3f2fd', borderRadius: 2 }}>
                    <CardContent>
                      <Typography variant="body2" color="text.secondary">
                        Total Escaneos
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: 600, color: '#1976d2' }}>
                        {datosReporte.totalEscaneos}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={{ bgcolor: '#f3e5f5', borderRadius: 2 }}>
                    <CardContent>
                      <Typography variant="body2" color="text.secondary">
                        Volumen Total
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: 600, color: '#7b1fa2' }}>
                        {datosReporte.volumenTotal.toFixed(2)} dm³
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={{ bgcolor: '#e8f5e9', borderRadius: 2 }}>
                    <CardContent>
                      <Typography variant="body2" color="text.secondary">
                        Peso Total
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: 600, color: '#388e3c' }}>
                        {datosReporte.pesoTotal.toFixed(1)} kg
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={{ bgcolor: '#fff3e0', borderRadius: 2 }}>
                    <CardContent>
                      <Typography variant="body2" color="text.secondary">
                        Promedio Volumen
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: 600, color: '#f57c00' }}>
                        {datosReporte.promedioVolumen.toFixed(2)} dm³
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              {/* Tabla de detalles (ejemplo) */}
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Métrica</TableCell>
                      <TableCell align="right">Valor</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell>Total de Escaneos</TableCell>
                      <TableCell align="right">{datosReporte.totalEscaneos}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Volumen Total</TableCell>
                      <TableCell align="right">{datosReporte.volumenTotal.toFixed(2)} dm³</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Peso Total</TableCell>
                      <TableCell align="right">{datosReporte.pesoTotal.toFixed(1)} kg</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Promedio de Volumen</TableCell>
                      <TableCell align="right">{datosReporte.promedioVolumen.toFixed(2)} dm³</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Escaneos por Día</TableCell>
                      <TableCell align="right">{datosReporte.escaneosPorDia.toFixed(1)}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          ) : (
            <Paper elevation={2} sx={{ p: 4, borderRadius: 2, textAlign: 'center' }}>
              <BarChartIcon sx={{ fontSize: 64, color: '#ccc', mb: 2 }} />
              <Typography variant="body1" color="text.secondary">
                Configure los parámetros y genere un reporte para ver los resultados
              </Typography>
            </Paper>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default Reportes;

