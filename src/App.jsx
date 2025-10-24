import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import ApiService from './apiService';
import { formatDateArgentina } from './utils/dateUtils';
import { checkAuthStatus, checkApiConnectivity, diagnoseImageProblem } from './utils/imageUtils';
import {
  Box, TextField, Button, Paper, Typography, AppBar, Toolbar,
  Tabs, Tab, Container, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, ThemeProvider, createTheme, CircularProgress,
  Alert, Chip, Dialog, DialogContent, DialogTitle, IconButton, Tooltip, Fab, CssBaseline, MenuItem, Switch, FormControlLabel
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
  Clear as ClearIcon,
  Add as AddIcon,
  Info as InfoIcon
} from '@mui/icons-material';

// ✅ IMPORT MÁQUINAS Y SITIOS
import MachinesSites from './pages/MachinesSites';
import MachinesSitesService from './services/machinesSitesService';
import UserProfile from './pages/UserProfile';
import WorkingImageDiagnosticModal from './components/WorkingImageDiagnosticModal';

// ========================================================================
// THEME CONFIGURATION
// ========================================================================
const theme = createTheme({
  palette: {
    primary: {
      main: '#5b3ea3',
      light: '#7B5BB8',
      dark: '#3D2A73',
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
    MuiAppBar: { styleOverrides: { root: { background: 'linear-gradient(135deg, #5b3ea3 0%, #7B5BB8 100%)', boxShadow: '0 4px 20px rgba(91, 62, 163, 0.3)' } } },
    MuiPaper: { styleOverrides: { root: { borderRadius: 12, boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)' } } },
    MuiButton: { styleOverrides: { contained: { borderRadius: 8, textTransform: 'none', fontWeight: 500, boxShadow: '0 4px 12px rgba(91, 62, 163, 0.3)', '&:hover': { boxShadow: '0 6px 16px rgba(91, 62, 163, 0.4)' } }, outlined: { borderRadius: 8, textTransform: 'none', fontWeight: 500 } } },
    MuiTableCell: { styleOverrides: { head: { backgroundColor: '#F5F5F5', fontWeight: 600, color: '#2C2C2C' } } },
    MuiTabs: { styleOverrides: { root: { backgroundColor: '#FFFFFF', borderRadius: '12px 12px 0 0', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }, indicator: { backgroundColor: '#5b3ea3', height: 3 } } },
    MuiTab: { styleOverrides: { root: { textTransform: 'none', fontWeight: 500, fontSize: '0.95rem', color: '#666666', '&.Mui-selected': { color: '#5b3ea3', fontWeight: 600 } } } },
  },
});

// ========================================================================
// DEMO MODE CONFIGURATION
// ========================================================================
const DEMO_MODE_KEY = 'logintec_demo_mode';

// Datos de demostración
const DEMO_DATA = {
  user: {
    id: 1,
    email: 'demo@logintec.com',
    nombre: 'Usuario Demo',
    rol: 'Administrador'
  },
  escaneos: [
    {
      id: 1,
      serial: 'DEMO001',
      usuario: 'Juan Pérez',
      usuario_escaneo: 'Juan Pérez',
      maquina_modelo: 'Scanner 3D Pro',
      site_name: 'Planta Central',
      fecha: '2024-01-15T10:30:00Z',
      ancho: 25.5,
      largo: 30.2,
      alto: 15.8,
      volumen: 12150.78,
      peso: 2.3,
      tiene_imagen_3d: true,
      tiene_imagen_camara: true,
      imagen_3d_filename: 'demo_3d_001.jpg',
      imagen_camara_filename: 'demo_cam_001.jpg'
    },
    {
      id: 2,
      serial: 'DEMO002',
      usuario: 'María García',
      usuario_escaneo: 'María García',
      maquina_modelo: 'Scanner Compact',
      site_name: 'Sucursal Norte',
      fecha: '2024-01-14T14:20:00Z',
      ancho: 18.3,
      largo: 22.1,
      alto: 12.5,
      volumen: 5056.125,
      peso: 1.8,
      tiene_imagen_3d: true,
      tiene_imagen_camara: false,
      imagen_3d_filename: 'demo_3d_002.jpg',
      imagen_camara_filename: null
    },
    {
      id: 3,
      serial: 'DEMO003',
      usuario: 'Carlos López',
      usuario_escaneo: 'Carlos López',
      maquina_modelo: 'Scanner Industrial',
      site_name: 'Planta Sur',
      fecha: '2024-01-13T09:15:00Z',
      ancho: 35.2,
      largo: 42.8,
      alto: 28.5,
      volumen: 42924.16,
      peso: 5.7,
      tiene_imagen_3d: false,
      tiene_imagen_camara: true,
      imagen_3d_filename: null,
      imagen_camara_filename: 'demo_cam_003.jpg'
    },
    {
      id: 4,
      serial: 'DEMO004',
      usuario: 'Ana Martínez',
      usuario_escaneo: 'Ana Martínez',
      maquina_modelo: 'Scanner 3D Pro',
      site_name: 'Planta Central',
      fecha: '2024-01-12T16:45:00Z',
      ancho: 28.7,
      largo: 33.4,
      alto: 19.2,
      volumen: 18407.616,
      peso: 3.1,
      tiene_imagen_3d: true,
      tiene_imagen_camara: true,
      imagen_3d_filename: 'demo_3d_004.jpg',
      imagen_camara_filename: 'demo_cam_004.jpg'
    },
    {
      id: 5,
      serial: 'DEMO005',
      usuario: 'Roberto Silva',
      usuario_escaneo: 'Roberto Silva',
      maquina_modelo: 'Scanner Compact',
      site_name: 'Sucursal Este',
      fecha: '2024-01-11T11:30:00Z',
      ancho: 20.1,
      largo: 25.6,
      alto: 14.3,
      volumen: 7361.088,
      peso: 2.1,
      tiene_imagen_3d: false,
      tiene_imagen_camara: false,
      imagen_3d_filename: null,
      imagen_camara_filename: null
    },
    // 🆕 EJEMPLO DE VOXEL CAM CON MÚLTIPLES BULTOS
    {
      id: 6,
      serial: 'VOXEL_CAM_001',
      usuario: 'Voxel Cam App',
      usuario_escaneo: 'voxel_cam_app',
      maquina_modelo: 'Voxel Cam Pro',
      site_name: 'PC San Martín',
      fecha: '2024-01-16T14:20:00Z',
      // Datos agregados del lote
      cantidad_bultos: 4,
      volumen_total: 367.72,
      peso_total: 64.6,
      // Datos individuales de cada bulto
      bultos_individuales: [
        {
          ancho: 25.5,
          largo: 30.2,
          alto: 15.8,
          volumen: 12150.78,
          peso: 2.3
        },
        {
          ancho: 18.3,
          largo: 22.1,
          alto: 12.5,
          volumen: 5056.125,
          peso: 1.8
        },
        {
          ancho: 22.1,
          largo: 28.5,
          alto: 18.2,
          volumen: 11456.37,
          peso: 3.1
        },
        {
          ancho: 19.8,
          largo: 25.3,
          alto: 14.1,
          volumen: 7056.234,
          peso: 2.8
        }
      ],
      tiene_imagen_3d: true,
      tiene_imagen_camara: true,
      imagen_3d_filename: 'voxel_cam_001_3d.jpg',
      imagen_camara_filename: 'voxel_cam_001_cam.jpg'
    }
  ],
  estadisticas: {
    total_escaneos: 6,
    escaneos_hoy: 2,
    escaneos_semana: 4,
    escaneos_mes: 6,
    volumen_total: 90967.509,
    peso_total: 77.1
  }
};

// ========================================================================
// API COMMUNICATION
// ========================================================================
const API_BASE_URL = 'https://logintec-1.onrender.com';
const pageSize = 100;

// getAuthHeaders como función normal fuera de los componentes
const getAuthHeaders = () => ({
  'Authorization': `Bearer ${localStorage.getItem('authToken')}`
});

// Función para verificar si está en modo demo
const isDemoMode = () => {
  return localStorage.getItem(DEMO_MODE_KEY) === 'true';
};

const api = {
  login: (usuario, password) => {
    if (isDemoMode()) {
      // Simular login exitoso en modo demo
      return Promise.resolve({
        data: {
          access_token: 'demo_token_' + Date.now(),
          token_type: 'bearer'
        }
      });
    }
    const params = new URLSearchParams();
    params.append('username', usuario);
    params.append('password', password);
    return axios.post(`${API_BASE_URL}/auth/token`, params);
  },
  fetchCurrentUser: () => {
    if (isDemoMode()) {
      return Promise.resolve({ data: DEMO_DATA.user });
    }
    return axios.get(`${API_BASE_URL}/api/cloud/me`, { headers: getAuthHeaders() });
  },
  fetchEscaneos: (page = 1) => {
    if (isDemoMode()) {
      // Simular paginación con datos demo
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedEscaneos = DEMO_DATA.escaneos.slice(startIndex, endIndex);
      
      return Promise.resolve({
        data: {
          items: paginatedEscaneos,
          total: DEMO_DATA.escaneos.length,
          page: page,
          page_size: pageSize
        }
      });
    }
    return axios.get(`${API_BASE_URL}/api/cloud/escaneos?page=${page}&page_size=${pageSize}`, { headers: getAuthHeaders() });
  },
  fetchStats: () => {
    if (isDemoMode()) {
      return Promise.resolve({ data: DEMO_DATA.estadisticas });
    }
    return axios.get(`${API_BASE_URL}/api/cloud/estadisticas`, { headers: getAuthHeaders() });
  },
  fetchImage: (scanId, tipo) => {
    if (isDemoMode()) {
      // Simular imagen demo (imagen placeholder)
      const escaneo = DEMO_DATA.escaneos.find(e => e.id === scanId);
      if (!escaneo) {
        return Promise.reject({ response: { status: 404, data: { message: 'Escaneo no encontrado' } } });
      }
      
      const hasImage = tipo === '3d' ? escaneo.tiene_imagen_3d : escaneo.tiene_imagen_camara;
      if (!hasImage) {
        return Promise.reject({ response: { status: 404, data: { message: `No hay imagen ${tipo} disponible` } } });
      }
      
      // Crear una imagen placeholder en base64 (pixel transparente)
      const placeholderImage = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
      
      return Promise.resolve({
        data: {
          success: true,
          imagen_base64: placeholderImage,
          filename: tipo === '3d' ? escaneo.imagen_3d_filename : escaneo.imagen_camara_filename,
          serial: escaneo.serial
        }
      });
    }
    return axios.get(
      `${API_BASE_URL}/api/cloud/escaneo/${scanId}/imagen?tipo=${tipo}`,
      { 
        headers: getAuthHeaders(), 
        timeout: 60000, // Aumentar timeout a 60 segundos
        responseType: 'json'
      }
    );
  }
};

// ========================================================================
// UTILITY & FORMATTING FUNCTIONS
// ========================================================================
const formatDate = (dateInput) => {
    return formatDateArgentina(dateInput);
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

  // Función mejorada para verificar si una imagen existe
  const hasImage = (escaneo, tipo) => {
    const flag = tipo === '3d' ? escaneo.tiene_imagen_3d : escaneo.tiene_imagen_camara;
    const image = tipo === '3d' ? escaneo.imagen_3d : escaneo.imagen_camara;
    const filename = tipo === '3d' ? escaneo.imagen_3d_filename : escaneo.imagen_camara_filename;

    const hasImageFlag = !!flag;
    const hasImageData = !!(image && image.length > 0);
    const hasFilename = !!(filename && filename !== '');

    const result = !!(hasImageFlag || hasImageData || hasFilename);

    // Logging para debug
    if (escaneo.serial) {
      // console.log(`🔍 Verificando imagen ${tipo} para ${escaneo.serial}:`, {
      //   flag: hasImageFlag,
      //   imageData: hasImageData,
      //   filename: hasFilename,
      //   result: result
      // });
    }

    return result;
  };

// 1. Formatear la fecha:
const formatFechaLegible = (escaneo) => {
  // Si viene el campo legible, úsalo; si no, formatea el ISO
  return escaneo.maquina_ultima_medicion_legible || escaneo.ultima_conexion_legible || (escaneo.fecha ? formatDate(escaneo.fecha) : 'N/A');
};

// Reemplazar función de formateo de volumen
const formatVolumeSmart = (volumenMm3) => {
  if (!volumenMm3 && volumenMm3 !== 0) return 'N/A';
  let valor = (volumenMm3 / 1000000).toFixed(3);
  valor = valor.replace(/\.0+$|(\.\d*?[1-9])0+$/, '$1');
  return `${valor} dm³`;
};

// ========================================================================
// COMPONENT: LoginForm
// ========================================================================
const LoginForm = ({ onLogin }) => {
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [demoMode, setDemoMode] = useState(localStorage.getItem(DEMO_MODE_KEY) === 'true');

  // Efecto para llenar campos automáticamente en modo demo
  useEffect(() => {
    if (demoMode) {
      setUsuario('demo@logintec.com');
      setPassword('demo123');
    }
  }, [demoMode]);

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

  const handleDemoModeToggle = (event) => {
    const isDemo = event.target.checked;
    setDemoMode(isDemo);
    localStorage.setItem(DEMO_MODE_KEY, isDemo.toString());
    
    if (isDemo) {
      // En modo demo, llenar automáticamente los campos
      setUsuario('demo@logintec.com');
      setPassword('demo123');
    } else {
      // Limpiar campos al salir del modo demo
      setUsuario('');
      setPassword('');
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
          <img src="/logocloud.png" alt="Logintec" style={{ width: '220px', height: 'auto', marginBottom: '16px' }} onError={(e) => { e.target.style.display = 'none'; }} />
          <Typography variant="body2" color="text.secondary">Sistema de Gestión de Escaneos</Typography>
        </Box>
        
        {/* Toggle Modo Demo */}
        <Box sx={{ mb: 3, p: 2, backgroundColor: demoMode ? '#e3f2fd' : '#f5f5f5', borderRadius: 2, border: `2px solid ${demoMode ? '#5b3ea3' : '#ddd'}` }}>
          <FormControlLabel
            control={
              <Switch
                checked={demoMode}
                onChange={handleDemoModeToggle}
                color="primary"
              />
            }
            label={
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 600, color: demoMode ? '#5b3ea3' : '#666' }}>
                  Modo Demo
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {demoMode ? 'Usando datos de demostración' : 'Conectar a base de datos real'}
                </Typography>
              </Box>
            }
          />
          {demoMode && (
            <Alert severity="info" sx={{ mt: 1, fontSize: '0.75rem' }}>
              <Typography variant="caption">
                <strong>Modo Demo:</strong> Usa cualquier email y contraseña para ingresar. Los datos son de demostración.
              </Typography>
            </Alert>
          )}
        </Box>

        <TextField 
          fullWidth 
          label="Email de Usuario" 
          value={usuario} 
          onChange={(e) => setUsuario(e.target.value)} 
          margin="normal" 
          variant="outlined"
          disabled={demoMode}
        />
        <TextField 
          fullWidth 
          label="Contraseña" 
          type="password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          margin="normal" 
          variant="outlined"
          disabled={demoMode}
        />
        {error && <Alert severity="error" sx={{ mt: 2, textAlign: 'left' }}>{error}</Alert>}
        <Button type="submit" fullWidth variant="contained" size="large" disabled={loading} sx={{ mt: 3, py: 1.5 }}>
          {loading ? <CircularProgress size={24} color="inherit" /> : (demoMode ? 'Ingresar (Demo)' : 'Ingresar')}
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
      <DialogTitle sx={{ background: 'linear-gradient(135deg, #5b3ea3 0%, #7B5BB8 100%)', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
            <TableCell>Volumen (dm³)</TableCell><TableCell>Peso (kg)</TableCell><TableCell>Imágenes</TableCell><TableCell>Acciones</TableCell><TableCell>Detalle</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {escaneos.map((escaneo) => {
            // ✅ Enriquecer escaneo con datos de máquina/sitio
            const enrichedScan = MachinesSitesService.enrichScanWithMachineData(escaneo);

            return (
              <TableRow key={escaneo.id} hover>
                <TableCell><Typography variant="body2" sx={{ fontFamily: 'monospace' }}>{getSafeValue(escaneo, 'serial')}</Typography></TableCell>
                <TableCell><Typography variant="body2" sx={{ color: '#5b3ea3', fontWeight: 500 }}>{getUsuarioValue(escaneo)}</Typography></TableCell>
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
                <TableCell><Chip label={formatVolumeSmart(calculateVolume(escaneo))} size="small" color="secondary" variant="outlined" /></TableCell>
                <TableCell>{formatPesoKg(escaneo.peso)}</TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                    {hasImage(escaneo, '3d') && (
                      <Tooltip title="Ver Imagen 3D">
                        <span>
                          <IconButton size="small" onClick={() => onViewImage(escaneo.id, '3d')} disabled={loadingImages[`${escaneo.id}_3d`]} sx={{ color: '#5b3ea3' }}>
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
                  </Box>
                </TableCell>
                <TableCell>
                  <Tooltip title="Ver detalles del escaneo">
                    <IconButton size="small" sx={{ color: '#5b3ea3' }}><ViewIcon fontSize="small" /></IconButton>
                  </Tooltip>
                </TableCell>
                <TableCell>
                  {/* Mostrar ícono + si tiene detalles de bultos, sino gris */}
                  {escaneo.cantidad_bultos && escaneo.cantidad_bultos > 1 ? (
                    <Tooltip title="Ver detalles de bultos individuales">
                      <IconButton size="small" sx={{ color: '#5b3ea3' }} onClick={() => handleViewDetalleBultos(escaneo)}>
                        <AddIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  ) : (
                    <Tooltip title="Sin detalles adicionales">
                      <IconButton size="small" disabled sx={{ color: '#ccc' }}>
                        <AddIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
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
  const [diagnosticModalOpen, setDiagnosticModalOpen] = useState(false);
  const [diagnosticData, setDiagnosticData] = useState(null);
  const [searchSN, setSearchSN] = useState('');
  const [paginaActual, setPaginaActual] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [filtroSitio, setFiltroSitio] = useState('');
  const [filtroMaquina, setFiltroMaquina] = useState('');
  const [sitiosUnicos, setSitiosUnicos] = useState([]);
  const [maquinasUnicas, setMaquinasUnicas] = useState([]);
  const [detalleBultosModalOpen, setDetalleBultosModalOpen] = useState(false);
  const [detalleBultosData, setDetalleBultosData] = useState(null);
  const [detalleBultosLoading, setDetalleBultosLoading] = useState(false);
  const [detalleBultosError, setDetalleBultosError] = useState(null);

  // Cargar todos los sitios y máquinas para los filtros
  const loadFilterOptions = useCallback(async () => {
    try {
      console.log('🔄 Cargando opciones de filtros...');
      const [sitios, maquinas] = await Promise.all([
        MachinesSitesService.getAllSites(),
        MachinesSitesService.getAllMachines()
      ]);
      
      setSitiosUnicos(sitios.map(s => s.nombre).filter(Boolean));
      setMaquinasUnicas(maquinas.map(m => m.nombre).filter(Boolean));
      
      // console.log('✅ Filtros cargados:', {
      //   sitios: sitios.length,
      //   maquinas: maquinas.length
      // });
    } catch (error) {
      console.error('❌ Error cargando filtros:', error);
    }
  }, []);

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
    if (currentTab === 1) {
      fetchEscaneos(1);
      loadFilterOptions(); // Cargar opciones de filtros
    }
  }, [currentTab, fetchEscaneos, loadFilterOptions]);

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
      filtrados = filtrados.filter(escaneo => 
        escaneo.sitio?.nombre === filtroSitio || escaneo.site_name === filtroSitio
      );
    }
    if (filtroMaquina) {
      filtrados = filtrados.filter(escaneo => 
        escaneo.maquina?.nombre === filtroMaquina || escaneo.maquina_modelo === filtroMaquina
      );
    }
    setEscaneosFiltrados(filtrados);
  }, [escaneos, searchSN, filtroSitio, filtroMaquina]);

  // Función mejorada para manejar la carga de imágenes
  const handleViewImage = async (scanId, tipo, forceCheck = false) => {
    // console.log(`🖼️ Intentando cargar imagen ${tipo} para scanId: ${scanId}`);
    setLoadingImages(prev => ({ ...prev, [`${scanId}_${tipo}`]: true }));

    try {
      // Verificar token antes de hacer la petición
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      // console.log(`🔑 Token encontrado, haciendo petición a la API...`);
      const response = await api.fetchImage(scanId, tipo);

      // console.log(`📡 Respuesta recibida:`, response.data);

      if (response.data.success && response.data.imagen_base64) {
        // console.log(`✅ Imagen cargada exitosamente`);
        setSelectedImage({
          base64: response.data.imagen_base64,
          filename: response.data.filename || `imagen_${tipo}_${scanId}`,
          tipo: tipo === '3d' ? 'Imagen 3D' : 'Foto de Cámara',
          scanId,
          serial: response.data.serial || 'N/A'
        });
        setImageDialogOpen(true);
      } else {
        console.error(`❌ Respuesta sin éxito:`, response.data);
        // Mostrar mensaje más amigable
        const errorMessage = response.data.message || `No se pudo cargar la imagen ${tipo}`;
        alert(`⚠️ ${errorMessage}\n\n💡 Sugerencia: Usa el diagnóstico para verificar el estado de la imagen.`);
      }
    } catch (error) {
      console.error(`❌ Error cargando imagen ${tipo}:`, error);

      let errorMessage = 'Error al cargar la imagen';
      let suggestion = '';

      if (error.response) {
        console.error('Respuesta del servidor:', error.response.data);
        console.error('Status:', error.response.status);

        if (error.response.status === 401) {
          errorMessage = 'Error de autenticación. Por favor, vuelve a iniciar sesión.';
          suggestion = '🔑 Tu sesión ha expirado. Inicia sesión nuevamente.';
      } else if (error.response.status === 404) {
        errorMessage = `La imagen ${tipo} no existe para este escaneo.`;
        suggestion = '📸 Esta imagen no fue guardada o se perdió del servidor.';
        
        // Información adicional para diagnóstico
        // console.log('🔍 Diagnóstico 404:', {
        //   scanId,
        //   tipo,
        //   url: `${API_BASE_URL}/api/cloud/escaneo/${scanId}/imagen?tipo=${tipo}`,
        //   token: token ? 'Presente' : 'Ausente',
        //   escaneo: escaneos.find(e => e.id === scanId)
        // });
        } else if (error.response.status === 500) {
          errorMessage = 'Error interno del servidor. Inténtalo más tarde.';
          suggestion = '🔄 El servidor está teniendo problemas. Intenta más tarde.';
        } else {
          errorMessage = `Error del servidor (${error.response.status}): ${error.response.data?.detail || error.response.data?.message || 'Error desconocido'}`;
          suggestion = '🔧 Contacta al administrador del sistema.';
        }
      } else if (error.request) {
        console.error('Error de red:', error.request);
        errorMessage = 'Error de conexión a internet.';
        suggestion = '🌐 Verifica tu conexión WiFi/internet e intenta nuevamente.';
      } else if (error.code === 'ENOTFOUND' || error.message.includes('getaddrinfo ENOTFOUND')) {
        errorMessage = 'No se puede conectar al servidor. Verifica tu conexión a internet.';
        suggestion = '📶 Revisa tu conexión WiFi y asegúrate de estar conectado a internet.';
      } else if (error.code === 'ECONNABORTED') {
        errorMessage = 'La carga de la imagen tardó demasiado. Inténtalo de nuevo.';
        suggestion = '⏱️ La imagen es muy grande o el servidor está lento. Intenta más tarde.';
      } else {
        errorMessage = `Error: ${error.message}`;
        suggestion = '🔍 Usa el diagnóstico para obtener más información.';
      }

      // Mostrar mensaje mejorado con sugerencias
      alert(`❌ ${errorMessage}\n\n💡 ${suggestion}\n\n🔍 Usa el botón de diagnóstico (ℹ️) para verificar el estado de la imagen.`);
    } finally {
      setLoadingImages(prev => ({ ...prev, [`${scanId}_${tipo}`]: false }));
    }
  };

  // Función para intentar cargar imágenes no marcadas como disponibles
  const handleTryLoadImage = async (scanId, tipo) => {
    // console.log(`🔍 Intentando cargar imagen ${tipo} no marcada como disponible para scanId: ${scanId}`);
    
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        alert('❌ No hay token de autenticación. Por favor, vuelve a iniciar sesión.');
        return;
      }

      const response = await fetch(`https://logintec-1.onrender.com/api/cloud/escaneo/${scanId}/imagen?tipo=${tipo}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (response.ok && data.success && data.imagen_base64) {
        // console.log(`✅ ¡Imagen ${tipo} encontrada aunque no estaba marcada como disponible!`);
        setSelectedImage({
          base64: data.imagen_base64,
          filename: data.filename || `imagen_${tipo}_${scanId}`,
          tipo: tipo === '3d' ? 'Imagen 3D' : 'Foto de Cámara',
          scanId,
          serial: data.serial || 'N/A'
        });
        setImageDialogOpen(true);
        
        // Mostrar mensaje de éxito
        alert(`🎉 ¡Imagen ${tipo} encontrada!\n\nLa imagen existe en el servidor pero no estaba marcada como disponible en la base de datos.`);
      } else {
        // console.log(`❌ Imagen ${tipo} no encontrada en el servidor`);
        alert(`❌ La imagen ${tipo} no existe en el servidor.\n\nStatus: ${response.status}\nMensaje: ${data.message || 'No disponible'}`);
      }
    } catch (error) {
      console.error(`❌ Error intentando cargar imagen ${tipo}:`, error);
      alert(`❌ Error al intentar cargar la imagen ${tipo}:\n\n${error.message}`);
    }
  };

  // Función para abrir modal de detalles de bultos
  const handleViewDetalleBultos = async (escaneo) => {
    console.log('🚀 Iniciando handleViewDetalleBultos con escaneo:', escaneo);
    console.log('📊 Datos del escaneo:', {
      id: escaneo.id,
      serial: escaneo.serial,
      cantidad_bultos: escaneo.cantidad_bultos,
      volumen: escaneo.volumen,
      peso: escaneo.peso
    });
    
    setDetalleBultosModalOpen(true);
    setDetalleBultosLoading(true);
    setDetalleBultosError(null);
    setDetalleBultosData(escaneo); // Datos básicos del escaneo

    try {
      console.log('🔄 Cargando detalles de bultos para escaneo:', escaneo.id);
      
      // Verificar si estamos en modo demo
      if (isDemoMode()) {
        // En modo demo, usar los datos que ya están en el escaneo
        console.log('📊 Modo demo: usando datos existentes');
        setDetalleBultosData(escaneo);
        setDetalleBultosLoading(false);
        return;
      }

      // Cargar detalles reales desde la API
      console.log('🌐 Llamando a ApiService.getDetallesBultos con ID:', escaneo.id);
      const detallesResponse = await ApiService.getDetallesBultos(escaneo.id);
      console.log('✅ Detalles cargados:', detallesResponse);

      // Combinar datos del escaneo con los detalles de bultos agrupados
      const datosCompletos = {
        ...escaneo,
        bultos_agrupados: detallesResponse.bultos_agrupados || [],
        total_grupos: detallesResponse.total_grupos || 0,
        total_bultos: detallesResponse.total_bultos || escaneo.cantidad_bultos || 1,
        volumen_total: detallesResponse.volumen_total || escaneo.volumen,
        peso_total: detallesResponse.peso_total || escaneo.peso
      };

      console.log('📋 Datos completos para el modal:', datosCompletos);
      setDetalleBultosData(datosCompletos);
    } catch (error) {
      console.error('❌ Error cargando detalles de bultos:', error);
      setDetalleBultosError(error.message || 'Error al cargar los detalles de bultos');
      
      // Mantener los datos básicos del escaneo aunque falle la carga de detalles
      setDetalleBultosData({
        ...escaneo,
        bultos_individuales: [],
        cantidad_bultos: escaneo.cantidad_bultos || 1
      });
    } finally {
      setDetalleBultosLoading(false);
      console.log('✅ handleViewDetalleBultos completado');
    }
  };

  // TAB ESCANEOS
  const renderEscaneosTab = () => (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5">ESCANEOS</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button 
            variant="contained" 
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <RefreshIcon />} 
            onClick={() => fetchEscaneos(paginaActual)} 
            disabled={loading} 
            size="small"
            sx={{ 
              backgroundColor: '#5b3ea3',
              '&:hover': { backgroundColor: '#3D2A73' }
            }}
          >
            Actualizar
          </Button>
        </Box>
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
          <Table sx={{ minWidth: 1375 }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontSize: '0.95rem', minWidth: 110 }}>Serial</TableCell>
                <TableCell sx={{ fontSize: '0.95rem', minWidth: 90 }}>Usuario</TableCell>
                <TableCell sx={{ fontSize: '0.95rem', minWidth: 140 }}>Máquina</TableCell>
                <TableCell sx={{ fontSize: '0.95rem', minWidth: 140 }}>Sitio</TableCell>
                <TableCell sx={{ fontSize: '0.95rem', minWidth: 130 }}>Fecha</TableCell>
                <TableCell sx={{ fontSize: '0.95rem', minWidth: 85 }}>Ancho (cm)</TableCell>
                <TableCell sx={{ fontSize: '0.95rem', minWidth: 85 }}>Largo (cm)</TableCell>
                <TableCell sx={{ fontSize: '0.95rem', minWidth: 85 }}>Alto (cm)</TableCell>
                <TableCell sx={{ fontSize: '0.95rem', minWidth: 95 }}>Volumen (dm³)</TableCell>
                <TableCell sx={{ fontSize: '0.95rem', minWidth: 85 }}>Peso (kg)</TableCell>
                <TableCell sx={{ fontSize: '0.95rem', minWidth: 120 }}>Imágenes</TableCell>
                <TableCell sx={{ fontSize: '0.95rem', minWidth: 80 }}>Detalle</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtrarDuplicadosPorSerial(escaneosFiltrados)
                .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
                .map((escaneo) => {
                  return (
                    <TableRow key={escaneo.id} hover>
                      <TableCell sx={{ fontSize: '0.92rem' }}>{escaneo.serial}</TableCell>
                      <TableCell sx={{ fontSize: '0.92rem' }}>{escaneo.usuario || escaneo.usuario_escaneo || escaneo.username || 'N/D'}</TableCell>
                      <TableCell sx={{ fontSize: '0.92rem' }}>{escaneo.maquina?.nombre || escaneo.maquina_modelo || 'N/D'}</TableCell>
                      <TableCell sx={{ fontSize: '0.92rem' }}>{escaneo.sitio?.nombre || escaneo.site_name || 'N/D'}</TableCell>
                      <TableCell sx={{ fontSize: '0.85rem' }}>{formatDate(escaneo.fecha)}</TableCell>
                      <TableCell sx={{ fontSize: '0.92rem' }}>{escaneo.ancho}</TableCell>
                      <TableCell sx={{ fontSize: '0.92rem' }}>{escaneo.largo}</TableCell>
                      <TableCell sx={{ fontSize: '0.92rem' }}>{escaneo.alto || escaneo.altura}</TableCell>
                      <TableCell sx={{ fontSize: '0.92rem' }}>
                        <Chip label={formatVolumeSmart(escaneo.volumen)} size="small" color="secondary" variant="outlined" />
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.92rem' }}>{formatPesoKg(escaneo.peso ?? escaneo.peso_kg ?? escaneo.machine_peso)}</TableCell>
                      <TableCell sx={{ fontSize: '0.92rem' }}>
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap' }}>
                          {/* Imagen 3D */}
                          <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
                            {escaneo.tiene_imagen_3d ? (
                              <Tooltip title="Ver Imagen 3D">
                                <span>
                                  <IconButton 
                                    size="small" 
                                    onClick={() => handleViewImage(escaneo.id, '3d')} 
                                    disabled={loadingImages[`${escaneo.id}_3d`]} 
                                    sx={{ 
                                      color: '#5b3ea3',
                                      '&:hover': { backgroundColor: 'rgba(107, 44, 90, 0.1)' }
                                    }}
                                  >
                                    {loadingImages[`${escaneo.id}_3d`] ? <CircularProgress size={16} /> : <ImageIcon fontSize="small" />}
                                  </IconButton>
                                </span>
                              </Tooltip>
                            ) : (
                              <Tooltip title="Intentar cargar imagen 3D">
                                <span>
                                  <IconButton 
                                    size="small" 
                                    onClick={() => handleTryLoadImage(escaneo.id, '3d')} 
                                    sx={{ 
                                      color: '#999',
                                      '&:hover': { backgroundColor: 'rgba(153, 153, 153, 0.1)' }
                                    }}
                                  >
                                    <ImageIcon fontSize="small" />
                                  </IconButton>
                                </span>
                              </Tooltip>
                            )}
                          </Box>

                          {/* Imagen de Cámara */}
                          <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
                            {escaneo.tiene_imagen_camara ? (
                              <Tooltip title="Ver Foto de Cámara">
                                <span>
                                  <IconButton 
                                    size="small" 
                                    onClick={() => handleViewImage(escaneo.id, 'camara')} 
                                    disabled={loadingImages[`${escaneo.id}_camara`]} 
                                    sx={{ 
                                      color: '#07c7c3',
                                      '&:hover': { backgroundColor: 'rgba(7, 199, 195, 0.1)' }
                                    }}
                                  >
                                    {loadingImages[`${escaneo.id}_camara`] ? <CircularProgress size={16} /> : <CameraIcon fontSize="small" />}
                                  </IconButton>
                                </span>
                              </Tooltip>
                            ) : (
                              <Tooltip title="Intentar cargar imagen de cámara">
                                <span>
                                  <IconButton 
                                    size="small" 
                                    onClick={() => handleTryLoadImage(escaneo.id, 'camara')} 
                                    sx={{ 
                                      color: '#999',
                                      '&:hover': { backgroundColor: 'rgba(153, 153, 153, 0.1)' }
                                    }}
                                  >
                                    <CameraIcon fontSize="small" />
                                  </IconButton>
                                </span>
                              </Tooltip>
                            )}
                          </Box>

                        </Box>
                      </TableCell>
                      {/* Columna Detalle */}
                      <TableCell sx={{ fontSize: '0.92rem', textAlign: 'center' }}>
                        {/* Mostrar ícono + si tiene detalles de bultos, sino gris */}
                        {(() => {
                          const tieneMultiplesBultos = escaneo.cantidad_bultos && escaneo.cantidad_bultos > 1;
                          console.log(`🔍 Escaneo ${escaneo.serial}: cantidad_bultos = ${escaneo.cantidad_bultos}, tieneMultiplesBultos = ${tieneMultiplesBultos}`);
                          
                          return tieneMultiplesBultos ? (
                            <Tooltip title="Ver detalles de bultos individuales">
                              <IconButton 
                                size="small" 
                                sx={{ color: '#5b3ea3' }} 
                                onClick={() => {
                                  console.log('🖱️ Click en detalles de bultos para:', escaneo.serial);
                                  handleViewDetalleBultos(escaneo);
                                }}
                              >
                                <AddIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          ) : (
                            <Tooltip title={`Sin detalles adicionales (${escaneo.cantidad_bultos || 1} bulto${(escaneo.cantidad_bultos || 1) > 1 ? 's' : ''})`}>
                              <IconButton size="small" disabled sx={{ color: '#ccc' }}>
                                <AddIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          );
                        })()}
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
        <DialogTitle sx={{ background: 'linear-gradient(135deg, #5b3ea3 0%, #7B5BB8 100%)', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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

      {/* Modal de Detalles de Bultos */}
      <Dialog open={detalleBultosModalOpen} onClose={() => setDetalleBultosModalOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle sx={{ background: 'linear-gradient(135deg, #5b3ea3 0%, #7B5BB8 100%)', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Detalles de Bultos - {detalleBultosData?.serial}</Typography>
          <IconButton onClick={() => setDetalleBultosModalOpen(false)} sx={{ color: 'white' }}><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          {/* Estado de carga */}
          {detalleBultosLoading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
              <CircularProgress sx={{ mr: 2 }} />
              <Typography variant="body1">Cargando detalles de bultos...</Typography>
            </Box>
          )}

          {/* Mensaje de error */}
          {detalleBultosError && (
            <Alert severity="warning" sx={{ mb: 3 }}>
              <Typography variant="body2">
                <strong>Advertencia:</strong> {detalleBultosError}
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                Se mostrarán los datos básicos del escaneo, pero los detalles individuales de bultos no están disponibles.
              </Typography>
            </Alert>
          )}

          {/* Contenido principal */}
          {detalleBultosData && !detalleBultosLoading && (
            <>
              {/* Resumen del lote */}
              <Box sx={{ mb: 3, p: 2, bgcolor: '#f5f5f5', borderRadius: 2 }}>
                <Typography variant="h6" sx={{ mb: 1 }}>Resumen del Lote</Typography>
                <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                  <Chip label={`${detalleBultosData.total_bultos || detalleBultosData.cantidad_bultos || 1} bultos`} color="primary" />
                  <Chip label={`${detalleBultosData.total_grupos || 1} grupos diferentes`} color="info" />
                  <Chip label={`Volumen total: ${formatVolumeSmart(detalleBultosData.volumen_total || detalleBultosData.volumen)}`} color="secondary" />
                  <Chip label={`Peso total: ${formatPesoKg(detalleBultosData.peso_total || detalleBultosData.peso)}`} color="default" />
                </Box>
              </Box>

              {/* Tabla de grupos de bultos */}
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Grupo</TableCell>
                      <TableCell>Cantidad</TableCell>
                      <TableCell>Ancho (cm)</TableCell>
                      <TableCell>Largo (cm)</TableCell>
                      <TableCell>Alto (cm)</TableCell>
                      <TableCell>Volumen Unit. (dm³)</TableCell>
                      <TableCell>Peso Unit. (kg)</TableCell>
                      <TableCell>Volumen Total</TableCell>
                      <TableCell>Peso Total</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {detalleBultosData.bultos_agrupados && detalleBultosData.bultos_agrupados.length > 0 ? (
                      detalleBultosData.bultos_agrupados.map((grupo, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <Chip label={`Grupo ${index + 1}`} size="small" color="primary" variant="outlined" />
                          </TableCell>
                          <TableCell>
                            <Chip label={`${grupo.cantidad_grupos} bultos`} size="small" color="secondary" />
                          </TableCell>
                          <TableCell>{formatDimensionCm(grupo.ancho)}</TableCell>
                          <TableCell>{formatDimensionCm(grupo.largo)}</TableCell>
                          <TableCell>{formatDimensionCm(grupo.alto)}</TableCell>
                          <TableCell><Chip label={formatVolumeSmart(grupo.volumen)} size="small" color="secondary" variant="outlined" /></TableCell>
                          <TableCell>{formatPesoKg(grupo.peso)}</TableCell>
                          <TableCell><Chip label={formatVolumeSmart(grupo.volumen_total_grupo)} size="small" color="info" /></TableCell>
                          <TableCell><Chip label={formatPesoKg(grupo.peso_total_grupo)} size="small" color="warning" /></TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={9} sx={{ textAlign: 'center', py: 3 }}>
                          <Typography variant="body2" color="text.secondary">
                            {detalleBultosError 
                              ? 'No se pudieron cargar los detalles de bultos agrupados'
                              : 'No hay detalles de bultos agrupados disponibles'
                            }
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );

  // RESTO DE TABS: En desarrollo
  const renderOtherTabs = () => (
    <>
      {currentTab === 2 ? <UserProfile /> : <Typography sx={{p:3, textAlign: 'center'}}>Sección en desarrollo.</Typography>}
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
          <img src="/cloudblanco.png" alt="Logintec" style={{ height: '100px', width: 'auto', marginRight: '16px' }} onError={(e) => { e.target.style.display = 'none'; }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }} />
          
          {/* Indicador de Modo Demo */}
          {isDemoMode() && (
            <Chip 
              label="MODO DEMO" 
              color="warning" 
              variant="filled" 
              sx={{ 
                mr: 2, 
                fontWeight: 'bold',
                backgroundColor: '#ff9800',
                color: 'white',
                '& .MuiChip-label': {
                  fontSize: '0.75rem'
                }
              }} 
            />
          )}
          
          {/* Indicador de Modo Real */}
          {!isDemoMode() && (
            <Chip 
              label="MODO REAL" 
              variant="filled" 
              sx={{ 
                mr: 2, 
                fontWeight: 'bold',
                backgroundColor: '#07c7c3',
                color: 'white',
                '& .MuiChip-label': {
                  fontSize: '0.75rem'
                }
              }} 
            />
          )}
          
          <Button color="inherit" onClick={onLogout} startIcon={<LogoutIcon />}>Salir</Button>
        </Toolbar>
      </AppBar>
      <Container maxWidth="xl" sx={{ py: 4, px: 4 }}>
        <Paper elevation={0} sx={{ mb: 3 }}>
          <Tabs value={currentTab} onChange={(e, val) => setCurrentTab(val)} variant="fullWidth">
            <Tab label="EQUIPOS" />
            <Tab label="ESCANEOS" />
            <Tab label="USUARIO" />
          </Tabs>
        </Paper>
        <Box sx={{ mt: 7 }}>{renderTabContent()}        </Box>
      </Container>
      
      {/* Modal de Diagnóstico de Imágenes */}
      {diagnosticData && (
        <WorkingImageDiagnosticModal
          open={diagnosticModalOpen}
          onClose={() => {
            setDiagnosticModalOpen(false);
            setDiagnosticData(null);
          }}
          scanId={diagnosticData.scanId}
          tipo={diagnosticData.tipo}
          serial={diagnosticData.serial}
        />
      )}
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