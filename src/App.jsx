import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
  Box, TextField, Button, Paper, Typography, AppBar, Toolbar,
  Tabs, Tab, Container, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, ThemeProvider, createTheme, CircularProgress,
  Alert, Chip, Dialog, DialogContent, DialogTitle, IconButton, Tooltip, Fab, CssBaseline, MenuItem
} from '@mui/material';
import {
  Visibility as ViewIcon,
  Image as ImageIcon,
  Camera as CameraIcon,
  Close as CloseIcon,
  Refresh as RefreshIcon,
  Assessment as AssessmentIcon,
  Logout as LogoutIcon,
  Search as SearchIcon,
  Clear as ClearIcon
} from '@mui/icons-material';

// ✅ IMPORT MÁQUINAS Y SITIOS
import MachinesSites from './pages/MachinesSites';
import MachinesSitesService from './services/machinesSitesService';

// ========================================================================
// THEME CONFIGURATION
// ========================================================================
const theme = createTheme({
  palette: {
    primary: {
      main: '#6B2C5A',
      light: '#8E4B7B',
      dark: '#4A1E3F',
    },
    secondary: {
      main: '#7CB342',
      light: '#A4D96C',
      dark: '#5A8F2E',
    },
    background: {
      default: '#FAFAFA',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#2C2C2C',
      secondary: '#666666',
    }
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: { fontWeight: 600, color: '#2C2C2C' },
    h5: { fontWeight: 500, color: '#2C2C2C' },
    h6: { fontWeight: 500, color: '#2C2C2C' }
  },
  components: {
    MuiAppBar: { styleOverrides: { root: { background: 'linear-gradient(135deg, #6B2C5A 0%, #8E4B7B 100%)', boxShadow: '0 4px 20px rgba(107, 44, 90, 0.3)' } } },
    MuiPaper: { styleOverrides: { root: { borderRadius: 12, boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)' } } },
    MuiButton: { styleOverrides: { contained: { borderRadius: 8, textTransform: 'none', fontWeight: 500, boxShadow: '0 4px 12px rgba(107, 44, 90, 0.3)', '&:hover': { boxShadow: '0 6px 16px rgba(107, 44, 90, 0.4)' } }, outlined: { borderRadius: 8, textTransform: 'none', fontWeight: 500 } } },
    MuiTableCell: { styleOverrides: { head: { backgroundColor: '#F5F5F5', fontWeight: 600, color: '#2C2C2C' } } },
    MuiTabs: { styleOverrides: { root: { backgroundColor: '#FFFFFF', borderRadius: '12px 12px 0 0', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }, indicator: { backgroundColor: '#6B2C5A', height: 3 } } },
    MuiTab: { styleOverrides: { root: { textTransform: 'none', fontWeight: 500, fontSize: '0.95rem', color: '#666666', '&.Mui-selected': { color: '#6B2C5A', fontWeight: 600 } } } },
  },
});

// ========================================================================
// API COMMUNICATION
// ========================================================================
const API_BASE_URL = 'https://logintec-1.onrender.com';
const pageSize = 100;

// getAuthHeaders como función normal fuera de los componentes
const getAuthHeaders = () => ({
  'Authorization': `Bearer ${localStorage.getItem('authToken')}`
});

const api = {
  login: (usuario, password) => {
    const params = new URLSearchParams();
    params.append('username', usuario);
    params.append('password', password);
    return axios.post(`${API_BASE_URL}/auth/token`, params);
  },
  fetchCurrentUser: () => axios.get(`${API_BASE_URL}/api/cloud/me`, { headers: getAuthHeaders() }),
  fetchEscaneos: (page = 1) => axios.get(`${API_BASE_URL}/api/cloud/escaneos?page=${page}&page_size=${pageSize}`, { headers: getAuthHeaders() }),
  fetchStats: () => axios.get(`${API_BASE_URL}/api/cloud/estadisticas`, { headers: getAuthHeaders() }),
  fetchImage: (scanId, tipo) => axios.get(
    `${API_BASE_URL}/api/cloud/escaneo/${scanId}/imagen?tipo=${tipo}`,
    { headers: getAuthHeaders(), timeout: 30000 }
  )
};

// ========================================================================
// UTILITY & FORMATTING FUNCTIONS
// ========================================================================
const formatDate = (dateInput) => {
    if (!dateInput) return 'N/A';
    let date;
    if (typeof dateInput === 'string') {
        const isoUtcDateTime = dateInput.replace(' ', 'T') + 'Z';
        date = new Date(isoUtcDateTime);
    } else {
        date = new Date(dateInput);
    }
    if (isNaN(date.getTime())) {
        return 'Fecha inválida';
    }
    return date.toLocaleString('es-AR', {
        timeZone: 'America/Argentina/Buenos_Aires',
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', hourCycle: 'h23'
    });
};

const formatDimensionCm = (mmValue) => {
    if (mmValue === null || mmValue === undefined || mmValue === '') return 'N/A';
    const numValue = parseFloat(mmValue);
    return isNaN(numValue) ? mmValue : (numValue / 10).toFixed(1);
};

const formatVolume3Decimals = (volumenMm3) => {
    if (!volumenMm3 && volumenMm3 !== 0) return 'N/A';
    return `${(volumenMm3 / 1000000).toFixed(3)} dm³`;
};

const getSafeValue = (obj, field, defaultValue = 'N/A') => {
    const value = obj?.[field];
    return (value !== undefined && value !== null && value !== '') ? value : defaultValue;
};

const getUsuarioValue = (escaneo) => {
    const campos = ['usuario_escaneo', 'usuario_escaner', 'usuario_scanner', 'usuario', 'user_name', 'username', 'nombre_usuario'];
    for (const campo of campos) {
        if (escaneo[campo] && escaneo[campo] !== '' && escaneo[campo] !== null && escaneo[campo] !== 'No especificado') {
            return escaneo[campo];
        }
    }
    return 'N/D';
};

const hasImage = (escaneo, tipo) => {
    const flag = tipo === '3d' ? escaneo.tiene_imagen_3d : escaneo.tiene_imagen_camara;
    const image = tipo === '3d' ? escaneo.imagen_3d : escaneo.imagen_camara;
    const filename = tipo === '3d' ? escaneo.imagen_3d_filename : escaneo.imagen_camara_filename;
    return !!(flag || (image && image.length > 0) || (filename && filename !== ''));
};

// 1. Formatear la fecha:
const formatFechaLegible = (escaneo) => {
  // Si viene el campo legible, úsalo; si no, formatea el ISO
  return escaneo.maquina_ultima_medicion_legible || escaneo.ultima_conexion_legible || (escaneo.fecha ? formatDate(escaneo.fecha) : 'N/A');
};

// ========================================================================
// COMPONENT: LoginForm
// ========================================================================
const LoginForm = ({ onLogin }) => {
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await onLogin(usuario, password);
    } catch (err) {
      setError(err.response?.data?.detail || 'Ocurrió un error. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: 'linear-gradient(135deg, #FAFAFA 0%, #F0F0F0 100%)' }}
    >
      <Paper elevation={8} sx={{ padding: 5, width: 400, borderRadius: 3 }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <img src="/logocarga.png" alt="Logintec" style={{ width: '220px', height: 'auto', marginBottom: '16px' }} onError={(e) => { e.target.style.display = 'none'; }} />
          <Typography variant="body2" color="text.secondary">Sistema de Gestión de Escaneos</Typography>
        </Box>
        <TextField fullWidth label="Email de Usuario" value={usuario} onChange={(e) => setUsuario(e.target.value)} margin="normal" variant="outlined" />
        <TextField fullWidth label="Contraseña" type="password" value={password} onChange={(e) => setPassword(e.target.value)} margin="normal" variant="outlined" />
        {error && <Alert severity="error" sx={{ mt: 2, textAlign: 'left' }}>{error}</Alert>}
        <Button type="submit" fullWidth variant="contained" size="large" disabled={loading} sx={{ mt: 3, py: 1.5 }}>
          {loading ? <CircularProgress size={24} color="inherit" /> : 'Ingresar'}
        </Button>
      </Paper>
    </Box>
  );
};

// ========================================================================
// COMPONENT: ImageModal
// ========================================================================
const ImageModal = ({ open, onClose, image }) => {
  if (!image) return null;
  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle sx={{ background: 'linear-gradient(135deg, #6B2C5A 0%, #8E4B7B 100%)', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" component="div">{image.tipo} - {image.filename}</Typography>
        <IconButton onClick={onClose} sx={{ color: 'white' }}><CloseIcon /></IconButton>
      </DialogTitle>
      <DialogContent sx={{ p: 2, textAlign: 'center' }}>
        <img
          src={`data:image/jpeg;base64,${image.base64}`}
          alt={image.filename}
          style={{ maxWidth: '100%', maxHeight: '70vh', objectFit: 'contain', borderRadius: 8, boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)' }}
        />
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', gap: 2 }}>
          <Chip label={`Serial: ${image.serial}`} color="primary" variant="outlined" />
          <Chip label={image.tipo} color="secondary" variant="outlined" />
        </Box>
      </DialogContent>
    </Dialog>
  );
};

// ========================================================================
// COMPONENT: EscaneosTable
// ========================================================================
const EscaneosTable = ({ escaneos, onViewImage, loadingImages }) => {
  const calculateVolume = (escaneo) => {
    if (escaneo.volumen) return escaneo.volumen;
    const [ancho, altura, largo] = [escaneo.ancho || 0, escaneo.altura || escaneo.alto || 0, escaneo.largo || 0];
    return (ancho && altura && largo) ? ancho * altura * largo : null;
  };

  const getLargoValueCm = (escaneo) => {
    const largo = getSafeValue(escaneo, 'largo', null);
    if (largo !== null) return formatDimensionCm(largo);
    const altoAsLargo = getSafeValue(escaneo, 'alto', null);
    return altoAsLargo !== null ? `${formatDimensionCm(altoAsLargo)}*` : 'N/A';
  };

  return (
    <TableContainer component={Paper} sx={{ mt: 2 }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Serial</TableCell><TableCell>Usuario</TableCell><TableCell>Máquina</TableCell><TableCell>Sitio</TableCell><TableCell>Fecha</TableCell>
            <TableCell>Ancho (cm)</TableCell><TableCell>Largo (cm)</TableCell><TableCell>Alto (cm)</TableCell>
            <TableCell>Volumen (dm³)</TableCell><TableCell>Peso (kg)</TableCell><TableCell>Imágenes</TableCell><TableCell>Acciones</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {escaneos.map((escaneo) => {
            // ✅ Enriquecer escaneo con datos de máquina/sitio
            const enrichedScan = MachinesSitesService.enrichScanWithMachineData(escaneo);

            return (
              <TableRow key={escaneo.id} hover>
                <TableCell><Typography variant="body2" sx={{ fontFamily: 'monospace' }}>{getSafeValue(escaneo, 'serial')}</Typography></TableCell>
                <TableCell><Typography variant="body2" sx={{ color: '#6B2C5A', fontWeight: 500 }}>{getUsuarioValue(escaneo)}</Typography></TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {enrichedScan.machine_name}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {enrichedScan.site_name}
                  </Typography>
                </TableCell>
                <TableCell>{formatDate(escaneo.fecha)}</TableCell>
                <TableCell>{formatDimensionCm(getSafeValue(escaneo, 'ancho'))}</TableCell>
                <TableCell>{getLargoValueCm(escaneo)}</TableCell>
                <TableCell>{formatDimensionCm(getSafeValue(escaneo, 'altura') || getSafeValue(escaneo, 'alto'))}</TableCell>
                <TableCell><Chip label={formatVolume3Decimals(calculateVolume(escaneo))} size="small" color="secondary" variant="outlined" /></TableCell>
                <TableCell>{formatPesoKg(escaneo.peso)}</TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                    {hasImage(escaneo, '3d') && (
                      <Tooltip title="Ver Imagen 3D">
                        <span>
                          <IconButton size="small" onClick={() => onViewImage(escaneo.id, '3d')} disabled={loadingImages[`${escaneo.id}_3d`]} sx={{ color: '#6B2C5A' }}>
                            {loadingImages[`${escaneo.id}_3d`] ? <CircularProgress size={16} /> : <ImageIcon fontSize="small" />}
                          </IconButton>
                        </span>
                      </Tooltip>
                    )}
                    {hasImage(escaneo, 'camara') && (
                       <Tooltip title="Ver Foto de Cámara">
                         <span>
                          <IconButton size="small" onClick={() => onViewImage(escaneo.id, 'camara')} disabled={loadingImages[`${escaneo.id}_camara`]} sx={{ color: '#7CB342' }}>
                            {loadingImages[`${escaneo.id}_camara`] ? <CircularProgress size={16} /> : <CameraIcon fontSize="small" />}
                          </IconButton>
                         </span>
                      </Tooltip>
                    )}
                    {!hasImage(escaneo, '3d') && !hasImage(escaneo, 'camara') && <Chip label="Sin imágenes" size="small" variant="outlined" />}
                  </Box>
                </TableCell>
                <TableCell>
                  <Tooltip title="Ver detalles del escaneo">
                    <IconButton size="small" sx={{ color: '#6B2C5A' }}><ViewIcon fontSize="small" /></IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

// ========================================================================
// COMPONENT: Dashboard
// ========================================================================
const Dashboard = ({ onLogout }) => {
  const [currentTab, setCurrentTab] = useState(1);
  const [escaneos, setEscaneos] = useState([]);
  const [escaneosFiltrados, setEscaneosFiltrados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [loadingImages, setLoadingImages] = useState({});
  const [searchSN, setSearchSN] = useState('');
  const [paginaActual, setPaginaActual] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [filtroSitio, setFiltroSitio] = useState('');
  const [filtroMaquina, setFiltroMaquina] = useState('');

  // Obtener valores únicos de sitio y máquina
  const sitiosUnicos = Array.from(new Set(escaneos.map(e => e.site_name).filter(Boolean)));
  const maquinasUnicas = Array.from(new Set(escaneos.map(e => e.maquina_modelo).filter(Boolean)));

  // Fetch escaneos con paginación real
  const fetchEscaneos = useCallback(async (pagina = 1) => {
    setLoading(true);
    setError('');
    try {
      const response = await api.fetchEscaneos(pagina);
      const { items, total, page, page_size } = response.data;
      setEscaneos(items || []);
      setPaginaActual(page || 1);
      setTotalPaginas(Math.ceil((total || 0) / (page_size || pageSize)));
    } catch {
      setError('No se pudo cargar la lista de escaneos.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (currentTab === 1) fetchEscaneos(1);
  }, [currentTab, fetchEscaneos]);

  // Filtrar escaneos por SN, sitio y máquina
  useEffect(() => {
    let filtrados = escaneos;
    if (searchSN.trim()) {
      filtrados = filtrados.filter(escaneo =>
        escaneo.serial &&
        escaneo.serial.toLowerCase().includes(searchSN.toLowerCase())
      );
    }
    if (filtroSitio) {
      filtrados = filtrados.filter(escaneo => escaneo.site_name === filtroSitio);
    }
    if (filtroMaquina) {
      filtrados = filtrados.filter(escaneo => escaneo.maquina_modelo === filtroMaquina);
    }
    setEscaneosFiltrados(filtrados);
  }, [escaneos, searchSN, filtroSitio, filtroMaquina]);

  const handleViewImage = async (scanId, tipo) => {
    setLoadingImages(prev => ({ ...prev, [`${scanId}_${tipo}`]: true }));
    try {
      const response = await api.fetchImage(scanId, tipo);
      if (response.data.success && response.data.imagen_base64) {
        setSelectedImage({
          base64: response.data.imagen_base64,
          filename: response.data.filename || `imagen_${tipo}_${scanId}`,
          tipo: tipo === '3d' ? 'Imagen 3D' : 'Foto de Cámara',
          scanId,
          serial: response.data.serial || 'N/A'
        });
        setImageDialogOpen(true);
      } else {
        alert(`No se pudo cargar la imagen ${tipo}.`);
      }
    } catch {
      alert('Error al cargar la imagen');
    } finally {
      setLoadingImages(prev => ({ ...prev, [`${scanId}_${tipo}`]: false }));
    }
  };

  // TAB ESCANEOS
  const renderEscaneosTab = () => (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5">ESCANEOS</Typography>
        <Button variant="contained" startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <RefreshIcon />} onClick={() => fetchEscaneos(paginaActual)} disabled={loading} size="small">
          Actualizar
        </Button>
      </Box>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {/* Filtros */}
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <TextField
          select
          label="Filtrar por sitio"
          value={filtroSitio}
          onChange={e => setFiltroSitio(e.target.value)}
          size="small"
          sx={{ minWidth: 180 }}
        >
          <MenuItem value="">Todos los sitios</MenuItem>
          {sitiosUnicos.map(sitio => (
            <MenuItem key={sitio} value={sitio}>{sitio}</MenuItem>
          ))}
        </TextField>
        <TextField
          select
          label="Filtrar por máquina"
          value={filtroMaquina}
          onChange={e => setFiltroMaquina(e.target.value)}
          size="small"
          sx={{ minWidth: 180 }}
        >
          <MenuItem value="">Todas las máquinas</MenuItem>
          {maquinasUnicas.map(maquina => (
            <MenuItem key={maquina} value={maquina}>{maquina}</MenuItem>
          ))}
        </TextField>
      </Box>
      {/* Búsqueda por SN */}
      <Paper sx={{ p: 2, mb: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
        <SearchIcon color="action" />
        <TextField fullWidth size="small" placeholder="Buscar por número de serie..." value={searchSN} onChange={(e) => setSearchSN(e.target.value)} variant="outlined"
          InputProps={{
            endAdornment: searchSN && <IconButton size="small" onClick={() => setSearchSN('')}><ClearIcon /></IconButton>
          }}
        />
      </Paper>
      {/* Tabla de escaneos */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>
      ) : (
        <TableContainer component={Paper} sx={{ mt: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontSize: '0.95rem' }}>Serial</TableCell>
                <TableCell sx={{ fontSize: '0.95rem' }}>Usuario</TableCell>
                <TableCell sx={{ fontSize: '0.95rem' }}>Máquina</TableCell>
                <TableCell sx={{ fontSize: '0.95rem' }}>Sitio</TableCell>
                <TableCell sx={{ fontSize: '0.95rem' }}>Fecha</TableCell>
                <TableCell sx={{ fontSize: '0.95rem' }}>Ancho (cm)</TableCell>
                <TableCell sx={{ fontSize: '0.95rem' }}>Largo (cm)</TableCell>
                <TableCell sx={{ fontSize: '0.95rem' }}>Alto (cm)</TableCell>
                <TableCell sx={{ fontSize: '0.95rem' }}>Volumen (dm³)</TableCell>
                <TableCell sx={{ fontSize: '0.95rem' }}>Peso (kg)</TableCell>
                <TableCell sx={{ fontSize: '0.95rem' }}>Imágenes</TableCell>
                {/* Eliminar columna Acciones */}
              </TableRow>
            </TableHead>
            <TableBody>
              {filtrarDuplicadosPorSerial(escaneosFiltrados)
                .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
                .map((escaneo) => {
                  console.log('ESCANEO:', escaneo.serial, 'PESO:', escaneo.peso, escaneo);
                  return (
                    <TableRow key={escaneo.id} hover>
                      <TableCell sx={{ fontSize: '0.92rem' }}>{escaneo.serial}</TableCell>
                      <TableCell sx={{ fontSize: '0.92rem' }}>{escaneo.usuario || escaneo.usuario_escaneo || escaneo.username || 'N/D'}</TableCell>
                      <TableCell sx={{ fontSize: '0.92rem' }}>{escaneo.maquina_modelo || 'N/D'}</TableCell>
                      <TableCell sx={{ fontSize: '0.92rem' }}>{escaneo.site_name || 'N/D'}</TableCell>
                      <TableCell sx={{ fontSize: '0.92rem' }}>{formatDate(escaneo.fecha)}</TableCell>
                      <TableCell sx={{ fontSize: '0.92rem' }}>{escaneo.ancho}</TableCell>
                      <TableCell sx={{ fontSize: '0.92rem' }}>{escaneo.largo}</TableCell>
                      <TableCell sx={{ fontSize: '0.92rem' }}>{escaneo.alto || escaneo.altura}</TableCell>
                      <TableCell sx={{ fontSize: '0.92rem' }}>{escaneo.volumen}</TableCell>
                      <TableCell sx={{ fontSize: '0.92rem' }}>{formatPesoKg(escaneo.peso ?? escaneo.peso_kg ?? escaneo.machine_peso)}</TableCell>
                      <TableCell sx={{ fontSize: '0.92rem' }}>
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                          {escaneo.tiene_imagen_3d && (
                            <Tooltip title="Ver Imagen 3D">
                              <span>
                                <IconButton size="small" onClick={() => handleViewImage(escaneo.id, '3d')} disabled={loadingImages[`${escaneo.id}_3d`]} sx={{ color: '#6B2C5A' }}>
                                  {loadingImages[`${escaneo.id}_3d`] ? <CircularProgress size={16} /> : <ImageIcon fontSize="small" />}
                                </IconButton>
                              </span>
                            </Tooltip>
                          )}
                          {escaneo.tiene_imagen_camara && (
                            <Tooltip title="Ver Foto de Cámara">
                              <span>
                                <IconButton size="small" onClick={() => handleViewImage(escaneo.id, 'camara')} disabled={loadingImages[`${escaneo.id}_camara`]} sx={{ color: '#7CB342' }}>
                                  {loadingImages[`${escaneo.id}_camara`] ? <CircularProgress size={16} /> : <CameraIcon fontSize="small" />}
                                </IconButton>
                              </span>
                            </Tooltip>
                          )}
                          {!escaneo.tiene_imagen_3d && !escaneo.tiene_imagen_camara && (
                            <Chip label="Sin imágenes" size="small" variant="outlined" />
                          )}
                        </Box>
                      </TableCell>
                      {/* Eliminar columna Acciones */}
                    </TableRow>
                  );
                })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      {/* Controles de paginación */}
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 2, gap: 2 }}>
        <Button
          variant="outlined"
          disabled={paginaActual === 1 || loading}
          onClick={() => { setPaginaActual(paginaActual - 1); fetchEscaneos(paginaActual - 1); }}
        >Anterior</Button>
        <Typography variant="body2" sx={{ mx: 2 }}>
          Página {paginaActual} de {totalPaginas}
        </Typography>
        <Button
          variant="outlined"
          disabled={paginaActual === totalPaginas || loading}
          onClick={() => { setPaginaActual(paginaActual + 1); fetchEscaneos(paginaActual + 1); }}
        >Siguiente</Button>
      </Box>
      <Dialog open={imageDialogOpen} onClose={() => setImageDialogOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle sx={{ background: 'linear-gradient(135deg, #6B2C5A 0%, #8E4B7B 100%)', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">{selectedImage?.tipo} - {selectedImage?.filename}</Typography>
          <IconButton onClick={() => setImageDialogOpen(false)} sx={{ color: 'white' }}><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 2, textAlign: 'center' }}>
          {selectedImage && (
            <img
              src={`data:image/jpeg;base64,${selectedImage.base64}`}
              alt={selectedImage.filename}
              style={{ maxWidth: '100%', maxHeight: '70vh', objectFit: 'contain', borderRadius: 8, boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)' }}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );

  // RESTO DE TABS: En desarrollo
  const renderOtherTabs = () => (
    <>
      <Typography sx={{p:3, textAlign: 'center'}}>Sección en desarrollo.</Typography>
    </>
  );

  const renderTabContent = () => {
    if (currentTab === 0) return <MachinesSites />;
    if (currentTab === 1) return renderEscaneosTab();
    return renderOtherTabs();
  };

  return (
    <>
      <AppBar position="static" elevation={0}>
        <Toolbar sx={{ py: 1 }}>
          <img src="/logoblanco.png" alt="Logintec" style={{ height: '120px', width: 'auto', marginRight: '16px' }} onError={(e) => { e.target.style.display = 'none'; }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }} />
          <Button color="inherit" onClick={onLogout} startIcon={<LogoutIcon />}>Salir</Button>
        </Toolbar>
      </AppBar>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Paper elevation={0} sx={{ mb: 3 }}>
          <Tabs value={currentTab} onChange={(e, val) => setCurrentTab(val)} variant="fullWidth">
            <Tab label="MÁQUINAS" /><Tab label="ESCANEOS" /><Tab label="USUARIOS" /><Tab label="LOGS" /><Tab label="SITIOS" />
          </Tabs>
        </Paper>
        <Box sx={{ mt: 3 }}>{renderTabContent()}</Box>
      </Container>
    </>
  );
};

// ========================================================================
// APP ROOT COMPONENT
// ========================================================================
function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('authToken'));

  const handleLogin = async (usuario, password) => {
    const response = await api.login(usuario, password);
    localStorage.setItem('authToken', response.data.access_token);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    setIsLoggedIn(false);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ backgroundColor: '#FAFAFA', minHeight: '100vh' }}>
        {isLoggedIn ? <Dashboard onLogout={handleLogout} /> : <LoginForm onLogin={handleLogin} />}
      </Box>
    </ThemeProvider>
  );
}

// Agregar función utilitaria para formatear el peso
function formatPesoKg(peso) {
  let valor = Number(peso);
  if (isNaN(valor)) valor = 0;
  return valor.toFixed(1) + ' kg';
}

// Filtrar duplicados por número de serie (solo el más reciente)
function filtrarDuplicadosPorSerial(escaneos) {
  const map = {};
  escaneos.forEach(e => {
    const serial = e.serial;
    if (!serial) return;
    if (!map[serial] || new Date(e.fecha) > new Date(map[serial].fecha)) {
      map[serial] = e;
    }
  });
  return Object.values(map);
}

export default App;