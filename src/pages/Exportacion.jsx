import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  MenuItem,
  Alert,
  Grid,
  Chip,
  Divider,
  Checkbox,
  IconButton,
  CircularProgress,
} from '@mui/material';
import {
  FileDownload as DownloadIcon,
  Description as FileTextIcon,
  FilterList as FilterIcon,
  CheckBox as CheckSquareIcon,
  Schedule as ClockIcon,
  FileDownloadOutlined as FileDownIcon,
  CalendarMonth as CalendarIcon,
  DataObject as JsonIcon,
} from '@mui/icons-material';

/** BOM UTF-8: Excel/Bloc de notas en Windows interpretan bien tildes (Máquina, no MÃ¡quina). */
const UTF8_BOM = '\uFEFF';
import MachinesSitesService from '../services/machinesSitesService';
import axios from 'axios';
import { API_BASE_URL, DEFAULT_ESCANEOS_PAGE_SIZE } from '../config/api';
import { formatDateArgentina, parseArgentinaDate } from '../utils/dateUtils';

const HISTORY_KEY = 'logintec_export_history';
const MAX_HISTORY = 8;

const FIELD_DEFS = [
  { id: 'serial', label: 'Serial', default: true },
  { id: 'usuario', label: 'Usuario', default: true },
  { id: 'fecha', label: 'Fecha', default: true },
  { id: 'maquina', label: 'Máquina', default: true },
  { id: 'sitio', label: 'Sitio', default: true },
  { id: 'ancho', label: 'Ancho (cm)', default: true },
  { id: 'largo', label: 'Largo (cm)', default: true },
  { id: 'alto', label: 'Alto (cm)', default: true },
  { id: 'volumen', label: 'Volumen (dm³)', default: true },
  { id: 'peso', label: 'Peso (kg)', default: true },
  { id: 'cantidad_bultos', label: 'Cantidad de Bultos', default: false },
];

