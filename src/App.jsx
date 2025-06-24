import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { 
  Box, TextField, Button, Paper, Typography, AppBar, Toolbar,
  Tabs, Tab, Container, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, ThemeProvider, createTheme, CircularProgress,
  Alert, Chip, Dialog, DialogContent, DialogTitle, IconButton, Tooltip, Fab
} from '@mui/material';
import { 
  Visibility as ViewIcon,
  Image as ImageIcon,
  Camera as CameraIcon,
  Close as CloseIcon,
  Refresh as RefreshIcon,
  Assessment as AssessmentIcon,
  Logout as LogoutIcon
} from '@mui/icons-material';

// ✅ TU TEMA (SIN CAMBIOS)
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
    h4: { fontWeight: 600, color: '#2C2C2C', },
    h5: { fontWeight: 500, color: '#2C2C2C', },
    h6: { fontWeight: 500, color: '#FFFFFF', }
  },
  components: {
    MuiAppBar: { styleOverrides: { root: { background: 'linear-gradient(135deg, #6B2C5A 0%, #8E4B7B 100%)', boxShadow: '0 4px 20px rgba(107, 44, 90, 0.3)', }, }, },
    MuiPaper: { styleOverrides: { root: { borderRadius: 12, boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)', }, }, },
    MuiButton: { styleOverrides: { contained: { borderRadius: 8, textTransform: 'none', fontWeight: 500, boxShadow: '0 4px 12px rgba(107, 44, 90, 0.3)', '&:hover': { boxShadow: '0 6px 16px rgba(107, 44, 90, 0.4)', }, }, outlined: { borderRadius: 8, textTransform: 'none', fontWeight: 500, }, }, },
    MuiTableCell: { styleOverrides: { head: { backgroundColor: '#F5F5F5', fontWeight: 600, color: '#2C2C2C', }, }, },
    MuiTabs: { styleOverrides: { root: { backgroundColor: '#FFFFFF', borderRadius: '12px 12px 0 0', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)', }, indicator: { backgroundColor: '#6B2C5A', height: 3, }, }, },
    MuiTab: { styleOverrides: { root: { textTransform: 'none', fontWeight: 500, fontSize: '0.95rem', color: '#666666', '&.Mui-selected': { color: '#6B2C5A', fontWeight: 600, }, }, }, },
  },
});

function App() {
  // === ESTADOS ===
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('authToken'));
  const [loginError, setLoginError] = useState('');
  const [isLoginLoading, setIsLoginLoading] = useState(false);
  
  // Estados del dashboard
  const [currentTab, setCurrentTab] = useState(1);
  const [escaneos, setEscaneos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({});
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [loadingImages, setLoadingImages] = useState({});

  // URL base de tu API
  const API_BASE_URL = 'https://logintec-1.onrender.com';

  // === LÓGICA DE AUTENTICACIÓN ===
  const handleLogin = async () => {
    setIsLoginLoading(true);
    setLoginError('');
    const params = new URLSearchParams();
    params.append('username', usuario);
    params.append('password', password);
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/token`, params);
      localStorage.setItem('authToken', response.data.access_token);
      setIsLoggedIn(true);
    } catch (err) {
      setLoginError(err.response?.data?.detail || 'Ocurrió un error. Inténtalo de nuevo.');
    } finally {
      setIsLoginLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    setIsLoggedIn(false);
    setEscaneos([]);
    setStats({});
  };

  const getAuthHeaders = () => ({
    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
  });
  
  // === LÓGICA DE DATOS ===
  const fetchEscaneos = useCallback(async () => {
    if (!isLoggedIn) return;
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(`${API_BASE_URL}/api/cloud/escaneos`, { headers: getAuthHeaders() });
      
      // ✅ DEBUG: Buscar SOLO los escaneos que SÍ tienen imágenes
      const escaneosConImagenes = response.data.filter(escaneo => 
        escaneo.imagen_3d || escaneo.imagen_camara || 
        escaneo.imagen_3d_filename || escaneo.imagen_camara_filename ||
        escaneo.tiene_imagen_3d || escaneo.tiene_imagen_camara
      );
      
      console.log(`📊 Total escaneos: ${response.data.length}`);
      console.log(`🖼️ Escaneos CON imágenes: ${escaneosConImagenes.length}`);
      
      if (escaneosConImagenes.length > 0) {
        console.log('🎯 ESCANEOS CON IMÁGENES ENCONTRADOS:');
        escaneosConImagenes.forEach(escaneo => {
          console.log(`📷 Escaneo ${escaneo.serial} (ID: ${escaneo.id}):`, {
            tiene_imagen_3d: escaneo.tiene_imagen_3d,
            tiene_imagen_camara: escaneo.tiene_imagen_camara,
            imagen_3d_existe: !!escaneo.imagen_3d,
            imagen_camara_existe: !!escaneo.imagen_camara,
            imagen_3d_filename: escaneo.imagen_3d_filename,
            imagen_camara_filename: escaneo.imagen_camara_filename
          });
        });
      } else {
        console.log('❌ NO se encontraron escaneos con imágenes en los datos recibidos');
        console.log('🔍 Verificar si el backend está devolviendo TODOS los escaneos...');
      }
      
      setEscaneos(response.data || []);
    } catch (err) {
      setError('No se pudo cargar la lista de escaneos.');
      console.error('Error fetching escaneos:', err);
    } finally {
      setLoading(false);
    }
  }, [isLoggedIn]);

  const fetchStats = useCallback(async () => {
    if (!isLoggedIn) return;
    try {
      const response = await axios.get(`${API_BASE_URL}/api/cloud/estadisticas`, { headers: getAuthHeaders() });
      setStats(response.data || {});
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  }, [isLoggedIn]);

  const fetchImage = async (scanId, tipo) => {
    setLoadingImages(prev => ({...prev, [`${scanId}_${tipo}`]: true}));
    try {
      const response = await axios.get(`${API_BASE_URL}/api/cloud/escaneo/${scanId}/imagen?tipo=${tipo}`, { headers: getAuthHeaders() });
      if (response.data.success) {
        setSelectedImage({
          base64: response.data.imagen_base64,
          filename: response.data.filename,
          tipo: tipo === '3d' ? 'Imagen 3D' : 'Foto de Cámara',
          scanId: scanId,
          serial: response.data.serial
        });
        setImageDialogOpen(true);
      }
    } catch (err) {
      alert('Error al cargar la imagen.');
      console.error(err);
    } finally {
      setLoadingImages(prev => ({...prev, [`${scanId}_${tipo}`]: false}));
    }
  };
  
  useEffect(() => {
    if (isLoggedIn) {
      if(currentTab === 1) fetchEscaneos();
      if(currentTab === 0 || currentTab === 1) fetchStats();
    }
  }, [isLoggedIn, currentTab, fetchEscaneos, fetchStats]);

  // === FUNCIONES DE FORMATEO ===
  const formatDate = (dateInput) => {
    if (!dateInput) return 'N/A';

    let date;

    if (typeof dateInput === 'string') {
      // The backend provides a date/time string in UTC.
      // We need to ensure JavaScript parses it as UTC.
      // A standard ISO 8601 format with a 'Z' is the most reliable way.
      // e.g., "2025-06-24 18:28:00" becomes "2025-06-24T18:28:00Z"
      const isoUtcDateTime = dateInput.replace(' ', 'T') + 'Z';
      date = new Date(isoUtcDateTime);
    } else {
      // Assumes dateInput is a Date object
      date = new Date(dateInput);
    }

    // If parsing fails, return a message.
    if (isNaN(date.getTime())) {
      console.error("Invalid date received:", dateInput);
      return 'Fecha inválida';
    }

    return date.toLocaleString('es-AR', {
      timeZone: 'America/Argentina/Buenos_Aires',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23' // This forces 24-hour format (e.g., 15:28)
    });
  };

  const formatVolume3Decimals = (volumenMm3) => {
    if (!volumenMm3 && volumenMm3 !== 0) return 'N/A';
    const volumenDm3 = volumenMm3 / 1000000;
    return `${volumenDm3.toFixed(3)} dm³`;
  };

  const calculateVolume = (escaneo) => {
    if (escaneo.volumen) {
      return escaneo.volumen;
    }
    
    const ancho = escaneo.ancho || 0;
    const altura = escaneo.altura || escaneo.alto || 0;
    const largo = escaneo.largo || 0;
    
    if (ancho && altura && largo) {
      return ancho * altura * largo;
    }
    
    return null;
  };

  const getLargoValue = (escaneo) => {
    if (escaneo.largo !== null && escaneo.largo !== undefined) {
      return escaneo.largo;
    }
    
    if (escaneo.alto !== null && escaneo.alto !== undefined) {
      return `${escaneo.alto}*`;
    }
    
    return 'N/A';
  };

  const getSafeValue = (escaneo, field, defaultValue = 'N/A') => {
    const value = escaneo[field];
    if (value !== undefined && value !== null && value !== '') {
      return value;
    }
    return defaultValue;
  };

  const hasImage = (escaneo, tipo) => {
    if (tipo === '3d') {
      const tieneFlag = escaneo.tiene_imagen_3d;
      const imagen = escaneo.imagen_3d;
      const filename = escaneo.imagen_3d_filename;
      
      // ✅ DEBUG: Ver exactamente qué hay en cada campo
      console.log(`🔍 Escaneo ${escaneo.serial} - Imagen 3D:`, {
        tieneFlag: tieneFlag,
        imagen_existe: !!imagen,
        imagen_length: imagen ? imagen.length : 0,
        filename: filename
      });
      
      return tieneFlag === true || !!imagen || !!filename;
      
    } else if (tipo === 'camara') {
      const tieneFlag = escaneo.tiene_imagen_camara;
      const imagen = escaneo.imagen_camara;
      const filename = escaneo.imagen_camara_filename;
      
      // ✅ DEBUG: Ver exactamente qué hay en cada campo
      console.log(`🔍 Escaneo ${escaneo.serial} - Imagen Cámara:`, {
        tieneFlag: tieneFlag,
        imagen_existe: !!imagen,
        imagen_length: imagen ? imagen.length : 0,
        filename: filename
      });
      
      return tieneFlag === true || !!imagen || !!filename;
    }
    return false;
  };

  // === COMPONENTES VISUALES ===
  const ImageModal = () => (
    <Dialog open={imageDialogOpen} onClose={() => setImageDialogOpen(false)} maxWidth="lg" fullWidth>
      <DialogTitle sx={{ background: 'linear-gradient(135deg, #6B2C5A 0%, #8E4B7B 100%)', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">{selectedImage?.tipo} - {selectedImage?.filename}</Typography>
        <IconButton onClick={() => setImageDialogOpen(false)} sx={{ color: 'white' }}><CloseIcon /></IconButton>
      </DialogTitle>
      <DialogContent sx={{ p: 2 }}>
        {selectedImage && (
          <Box sx={{ textAlign: 'center' }}>
            <img 
              src={`data:image/jpeg;base64,${selectedImage.base64}`} 
              alt={selectedImage.filename} 
              style={{ maxWidth: '100%', maxHeight: '70vh', objectFit: 'contain', borderRadius: 8, boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)' }} 
            />
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', gap: 2 }}>
              <Chip label={`Serial: ${selectedImage.serial}`} color="primary" variant="outlined" />
              <Chip label={selectedImage.tipo} color="secondary" variant="outlined" />
            </Box>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );

  const EscaneosTable = () => (
    <TableContainer component={Paper} sx={{ mt: 2 }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell><strong>Serial</strong></TableCell>
            <TableCell><strong>Usuario</strong></TableCell>
            <TableCell><strong>Fecha</strong></TableCell>
            <TableCell><strong>Ancho (mm)</strong></TableCell>
            <TableCell><strong>Largo (mm)</strong></TableCell>
            <TableCell><strong>Alto (mm)</strong></TableCell>
            <TableCell><strong>Volumen (dm³)</strong></TableCell>
            <TableCell><strong>Peso (kg)</strong></TableCell>
            <TableCell><strong>Imágenes</strong></TableCell>
            <TableCell><strong>Acciones</strong></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {escaneos.map((escaneo) => (
            <TableRow key={escaneo.id} hover>
              <TableCell>
                <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 500 }}>
                  {getSafeValue(escaneo, 'serial')}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2" sx={{ color: '#6B2C5A', fontWeight: 500 }}>
                  {getSafeValue(escaneo, 'usuario_escaner') || getSafeValue(escaneo, 'usuario')}
                </Typography>
              </TableCell>
              <TableCell>{formatDate(escaneo.fecha)}</TableCell>
              <TableCell sx={{ textAlign: 'center' }}>
                {getSafeValue(escaneo, 'ancho')}
              </TableCell>
              <TableCell sx={{ textAlign: 'center' }}>
                {getLargoValue(escaneo)}
              </TableCell>
              <TableCell sx={{ textAlign: 'center' }}>
                {getSafeValue(escaneo, 'altura') || getSafeValue(escaneo, 'alto')}
              </TableCell>
              <TableCell>
                <Chip 
                  label={formatVolume3Decimals(calculateVolume(escaneo))} 
                  size="small" 
                  color="secondary" 
                  variant="outlined" 
                />
              </TableCell>
              <TableCell sx={{ textAlign: 'center', fontWeight: 500 }}>
                {escaneo.peso_kg || escaneo.peso ? `${escaneo.peso_kg || escaneo.peso} kg` : 'N/A'}
              </TableCell>
              <TableCell>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  {hasImage(escaneo, '3d') && (
                    <Tooltip title="Ver Imagen 3D">
                      <IconButton 
                        size="small" 
                        onClick={() => fetchImage(escaneo.id, '3d')} 
                        disabled={loadingImages[`${escaneo.id}_3d`]} 
                        sx={{ color: '#6B2C5A' }}
                      >
                        {loadingImages[`${escaneo.id}_3d`] ? <CircularProgress size={16} /> : <ImageIcon fontSize="small" />}
                      </IconButton>
                    </Tooltip>
                  )}
                  {hasImage(escaneo, 'camara') && (
                    <Tooltip title="Ver Foto de Cámara">
                      <IconButton 
                        size="small" 
                        onClick={() => fetchImage(escaneo.id, 'camara')} 
                        disabled={loadingImages[`${escaneo.id}_camara`]} 
                        sx={{ color: '#7CB342' }}
                      >
                        {loadingImages[`${escaneo.id}_camara`] ? <CircularProgress size={16} /> : <CameraIcon fontSize="small" />}
                      </IconButton>
                    </Tooltip>
                  )}
                  {!hasImage(escaneo, '3d') && !hasImage(escaneo, 'camara') && (
                    <Chip label="Sin imágenes" size="small" variant="outlined" />
                  )}
                </Box>
              </TableCell>
              <TableCell>
                <IconButton size="small" sx={{ color: '#6B2C5A' }}>
                  <ViewIcon fontSize="small" />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  // Datos fake para otras pestañas
  const maquinasFake = [{ nombre: "LS1000 Scanner", descripcion: "Escáner 3D Industrial", macAddress: "60:D7:E3:DC:1D:E0", idMaquina: "LS1000_001", ipAddress: "192.168.1.100", modelo: "LS1000", sitio: "Buenos Aires", ultimoEscaneo: formatDate(new Date()) }];
  const usuariosFake = [{ usuario: "CLIENTE_001", nombreCompleto: "EMPRESA_PRUEBA", email: "contacto@empresa-prueba.com", rol: "Cliente", ultimoAcceso: formatDate(new Date()), estado: "Activo" }];
  
  const renderTabContent = () => {
    switch (currentTab) {
      case 0: return (
        <div>
          <Typography variant="h5" gutterBottom>MÁQUINAS</Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Nombre</strong></TableCell>
                  <TableCell><strong>Descripción</strong></TableCell>
                  <TableCell><strong>MAC</strong></TableCell>
                  <TableCell><strong>ID</strong></TableCell>
                  <TableCell><strong>IP</strong></TableCell>
                  <TableCell><strong>Modelo</strong></TableCell>
                  <TableCell><strong>Sitio</strong></TableCell>
                  <TableCell><strong>Último Escaneo</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {maquinasFake.map((m, i) => (
                  <TableRow key={i}>
                    <TableCell>{m.nombre}</TableCell>
                    <TableCell>{m.descripcion}</TableCell>
                    <TableCell>{m.macAddress}</TableCell>
                    <TableCell>{m.idMaquina}</TableCell>
                    <TableCell>{m.ipAddress}</TableCell>
                    <TableCell>{m.modelo}</TableCell>
                    <TableCell>{m.sitio}</TableCell>
                    <TableCell>{m.ultimoEscaneo}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </div>
      );
      case 1: return (
        <div>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h5">ESCANEOS</Typography>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <Chip label={`Total: ${stats.total_escaneos || 0}`} color="primary" variant="outlined" />
              <Button 
                variant="contained" 
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <RefreshIcon />} 
                onClick={fetchEscaneos} 
                disabled={loading} 
                size="small"
              >
                Actualizar
              </Button>
            </Box>
          </Box>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
          )}
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : escaneos.length === 0 ? (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="h6" color="textSecondary">No hay escaneos disponibles</Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                Verifica que tu usuario tenga escaneos asociados
              </Typography>
            </Paper>
          ) : (
            <>
              <EscaneosTable />
              <Box sx={{ mt: 2, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
                <Typography variant="body2" color="textSecondary">
                  <strong>*</strong> Los valores con asterisco (*) son estimados desde datos legacy.
                  Los nuevos escaneos mostrarán valores exactos de largo.
                </Typography>
              </Box>
            </>
          )}
        </div>
      );
      case 2: return (
        <div>
          <Typography variant="h5" gutterBottom>USUARIOS</Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Usuario</strong></TableCell>
                  <TableCell><strong>Nombre</strong></TableCell>
                  <TableCell><strong>Email</strong></TableCell>
                  <TableCell><strong>Rol</strong></TableCell>
                  <TableCell><strong>Último Acceso</strong></TableCell>
                  <TableCell><strong>Estado</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {usuariosFake.map((u, i) => (
                  <TableRow key={i}>
                    <TableCell>{u.usuario}</TableCell>
                    <TableCell>{u.nombreCompleto}</TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell><Chip label={u.rol} color="primary" size="small" /></TableCell>
                    <TableCell>{u.ultimoAcceso}</TableCell>
                    <TableCell><Chip label={u.estado} color={u.estado === 'Activo' ? 'success' : 'error'} size="small" /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </div>
      );
      default: return (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="textSecondary">Sección en desarrollo</Typography>
        </Paper>
      );
    }
  };

  const handleTabChange = (event, newValue) => { setCurrentTab(newValue); };

  // === RENDERIZADO PRINCIPAL ===
  if (!isLoggedIn) {
    return (
      <ThemeProvider theme={theme}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: 'linear-gradient(135deg, #FAFAFA 0%, #F0F0F0 100%)' }}>
          <Paper elevation={8} sx={{ padding: 5, width: 400, borderRadius: 3 }}>
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <img src="/logocarga.png" alt="Logintec" style={{ width: '220px', height: 'auto', marginBottom: '16px' }} onError={(e) => { e.target.style.display = 'none'; }} />
              <Typography variant="body2" color="text.secondary">Sistema de Gestión de Escaneos</Typography>
            </Box>
            <TextField fullWidth label="Email de Usuario" value={usuario} onChange={(e) => setUsuario(e.target.value)} margin="normal" variant="outlined" />
            <TextField fullWidth label="Contraseña" type="password" value={password} onChange={(e) => setPassword(e.target.value)} margin="normal" variant="outlined" />
            {loginError && <Alert severity="error" sx={{ mt: 2, textAlign: 'left' }}>{loginError}</Alert>}
            <Button fullWidth variant="contained" onClick={handleLogin} size="large" disabled={isLoginLoading} sx={{ mt: 3, py: 1.5 }}>
              {isLoginLoading ? <CircularProgress size={24} color="inherit" /> : 'Ingresar'}
            </Button>
          </Paper>
        </Box>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ backgroundColor: '#FAFAFA', minHeight: '100vh' }}>
        <AppBar position="static" elevation={0}>
          <Toolbar sx={{ py: 1 }}>
            <img src="/logoblanco.png" alt="Logintec" style={{ height: '120px', width: 'auto', marginRight: '16px' }} onError={(e) => { e.target.style.display = 'none'; }} />
            <Typography variant="h6" sx={{ flexGrow: 1 }} />
            <Button color="inherit" onClick={handleLogout} startIcon={<LogoutIcon />}>Salir</Button>
          </Toolbar>
        </AppBar>
        <Container maxWidth="xl" sx={{ py: 4 }}>
          <Paper elevation={0} sx={{ mb: 3 }}>
            <Tabs value={currentTab} onChange={handleTabChange} variant="fullWidth" sx={{ px: 2 }}>
              <Tab label="MÁQUINAS" />
              <Tab label="ESCANEOS" />
              <Tab label="USUARIOS" />
              <Tab label="LOGS" />
              <Tab label="SITIOS" />
            </Tabs>
          </Paper>
          <Box sx={{ mt: 3 }}>{renderTabContent()}</Box>
        </Container>
        <Fab color="primary" sx={{ position: 'fixed', bottom: 16, right: 16, background: 'linear-gradient(135deg, #6B2C5A 0%, #8E4B7B 100%)' }} onClick={fetchStats}>
          <AssessmentIcon />
        </Fab>
        <ImageModal />
      </Box>
    </ThemeProvider>
  );
}

export default App;