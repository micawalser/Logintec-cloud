import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { 
  Box, TextField, Button, Paper, Typography, AppBar, Toolbar,
  Tabs, Tab, Container, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, ThemeProvider, createTheme, CircularProgress,
  Alert, Chip, Dialog, DialogContent, DialogTitle, IconButton, Tooltip, Fab, CssBaseline
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
  fetchEscaneos: () => axios.get(`${API_BASE_URL}/api/cloud/escaneos`, { headers: getAuthHeaders() }),
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
  
  try {
    let date;
    
    if (typeof dateInput === 'string') {
      // Manejar diferentes formatos de fecha
      if (dateInput.includes('T')) {
        // Formato ISO
        date = new Date(dateInput);
      } else if (dateInput.includes('/')) {
        // Formato DD/MM/YYYY o MM/DD/YYYY
        date = new Date(dateInput);
      } else {
        // Formato 'YYYY-MM-DD HH:mm:ss' - agregar T
        const isoUtcDateTime = dateInput.replace(' ', 'T') + 'Z';
        date = new Date(isoUtcDateTime);
      }
    } else {
      date = new Date(dateInput);
    }
    
    if (isNaN(date.getTime())) {
      console.warn('Fecha inválida:', dateInput);
      return 'Fecha inválida';
    }
    
    return date.toLocaleString('es-AR', {
      timeZone: 'America/Argentina/Buenos_Aires',
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit',
      hour: '2-digit', 
      minute: '2-digit', 
      hourCycle: 'h23'
    });
    
  } catch (error) {
    console.error('Error formateando fecha:', error, dateInput);
    return 'Error de fecha';
  }
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

// ✅ FUNCIÓN CORREGIDA PARA OBTENER USUARIO
const getUsuarioValue = (escaneo) => {
  console.log('Debug - escaneo completo:', escaneo); // Para debugging
  
  // Prioridad 1: usuario_escaneo ya resuelto desde backend
  if (escaneo.usuario_escaneo && 
      escaneo.usuario_escaneo !== '' && 
      escaneo.usuario_escaneo !== null && 
      escaneo.usuario_escaneo !== 'No especificado') {
    
    // Si aún es un ID numérico, intentar convertir a nombre
    if (escaneo.usuario_escaneo === '1') {
      return 'admin';
    }
    
    return escaneo.usuario_escaneo;
  }
  
  // Prioridad 2: Buscar en otros campos de usuario  
  const campos = ['usuario_nombre_completo', 'username', 'user_name', 'nombre_usuario', 'usuario_nombre'];
  for (const campo of campos) {
    const valor = escaneo[campo];
    if (valor && valor !== '' && valor !== null && valor !== 'undefined') {
      return valor;
    }
  }
  
  // Prioridad 3: Si hay user_id, intentar mapear
  if (escaneo.user_id) {
    if (escaneo.user_id === 1 || escaneo.user_id === '1') {
      return 'admin';
    }
    return `Usuario ID: ${escaneo.user_id}`;
  }
  
  // Prioridad 4: Verificar si viene de sistema
  if (escaneo.sistema || escaneo.is_system) {
    return 'Sistema';
  }
  
  // Por defecto
  return 'Usuario desconocido';
};

// ✅ FUNCIÓN MEJORADA PARA VERIFICAR IMÁGENES
const hasImage = (escaneo, tipo) => {
  if (!escaneo) return false;
  
  const flag = tipo === '3d' ? escaneo.tiene_imagen_3d : escaneo.tiene_imagen_camara;
  const image = tipo === '3d' ? escaneo.imagen_3d : escaneo.imagen_camara;
  const filename = tipo === '3d' ? escaneo.imagen_3d_filename : escaneo.imagen_camara_filename;
  
  // Verificar si existe la imagen por flag, base64 o filename
  return !!(flag || (image && image.length > 0) || (filename && filename !== '' && filename !== null));
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
// COMPONENT: EscaneosTable CORREGIDA
// ========================================================================
const EscaneosTable = ({ escaneos, onViewImage, loadingImages }) => {
  return (
    <TableContainer 
      component={Paper} 
      sx={{ 
        mt: 2,
        maxHeight: 600, 
        overflow: 'auto',
        '& .MuiTableCell-root': {
          padding: '8px 12px',
          fontSize: '0.875rem',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }
      }}
    >
      <Table stickyHeader size="small">
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: 'bold', minWidth: 120 }}>Serial</TableCell>
            <TableCell sx={{ fontWeight: 'bold', minWidth: 100 }}>Usuario</TableCell>
            <TableCell sx={{ fontWeight: 'bold', minWidth: 140 }}>Fecha</TableCell>
            <TableCell sx={{ fontWeight: 'bold', minWidth: 90 }} align="right">Ancho (cm)</TableCell>
            <TableCell sx={{ fontWeight: 'bold', minWidth: 90 }} align="right">Largo (cm)</TableCell>
            <TableCell sx={{ fontWeight: 'bold', minWidth: 90 }} align="right">Alto (cm)</TableCell>
            <TableCell sx={{ fontWeight: 'bold', minWidth: 120 }} align="right">Volumen (dm³)</TableCell>
            <TableCell sx={{ fontWeight: 'bold', minWidth: 120 }} align="center">Imágenes</TableCell>
            <TableCell sx={{ fontWeight: 'bold', minWidth: 80 }} align="center">Acciones</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {escaneos.map((escaneo) => (
            <TableRow 
              key={escaneo.id} 
              hover
              sx={{ 
                '&:nth-of-type(odd)': { backgroundColor: '#f5f5f5' },
                '&:hover': { backgroundColor: '#e3f2fd' }
              }}
            >
              {/* Serial */}
              <TableCell>
                <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 'medium' }}>
                  {getSafeValue(escaneo, 'serial', 'Sin SN')}
                </Typography>
              </TableCell>

              {/* Usuario - CORREGIDO */}
              <TableCell>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: escaneo.usuario_escaneo === 'admin' ? '#1976d2' : '#666',
                    fontWeight: escaneo.usuario_escaneo === 'admin' ? 'bold' : 'normal'
                  }}
                >
                  {getUsuarioValue(escaneo)}
                </Typography>
              </TableCell>

              {/* Fecha - CORREGIDA */}
              <TableCell>
                <Typography variant="body2" sx={{ fontSize: '0.8rem', color: '#666' }}>
                  {formatDate(escaneo.fecha)}
                </Typography>
              </TableCell>

              {/* Dimensiones - CORREGIDAS */}
              <TableCell align="right">
                <Typography variant="body2">
                  {formatDimensionCm(escaneo.ancho)}
                </Typography>
              </TableCell>
              <TableCell align="right">
                <Typography variant="body2">
                  {formatDimensionCm(escaneo.largo)}
                </Typography>
              </TableCell>
              <TableCell align="right">
                <Typography variant="body2">
                  {formatDimensionCm(escaneo.alto)}
                </Typography>
              </TableCell>

              {/* Volumen - CORREGIDO */}
              <TableCell align="right">
                <Chip 
                  label={formatVolume3Decimals(escaneo.volumen)} 
                  size="small" 
                  color="secondary" 
                  variant="outlined" 
                />
              </TableCell>

              {/* Imágenes - CORREGIDAS */}
              <TableCell align="center">
                <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                  {hasImage(escaneo, '3d') && (
                    <Tooltip title="Ver Imagen 3D">
                      <span>
                        <IconButton 
                          size="small" 
                          onClick={() => onViewImage(escaneo.id, '3d')} 
                          disabled={loadingImages[`${escaneo.id}_3d`]} 
                          sx={{ color: '#FF9800' }}
                        >
                          {loadingImages[`${escaneo.id}_3d`] ? 
                            <CircularProgress size={16} /> : 
                            <ImageIcon fontSize="small" />
                          }
                        </IconButton>
                      </span>
                    </Tooltip>
                  )}
                  {hasImage(escaneo, 'camara') && (
                    <Tooltip title="Ver Foto de Cámara">
                      <span>
                        <IconButton 
                          size="small" 
                          onClick={() => onViewImage(escaneo.id, 'camara')} 
                          disabled={loadingImages[`${escaneo.id}_camara`]} 
                          sx={{ color: '#7CB342' }}
                        >
                          {loadingImages[`${escaneo.id}_camara`] ? 
                            <CircularProgress size={16} /> : 
                            <CameraIcon fontSize="small" />
                          }
                        </IconButton>
                      </span>
                    </Tooltip>
                  )}
                  {!hasImage(escaneo, '3d') && !hasImage(escaneo, 'camara') && (
                    <Chip 
                      label="Sin imágenes" 
                      size="small" 
                      variant="outlined" 
                      sx={{ fontSize: '0.7rem' }}
                    />
                  )}
                </Box>
              </TableCell>

              {/* Acciones */}
              <TableCell align="center">
                <Tooltip title="Ver detalles del escaneo">
                  <IconButton 
                    size="small" 
                    sx={{ color: '#6B2C5A' }}
                    onClick={() => {
                      console.log('Ver detalles de:', escaneo);
                    }}
                  >
                    <ViewIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </TableCell>
            </TableRow>
          ))}
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
  
  const fetchAllData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      await api.fetchCurrentUser();
      const escaneosRes = await api.fetchEscaneos();
      
      console.log('📊 Datos recibidos del backend:', escaneosRes.data);
      
      setEscaneos(escaneosRes.data || []);
      setEscaneosFiltrados(escaneosRes.data || []);
    } catch (err) {
      console.error('❌ Error cargando datos:', err);
      setError('No se pudo cargar los datos. Intenta de nuevo.');
      if (err.response?.status === 401) onLogout();
    } finally {
      setLoading(false);
    }
  }, [onLogout]);

  useEffect(() => { fetchAllData(); }, [fetchAllData]);

  useEffect(() => {
    const filtrados = searchSN.trim() 
      ? escaneos.filter(e => e.serial?.toLowerCase().includes(searchSN.toLowerCase()))
      : escaneos;
    setEscaneosFiltrados(filtrados);
  }, [searchSN, escaneos]);

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
    } catch (err) {
      const message = err.response?.status === 404 ? 'Imagen no encontrada' : `Error: ${err.message}`;
      alert(message);
    } finally {
      setLoadingImages(prev => ({ ...prev, [`${scanId}_${tipo}`]: false }));
    }
  };

  const renderTabContent = () => {
    if (currentTab !== 1) return <Typography sx={{p:3, textAlign: 'center'}}>Sección en desarrollo.</Typography>;
    
    return (
      <>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5">ESCANEOS</Typography>
          <Button variant="contained" startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <RefreshIcon />} onClick={fetchAllData} disabled={loading} size="small">
            Actualizar
          </Button>
        </Box>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Paper sx={{ p: 2, mb: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
          <SearchIcon color="action" />
          <TextField fullWidth size="small" placeholder="Buscar por número de serie..." value={searchSN} onChange={(e) => setSearchSN(e.target.value)} variant="outlined"
            InputProps={{
              endAdornment: searchSN && <IconButton size="small" onClick={() => setSearchSN('')}><ClearIcon /></IconButton>
            }}
          />
        </Paper>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>
        ) : (
          <EscaneosTable escaneos={escaneosFiltrados} onViewImage={handleViewImage} loadingImages={loadingImages}/>
        )}
      </>
    );
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
      <ImageModal open={imageDialogOpen} onClose={() => setImageDialogOpen(false)} image={selectedImage} />
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

export default App;