function loadHistory() {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveHistory(entry) {
  const prev = loadHistory();
  const next = [entry, ...prev].slice(0, MAX_HISTORY);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
  return next;
}

const Exportacion = () => {
  const [formato, setFormato] = useState('csv');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [filtroSitio, setFiltroSitio] = useState('');
  const [filtroMaquina, setFiltroMaquina] = useState('');
  const [selectedFields, setSelectedFields] = useState(
    () => FIELD_DEFS.filter((f) => f.default).map((f) => f.id),
  );
  const [mensaje, setMensaje] = useState('');
  const [tipoMensaje, setTipoMensaje] = useState('');
  const [sitios, setSitios] = useState([]);
  const [maquinas, setMaquinas] = useState([]);
  const [cargandoOpciones, setCargandoOpciones] = useState(true);
  const [exportando, setExportando] = useState(false);
  const [totalEscaneos, setTotalEscaneos] = useState(null);
  const [historial, setHistorial] = useState(loadHistory);

  useEffect(() => {
    const cargarOpciones = async () => {
      try {
        setCargandoOpciones(true);
        const [sitiosData, maquinasData] = await Promise.all([
          MachinesSitesService.getAllSites(),
          MachinesSitesService.getAllMachines(),
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

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) return;
    axios
      .get(`${API_BASE_URL}/api/cloud/escaneos?page=1&page_size=1`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(({ data }) => setTotalEscaneos(data?.total ?? null))
      .catch(() => setTotalEscaneos(null));
  }, []);

  const getFechaEscaneo = (e) => {
    const raw = e.fecha ?? e.fecha_escaneo ?? e.created_at ?? e.timestamp ?? e.timestamp_str ?? e.fecha_creacion ?? e.scan_date;
    return parseArgentinaDate(raw);
  };

  const formatearFecha = (e) => {
    const d = getFechaEscaneo(e);
    return d ? formatDateArgentina(d) : '';
  };

  /** La máquina se identifica por el modelo de catálogo, no por el número de serie de la unidad. */
  const getModeloMaquina = (e) => e.maquina?.modelo || e.maquina_modelo || e.machine_model || '';

  const getFieldValue = (e, fieldId) => {
    const volumen =
      e.volumen ||
      (e.ancho && e.largo && (e.alto || e.altura)
        ? (e.ancho * e.largo * (e.alto || e.altura)) / 1000
        : null);

    switch (fieldId) {
      case 'serial':
        return e.serial || '';
      case 'usuario':
        return e.usuario_escaneo || e.usuario || '';
      case 'fecha':
        return formatearFecha(e);
      case 'maquina':
        return getModeloMaquina(e);
      case 'sitio':
        return e.site_name || e.sitio?.nombre || '';
      case 'ancho':
        return e.ancho ?? '';
      case 'largo':
        return e.largo ?? '';
      case 'alto':
        return e.alto ?? e.altura ?? '';
      case 'volumen':
        return volumen != null ? Number(volumen).toFixed(2) : '';
      case 'peso':
        return e.peso ?? '';
      case 'cantidad_bultos':
        return e.cantidad_bultos ?? e.cantidad_total_bultos ?? '';
      default:
        return '';
    }
  };

  const obtenerTodosLosEscaneos = async () => {
    const todosLosEscaneos = [];
    let pagina = 1;
    let hayMas = true;

    while (hayMas) {
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('No hay token de autenticación');

      const response = await axios.get(
        `${API_BASE_URL}/api/cloud/escaneos?page=${pagina}&page_size=${DEFAULT_ESCANEOS_PAGE_SIZE}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      const { items, total, page_size } = response.data;
      const enriquecidos = (items || []).map((it) => ({
        ...MachinesSitesService.enrichScanWithMachineData(it),
        cantidad_bultos: it.cantidad_total_bultos ?? it.cantidad_bultos ?? 1,
      }));
      todosLosEscaneos.push(...enriquecidos);

      if (items.length < page_size || todosLosEscaneos.length >= total) {
        hayMas = false;
      } else {
        pagina++;
      }
    }

    return todosLosEscaneos;
  };

  const filtrarEscaneos = useCallback(
    (escaneos) => {
      let filtrados = [...escaneos];

      if (fechaInicio) {
        filtrados = filtrados.filter((e) => {
          const fechaEscaneo = getFechaEscaneo(e);
          return fechaEscaneo && fechaEscaneo >= new Date(fechaInicio);
        });
      }

      if (fechaFin) {
        filtrados = filtrados.filter((e) => {
          const fechaEscaneo = getFechaEscaneo(e);
          if (!fechaEscaneo) return false;
          const fechaFinDate = new Date(fechaFin);
          fechaFinDate.setHours(23, 59, 59, 999);
          return fechaEscaneo <= fechaFinDate;
        });
      }

      if (filtroSitio) {
        filtrados = filtrados.filter((e) => {
          const sitioNombre = e.site_name || e.sitio?.nombre || '';
          return sitioNombre === filtroSitio;
        });
      }

      if (filtroMaquina) {
        filtrados = filtrados.filter((e) => getModeloMaquina(e) === filtroMaquina);
      }

      return filtrados;
    },
    [fechaInicio, fechaFin, filtroSitio, filtroMaquina],
  );

  const fieldsActivos = useMemo(
    () => FIELD_DEFS.filter((f) => selectedFields.includes(f.id)),
    [selectedFields],
  );

  /** Varias unidades instaladas comparten modelo: el desplegable lista modelos, no unidades. */
  const modelosMaquina = useMemo(
    () => [...new Set(maquinas.map((m) => m.modelo).filter(Boolean))]
      .sort((a, b) => a.localeCompare(b, 'es')),
    [maquinas],
  );

  const convertirACSV = (datos, fields = fieldsActivos) => {
    if (datos.length === 0 || fields.length === 0) return '';

    const encabezados = fields.map((f) => f.label);
    const filas = datos.map((e) => fields.map((f) => getFieldValue(e, f.id)));

    const todasLasFilas = [encabezados, ...filas];
    return todasLasFilas
      .map((fila) =>
        fila
          .map((campo) => {
            const campoStr = String(campo ?? '');
            if (campoStr.includes(',') || campoStr.includes('"') || campoStr.includes('\n')) {
              return `"${campoStr.replace(/"/g, '""')}"`;
            }
            return campoStr;
          })
          .join(','),
      )
      .join('\r\n');
  };

  const convertirATxt = (datos, fields = fieldsActivos) => {
    if (datos.length === 0 || fields.length === 0) return '';

    const encabezado = [
      'REPORTE DE ESCANEOS',
      `Fecha de exportación: ${new Date().toLocaleString('es-AR')}`,
      `Total de escaneos: ${datos.length}`,
      '',
    ].join('\r\n');

    const cuerpo = datos
      .map((e, idx) => {
        const lineas = fields.map((f) => `${f.label}: ${getFieldValue(e, f.id) || 'N/A'}`);
        return [`Escaneo ${idx + 1}`, ...lineas, '='.repeat(50)].join('\r\n');
      })
      .join('\r\n\r\n');

    return `${encabezado}\r\n${cuerpo}`;
  };

  const descargarArchivo = (contenido, nombreArchivo, tipoMime, usarBomUtf8 = false) => {
    const payload = usarBomUtf8 ? UTF8_BOM + contenido : contenido;
    const blob = new Blob([payload], { type: tipoMime });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = nombreArchivo;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const periodoLabel = useMemo(() => {
    if (fechaInicio && fechaFin) return `${fechaInicio} — ${fechaFin}`;
    if (fechaInicio) return `Desde ${fechaInicio}`;
    if (fechaFin) return `Hasta ${fechaFin}`;
    return 'Todo el historial';
  }, [fechaInicio, fechaFin]);

  const registrosEstimadosLabel = useMemo(() => {
    if (totalEscaneos == null) return '—';
    const hayFiltros = fechaInicio || fechaFin || filtroSitio || filtroMaquina;
    if (hayFiltros) return 'Según filtros al exportar';
    return `~${totalEscaneos.toLocaleString('es-AR')}`;
  }, [totalEscaneos, fechaInicio, fechaFin, filtroSitio, filtroMaquina]);

  const toggleField = (fieldId) => {
    setSelectedFields((prev) =>
      prev.includes(fieldId) ? prev.filter((id) => id !== fieldId) : [...prev, fieldId],
    );
  };

  const generarArchivo = (escaneosFiltrados, formatoExport, fields = fieldsActivos) => {
    const fechaActual = new Date().toISOString().split('T')[0];

    switch (formatoExport) {
      case 'csv':
        return {
          contenido: convertirACSV(escaneosFiltrados, fields),
          nombreArchivo: `escaneos_${fechaActual}.csv`,
          tipoMime: 'text/csv;charset=utf-8',
          label: 'CSV',
          usarBomUtf8: true,
        };
      case 'txt':
        return {
          contenido: convertirATxt(escaneosFiltrados, fields),
          nombreArchivo: `escaneos_${fechaActual}.txt`,
          tipoMime: 'text/plain;charset=utf-8',
          label: 'TXT',
          usarBomUtf8: true,
        };
      case 'json': {
        const jsonRows = escaneosFiltrados.map((e) => {
          const row = {};
          fields.forEach((f) => {
            row[f.id] = getFieldValue(e, f.id);
          });
          return row;
        });
        return {
          contenido: JSON.stringify(jsonRows, null, 2),
          nombreArchivo: `escaneos_${fechaActual}.json`,
          tipoMime: 'application/json',
          label: 'JSON',
        };
      }
      default:
        return {
          contenido: convertirACSV(escaneosFiltrados, fields),
          nombreArchivo: `escaneos_${fechaActual}.csv`,
          tipoMime: 'text/csv;charset=utf-8',
          label: 'CSV',
          usarBomUtf8: true,
        };
    }
  };

  const ejecutarExportacion = async (opts = {}) => {
    const formatoExport = opts.formato ?? formato;
    const fieldsExport = opts.selectedFields
      ? FIELD_DEFS.filter((f) => opts.selectedFields.includes(f.id))
      : fieldsActivos;
    const filtrarCon = opts.filtrar ?? filtrarEscaneos;

    setExportando(true);
    setMensaje('');
    setTipoMensaje('info');
    setMensaje('Obteniendo datos de escaneos...');

    const todosLosEscaneos = await obtenerTodosLosEscaneos();

    if (todosLosEscaneos.length === 0) {
      setTipoMensaje('warning');
      setMensaje('No se encontraron escaneos para exportar.');
      setExportando(false);
      return null;
    }

    setMensaje('Aplicando filtros...');
    const escaneosFiltrados = filtrarCon(todosLosEscaneos);

    if (escaneosFiltrados.length === 0) {
      setTipoMensaje('warning');
      setMensaje('No hay escaneos que coincidan con los filtros seleccionados.');
      setExportando(false);
      return null;
    }

    if (fieldsExport.length === 0) {
      setTipoMensaje('error');
      setMensaje('Seleccioná al menos un campo para exportar.');
      setExportando(false);
      return null;
    }

    setMensaje('Generando archivo...');
    const { contenido, nombreArchivo, tipoMime, label, usarBomUtf8 } = generarArchivo(
      escaneosFiltrados,
      formatoExport,
      fieldsExport,
    );
    descargarArchivo(contenido, nombreArchivo, tipoMime, usarBomUtf8);

    const entry = {
      id: Date.now(),
      fecha: new Date().toLocaleString('es-AR'),
      formato: label,
      registros: escaneosFiltrados.length,
      nombreArchivo,
      config: { formato: formatoExport, fechaInicio, fechaFin, filtroSitio, filtroMaquina, selectedFields },
    };
    setHistorial(saveHistory(entry));

    setTipoMensaje('success');
    setMensaje(`Exportación completada. Se exportaron ${escaneosFiltrados.length} escaneos.`);
    setExportando(false);
    return entry;
  };

  const handleExportar = async () => {
    try {
      await ejecutarExportacion();
    } catch (error) {
      console.error('Error al exportar:', error);
      setTipoMensaje('error');
      setMensaje(`Error al exportar los datos: ${error.message || 'Error desconocido'}`);
      setExportando(false);
    }
  };

  const reexportarHistorial = async (item) => {
    if (!item?.config) return;
    const cfg = item.config;
    const filtrarHistorial = (escaneos) => {
      let filtrados = [...escaneos];
      if (cfg.fechaInicio) {
        filtrados = filtrados.filter((e) => {
          const d = getFechaEscaneo(e);
          return d && d >= new Date(cfg.fechaInicio);
        });
      }
      if (cfg.fechaFin) {
        filtrados = filtrados.filter((e) => {
          const d = getFechaEscaneo(e);
          if (!d) return false;
          const fin = new Date(cfg.fechaFin);
          fin.setHours(23, 59, 59, 999);
          return d <= fin;
        });
      }
      if (cfg.filtroSitio) {
        filtrados = filtrados.filter((e) => (e.site_name || e.sitio?.nombre || '') === cfg.filtroSitio);
      }
      if (cfg.filtroMaquina) {
        filtrados = filtrados.filter((e) => getModeloMaquina(e) === cfg.filtroMaquina);
      }
      return filtrados;
    };
    try {
      await ejecutarExportacion({
        formato: cfg.formato,
        selectedFields: cfg.selectedFields,
        filtrar: filtrarHistorial,
      });
    } catch (error) {
      setTipoMensaje('error');
      setMensaje(error.message || 'Error al reexportar');
      setExportando(false);
    }
  };

  const cardSx = {
    p: 3,
    borderRadius: 3,
    bgcolor: 'var(--card)',
    border: '1px solid var(--border)',
    boxShadow: 'none',
  };

  const formatCardSx = (active) => ({
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 1.5,
    p: 3,
    borderRadius: 3,
    border: '2px solid',
    borderColor: active ? 'var(--primary)' : 'var(--border)',
    bgcolor: active ? 'rgba(91, 62, 163, 0.06)' : 'transparent',
    cursor: 'pointer',
    transition: 'border-color 160ms ease, background-color 160ms ease',
    '&:hover': {
      borderColor: active ? 'var(--primary)' : 'var(--muted-foreground)',
    },
  });

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box>
        <Typography sx={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--foreground)' }}>
          Exportación de Datos
        </Typography>
        <Typography sx={{ mt: 0.5, fontSize: '0.9rem', color: 'var(--muted-foreground)' }}>
          Exporta los escaneos a CSV o TXT con los filtros que necesites
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Formato */}
            <Paper sx={cardSx}>
              <Typography sx={{ fontSize: '1rem', fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <FileDownIcon sx={{ color: 'var(--primary)' }} />
                Formato de Exportación
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                <Box onClick={() => setFormato('csv')} sx={formatCardSx(formato === 'csv')}>
                  {formato === 'csv' && (
                    <Box sx={{ position: 'absolute', top: 12, right: 12, width: 8, height: 8, borderRadius: '50%', bgcolor: 'var(--primary)' }} />
                  )}
                  <FileTextIcon sx={{ fontSize: 40, color: formato === 'csv' ? 'var(--primary)' : 'var(--muted-foreground)' }} />
                  <Typography sx={{ fontWeight: 600 }}>CSV</Typography>
                  <Typography sx={{ fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>Valores separados por coma</Typography>
                </Box>
                <Box onClick={() => setFormato('txt')} sx={formatCardSx(formato === 'txt')}>
                  {formato === 'txt' && (
                    <Box sx={{ position: 'absolute', top: 12, right: 12, width: 8, height: 8, borderRadius: '50%', bgcolor: 'var(--primary)' }} />
                  )}
                  <FileTextIcon sx={{ fontSize: 40, color: formato === 'txt' ? 'var(--primary)' : 'var(--muted-foreground)' }} />
                  <Typography sx={{ fontWeight: 600 }}>TXT</Typography>
                  <Typography sx={{ fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>Reporte legible en texto plano</Typography>
                </Box>
              </Box>
              <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Chip
                  size="small"
                  icon={<JsonIcon />}
                  label="JSON"
                  onClick={() => setFormato('json')}
                  variant={formato === 'json' ? 'filled' : 'outlined'}
                  sx={formato === 'json' ? { bgcolor: 'var(--primary)', color: '#fff' } : {}}
                />
              </Box>
            </Paper>

            {/* Filtros */}
            <Paper sx={cardSx}>
              <Typography sx={{ fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
                <FilterIcon sx={{ color: 'var(--primary)' }} />
                Filtros
              </Typography>
              <Typography sx={{ fontSize: '0.85rem', color: 'var(--muted-foreground)', mb: 2 }}>
                Define el rango de fechas y otros filtros para la exportación
              </Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography sx={{ fontSize: '0.8rem', color: 'var(--muted-foreground)', mb: 0.75 }}>Fecha Inicio</Typography>
                  <TextField
                    fullWidth
                    type="date"
                    size="small"
                    value={fechaInicio}
                    onChange={(e) => setFechaInicio(e.target.value)}
                    InputProps={{
                      startAdornment: <CalendarIcon sx={{ mr: 1, fontSize: 18, color: 'var(--muted-foreground)' }} />,
                    }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography sx={{ fontSize: '0.8rem', color: 'var(--muted-foreground)', mb: 0.75 }}>Fecha Fin</Typography>
                  <TextField
                    fullWidth
                    type="date"
                    size="small"
                    value={fechaFin}
                    onChange={(e) => setFechaFin(e.target.value)}
                    InputProps={{
                      startAdornment: <CalendarIcon sx={{ mr: 1, fontSize: 18, color: 'var(--muted-foreground)' }} />,
                    }}
                  />
                </Grid>
              </Grid>
              <Divider sx={{ my: 2, borderColor: 'var(--border)' }} />
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography sx={{ fontSize: '0.8rem', color: 'var(--muted-foreground)', mb: 0.75 }}>Sitio</Typography>
                  <TextField
                    select
                    fullWidth
                    size="small"
                    value={filtroSitio}
                    onChange={(e) => setFiltroSitio(e.target.value)}
                    disabled={cargandoOpciones}
                  >
                    <MenuItem value="">Todos los sitios</MenuItem>
                    {sitios.map((sitio) => (
                      <MenuItem key={sitio.id} value={sitio.nombre}>
                        {sitio.nombre}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography sx={{ fontSize: '0.8rem', color: 'var(--muted-foreground)', mb: 0.75 }}>Máquina</Typography>
                  <TextField
                    select
                    fullWidth
                    size="small"
                    value={filtroMaquina}
                    onChange={(e) => setFiltroMaquina(e.target.value)}
                    disabled={cargandoOpciones}
                  >
                    <MenuItem value="">Todas las máquinas</MenuItem>
                    {modelosMaquina.map((modelo) => (
                      <MenuItem key={modelo} value={modelo}>
                        {modelo}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
              </Grid>
            </Paper>

            {/* Campos */}
            <Paper sx={cardSx}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2, flexWrap: 'wrap', gap: 1 }}>
                <Box>
                  <Typography sx={{ fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CheckSquareIcon sx={{ color: 'var(--primary)' }} />
                    Campos a Exportar
                  </Typography>
                  <Typography sx={{ fontSize: '0.85rem', color: 'var(--muted-foreground)' }}>
                    Seleccioná los campos que querés incluir
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button size="small" onClick={() => setSelectedFields(FIELD_DEFS.map((f) => f.id))}>
                    Seleccionar todos
                  </Button>
                  <Button size="small" onClick={() => setSelectedFields([])}>
                    Limpiar
                  </Button>
                </Box>
              </Box>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', sm: '1fr 1fr 1fr' }, gap: 1.25 }}>
                {FIELD_DEFS.map((field) => {
                  const checked = selectedFields.includes(field.id);
                  return (
                    <Box
                      key={field.id}
                      onClick={() => toggleField(field.id)}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        p: 1.25,
                        borderRadius: 2,
                        border: '1px solid',
                        borderColor: checked ? 'rgba(91, 62, 163, 0.45)' : 'var(--border)',
                        bgcolor: checked ? 'rgba(91, 62, 163, 0.06)' : 'transparent',
                        cursor: 'pointer',
                      }}
                    >
                      <Checkbox checked={checked} size="small" sx={{ p: 0 }} />
                      <Typography sx={{ fontSize: '0.85rem' }}>{field.label}</Typography>
                    </Box>
                  );
                })}
              </Box>
            </Paper>

            {mensaje && (
              <Alert severity={tipoMensaje || 'info'}>{mensaje}</Alert>
            )}
          </Box>
        </Grid>

        {/* Panel lateral */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, position: { lg: 'sticky' }, top: { lg: 88 } }}>
            <Paper sx={cardSx}>
              <Typography sx={{ fontSize: '1rem', fontWeight: 700, mb: 2 }}>Resumen</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography sx={{ fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>Formato</Typography>
                  <Chip label={formato.toUpperCase()} size="small" sx={{ bgcolor: 'rgba(91, 62, 163, 0.12)', color: 'var(--primary)', fontWeight: 700 }} />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography sx={{ fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>Campos seleccionados</Typography>
                  <Typography sx={{ fontWeight: 700 }}>{selectedFields.length}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography sx={{ fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>Período</Typography>
                  <Typography sx={{ fontWeight: 600, fontSize: '0.8rem', textAlign: 'right', maxWidth: '55%' }}>{periodoLabel}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography sx={{ fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>Registros estimados</Typography>
                  <Typography sx={{ fontWeight: 700 }}>{registrosEstimadosLabel}</Typography>
                </Box>
              </Box>
              <Divider sx={{ my: 2, borderColor: 'var(--border)' }} />
              <Button
                fullWidth
                variant="contained"
                disabled={exportando || selectedFields.length === 0}
                onClick={handleExportar}
                startIcon={exportando ? <CircularProgress size={18} color="inherit" /> : <DownloadIcon />}
                sx={{
                  py: 1.25,
                  fontWeight: 700,
                  bgcolor: '#5b3ea3',
                  '&:hover': { bgcolor: '#3D2A73' },
                }}
              >
                {exportando ? 'Exportando...' : 'Exportar Datos'}
              </Button>
              {selectedFields.length === 0 && (
                <Typography sx={{ mt: 1, fontSize: '0.75rem', color: 'error.main', textAlign: 'center' }}>
                  Seleccioná al menos un campo
                </Typography>
              )}
            </Paper>

            <Paper sx={cardSx}>
              <Typography sx={{ fontSize: '1rem', fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <ClockIcon sx={{ color: 'var(--primary)' }} />
                Exportaciones Recientes
              </Typography>
              {historial.length === 0 ? (
                <Typography sx={{ fontSize: '0.85rem', color: 'var(--muted-foreground)' }}>
                  Todavía no hay exportaciones en este navegador.
                </Typography>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
                  {historial.map((item) => (
                    <Box
                      key={item.id}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        p: 1.5,
                        borderRadius: 2,
                        bgcolor: 'rgba(255,255,255,0.03)',
                        border: '1px solid var(--border)',
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
                        <FileTextIcon sx={{ color: 'var(--muted-foreground)' }} />
                        <Box sx={{ minWidth: 0 }}>
                          <Typography sx={{ fontSize: '0.875rem', fontWeight: 600 }}>
                            {item.registros.toLocaleString('es-AR')} registros
                          </Typography>
                          <Typography sx={{ fontSize: '0.75rem', color: 'var(--muted-foreground)' }} noWrap>
                            {item.fecha} · {item.formato}
                          </Typography>
                        </Box>
                      </Box>
                      <IconButton
                        size="small"
                        onClick={() => reexportarHistorial(item)}
                        disabled={exportando}
                        sx={{ color: 'var(--primary)' }}
                        title="Volver a exportar con la misma configuración"
                      >
                        <DownloadIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  ))}
                </Box>
              )}
            </Paper>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Exportacion;
