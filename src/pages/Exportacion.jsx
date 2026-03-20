import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Button, TextField, MenuItem,
  FormControl, InputLabel, Select, Alert, Grid, Card, CardContent, CircularProgress
} from '@mui/material';
import {
  FileDownload as FileDownloadIcon,
  GetApp as GetAppIcon,
  Description as DescriptionIcon
} from '@mui/icons-material';
import MachinesSitesService from '../services/machinesSitesService';
import ApiService from '../apiService';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';

const Exportacion = () => {
  const [formato, setFormato] = useState('excel');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [filtroSitio, setFiltroSitio] = useState('');
  const [filtroMaquina, setFiltroMaquina] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [tipoMensaje, setTipoMensaje] = useState('');
  
  // Estados para las opciones de filtros
  const [sitios, setSitios] = useState([]);
  const [maquinas, setMaquinas] = useState([]);
  const [cargandoOpciones, setCargandoOpciones] = useState(true);
  const [exportando, setExportando] = useState(false);

  // Cargar opciones de sitios y máquinas al montar el componente
  useEffect(() => {
    const cargarOpciones = async () => {
      try {
        setCargandoOpciones(true);
        const [sitiosData, maquinasData] = await Promise.all([
          MachinesSitesService.getAllSites(),
          MachinesSitesService.getAllMachines()
        ]);
        setSitios(sitiosData);
        setMaquinas(maquinasData);
      } catch (error) {
        console.error('Error cargando opciones de filtros:', error);
        setMensaje('Error al cargar las opciones de filtros.');
        setTipoMensaje('error');
      } finally {
        setCargandoOpciones(false);
      }
    };
    
    cargarOpciones();
  }, []);

  // Función para obtener todos los escaneos con paginación
  const obtenerTodosLosEscaneos = async () => {
    const todosLosEscaneos = [];
    let pagina = 1;
    let hayMas = true;

    while (hayMas) {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          throw new Error('No hay token de autenticación');
        }

        const response = await axios.get(
          `${API_BASE_URL}/api/cloud/escaneos?page=${pagina}&page_size=100`,
          {
            headers: { 'Authorization': `Bearer ${token}` }
          }
        );

        const { items, total, page_size } = response.data;
        const enriquecidos = (items || []).map(it => ({
          ...MachinesSitesService.enrichScanWithMachineData(it),
          cantidad_bultos: it.cantidad_total_bultos ?? it.cantidad_bultos ?? 1
        }));
        todosLosEscaneos.push(...enriquecidos);

        // Verificar si hay más páginas
        if (items.length < page_size || todosLosEscaneos.length >= total) {
          hayMas = false;
        } else {
          pagina++;
        }
      } catch (error) {
        console.error(`Error obteniendo página ${pagina}:`, error);
        hayMas = false;
      }
    }

    return todosLosEscaneos;
  };

  // Obtener la fecha del escaneo (la API puede devolverla con distintos nombres)
  const getFechaEscaneo = (e) => {
    const raw = e.fecha ?? e.fecha_escaneo ?? e.created_at ?? e.timestamp ?? e.fecha_creacion ?? e.scan_date;
    if (raw == null || raw === '') return null;
    const d = new Date(raw);
    return isNaN(d.getTime()) ? null : raw;
  };

  // Formatear fecha para mostrar (evita N/A si existe en cualquier campo)
  const formatearFecha = (e) => {
    const raw = getFechaEscaneo(e);
    return raw ? new Date(raw).toLocaleString('es-AR') : '';
  };

  // Función para filtrar escaneos
  const filtrarEscaneos = (escaneos) => {
    let filtrados = [...escaneos];

    // Filtrar por fecha
    if (fechaInicio) {
      filtrados = filtrados.filter(e => {
        const raw = getFechaEscaneo(e);
        if (!raw) return false;
        const fechaEscaneo = new Date(raw);
        return !isNaN(fechaEscaneo.getTime()) && fechaEscaneo >= new Date(fechaInicio);
      });
    }

    if (fechaFin) {
      filtrados = filtrados.filter(e => {
        const raw = getFechaEscaneo(e);
        if (!raw) return false;
        const fechaEscaneo = new Date(raw);
        const fechaFinDate = new Date(fechaFin);
        fechaFinDate.setHours(23, 59, 59, 999); // Incluir todo el día
        return !isNaN(fechaEscaneo.getTime()) && fechaEscaneo <= fechaFinDate;
      });
    }

    // Filtrar por sitio
    if (filtroSitio) {
      filtrados = filtrados.filter(e => {
        const sitioNombre = e.site_name || e.sitio?.nombre || '';
        return sitioNombre === filtroSitio;
      });
    }

    // Filtrar por máquina
    if (filtroMaquina) {
      filtrados = filtrados.filter(e => {
        const maquinaNombre = e.machine_name || e.maquina?.nombre || e.maquina_modelo || '';
        return maquinaNombre === filtroMaquina;
      });
    }

    return filtrados;
  };

  // Función para convertir a CSV
  const convertirACSV = (datos) => {
    if (datos.length === 0) return '';

    // Encabezados
    const encabezados = [
      'Serial',
      'Usuario',
      'Máquina',
      'Sitio',
      'Fecha',
      'Ancho (cm)',
      'Largo (cm)',
      'Alto (cm)',
      'Volumen (dm³)',
      'Peso (kg)',
      'Cantidad Bultos'
    ];

    // Filas de datos
    const filas = datos.map(e => {
      const volumen = e.volumen || (e.ancho && e.largo && (e.alto || e.altura) 
        ? e.ancho * e.largo * (e.alto || e.altura) / 1000 
        : null);
      
      return [
        e.serial || '',
        e.usuario_escaneo || e.usuario || '',
        e.machine_name || e.maquina?.nombre || e.maquina_modelo || '',
        e.site_name || e.sitio?.nombre || '',
        formatearFecha(e),
        e.ancho || '',
        e.largo || '',
        e.alto || e.altura || '',
        volumen ? volumen.toFixed(2) : '',
        e.peso || '',
        e.cantidad_bultos || e.cantidad_total_bultos || ''
      ];
    });

    // Combinar encabezados y filas
    const todasLasFilas = [encabezados, ...filas];

    // Convertir a CSV (escapar comillas y valores con comas)
    return todasLasFilas.map(fila => 
      fila.map(campo => {
        const campoStr = String(campo || '');
        if (campoStr.includes(',') || campoStr.includes('"') || campoStr.includes('\n')) {
          return `"${campoStr.replace(/"/g, '""')}"`;
        }
        return campoStr;
      }).join(',')
    ).join('\n');
  };

  // Función para descargar archivo
  const descargarArchivo = (contenido, nombreArchivo, tipoMime) => {
    const blob = new Blob([contenido], { type: tipoMime });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = nombreArchivo;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportar = async () => {
    try {
      setExportando(true);
      setMensaje('');
      setTipoMensaje('info');
      setMensaje('Obteniendo datos de escaneos...');

      // Obtener todos los escaneos
      const todosLosEscaneos = await obtenerTodosLosEscaneos();
      
      if (todosLosEscaneos.length === 0) {
        setTipoMensaje('warning');
        setMensaje('No se encontraron escaneos para exportar.');
        setExportando(false);
        return;
      }

      setMensaje('Aplicando filtros...');
      
      // Aplicar filtros
      const escaneosFiltrados = filtrarEscaneos(todosLosEscaneos);

      if (escaneosFiltrados.length === 0) {
        setTipoMensaje('warning');
        setMensaje('No hay escaneos que coincidan con los filtros seleccionados.');
        setExportando(false);
        return;
      }

      setMensaje('Generando archivo...');

      // Generar archivo según el formato
      const fechaActual = new Date().toISOString().split('T')[0];
      let contenido, nombreArchivo, tipoMime;

      switch (formato) {
        case 'csv':
          contenido = convertirACSV(escaneosFiltrados);
          nombreArchivo = `escaneos_${fechaActual}.csv`;
          tipoMime = 'text/csv;charset=utf-8;';
          break;

        case 'json':
          contenido = JSON.stringify(escaneosFiltrados, null, 2);
          nombreArchivo = `escaneos_${fechaActual}.json`;
          tipoMime = 'application/json';
          break;

        case 'excel':
          // Para Excel, generamos CSV pero con extensión .xlsx
          // Nota: Esto generará un CSV que puede abrirse en Excel
          contenido = convertirACSV(escaneosFiltrados);
          nombreArchivo = `escaneos_${fechaActual}.csv`;
          tipoMime = 'application/vnd.ms-excel';
          break;

        case 'pdf':
          // Para PDF, generamos un texto formateado
          // Nota: Esto es una solución simple, para PDF real necesitarías jsPDF
          const textoPDF = escaneosFiltrados.map((e, idx) => {
            const volumen = e.volumen || (e.ancho && e.largo && (e.alto || e.altura) 
              ? e.ancho * e.largo * (e.alto || e.altura) / 1000 
              : null);
            
            return `
Escaneo ${idx + 1}
Serial: ${e.serial || 'N/A'}
Usuario: ${e.usuario_escaneo || e.usuario || 'N/A'}
Máquina: ${e.machine_name || e.maquina?.nombre || e.maquina_modelo || 'N/A'}
Sitio: ${e.site_name || e.sitio?.nombre || 'N/A'}
Fecha: ${formatearFecha(e) || 'N/A'}
Dimensiones: ${e.ancho || 'N/A'} x ${e.largo || 'N/A'} x ${e.alto || e.altura || 'N/A'} cm
Volumen: ${volumen ? volumen.toFixed(2) + ' dm³' : 'N/A'}
Peso: ${e.peso || 'N/A'} kg
Cantidad Bultos: ${e.cantidad_bultos || e.cantidad_total_bultos || 'N/A'}
${'='.repeat(50)}
            `.trim();
          }).join('\n\n');

          contenido = `REPORTE DE ESCANEOS\nFecha de exportación: ${new Date().toLocaleString('es-AR')}\nTotal de escaneos: ${escaneosFiltrados.length}\n\n${textoPDF}`;
          nombreArchivo = `escaneos_${fechaActual}.txt`;
          tipoMime = 'text/plain';
          break;

        default:
          throw new Error('Formato no soportado');
      }

      // Descargar archivo
      descargarArchivo(contenido, nombreArchivo, tipoMime);

      setTipoMensaje('success');
      setMensaje(`Exportación completada exitosamente. Se exportaron ${escaneosFiltrados.length} escaneos.`);
    } catch (error) {
      console.error('Error al exportar:', error);
      setTipoMensaje('error');
      setMensaje(`Error al exportar los datos: ${error.message || 'Error desconocido'}`);
    } finally {
      setExportando(false);
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
              <FormControl fullWidth>
                <InputLabel>Filtrar por Sitio (opcional)</InputLabel>
                <Select
                  value={filtroSitio}
                  label="Filtrar por Sitio (opcional)"
                  onChange={(e) => setFiltroSitio(e.target.value)}
                  disabled={cargandoOpciones}
                >
                  <MenuItem value="">
                    <em>Todos los sitios</em>
                  </MenuItem>
                  {sitios.map((sitio) => (
                    <MenuItem key={sitio.id} value={sitio.nombre}>
                      {sitio.nombre}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Filtrar por Máquina (opcional)</InputLabel>
                <Select
                  value={filtroMaquina}
                  label="Filtrar por Máquina (opcional)"
                  onChange={(e) => setFiltroMaquina(e.target.value)}
                  disabled={cargandoOpciones}
                >
                  <MenuItem value="">
                    <em>Todas las máquinas</em>
                  </MenuItem>
                  {maquinas.map((maquina) => (
                    <MenuItem key={maquina.id} value={maquina.nombre}>
                      {maquina.nombre}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Botón de exportación */}
              <Button
                variant="contained"
                size="large"
                startIcon={exportando ? <CircularProgress size={20} color="inherit" /> : <FileDownloadIcon />}
                onClick={handleExportar}
                disabled={exportando}
                sx={{
                  mt: 2,
                  py: 1.5,
                  backgroundColor: '#5b3ea3',
                  '&:hover': { backgroundColor: '#3D2A73' },
                  '&:disabled': { backgroundColor: '#9e9e9e' }
                }}
              >
                {exportando ? 'Exportando...' : 'Exportar Datos'}
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






