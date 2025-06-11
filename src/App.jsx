import React, { useState, useEffect } from 'react';
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
  Assessment as AssessmentIcon
} from '@mui/icons-material';

// ✅ TUS COLORES EXACTOS
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
    h4: {
      fontWeight: 600,
      color: '#2C2C2C',
    },
    h5: {
      fontWeight: 500,
      color: '#2C2C2C',
    },
    h6: {
      fontWeight: 500,
      color: '#FFFFFF',
    }
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(135deg, #6B2C5A 0%, #8E4B7B 100%)',
          boxShadow: '0 4px 20px rgba(107, 44, 90, 0.3)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        contained: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 500,
          boxShadow: '0 4px 12px rgba(107, 44, 90, 0.3)',
          '&:hover': {
            boxShadow: '0 6px 16px rgba(107, 44, 90, 0.4)',
          },
        },
        outlined: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 500,
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          backgroundColor: '#F5F5F5',
          fontWeight: 600,
          color: '#2C2C2C',
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        root: {
          backgroundColor: '#FFFFFF',
          borderRadius: '12px 12px 0 0',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        },
        indicator: {
          backgroundColor: '#6B2C5A',
          height: 3,
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          fontSize: '0.95rem',
          color: '#666666',
          '&.Mui-selected': {
            color: '#6B2C5A',
            fontWeight: 600,
          },
        },
      },
    },
  },
});

function App() {
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentTab, setCurrentTab] = useState(1);
  const [escaneos, setEscaneos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({});
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [loadingImages, setLoadingImages] = useState({});

  const API_CONFIG = {
    baseUrl: 'https://logintec-1.onrender.com',
    token: 'token_cliente_001_empresa_prueba_2024'
  };

  const handleLogin = () => {
    if (usuario && password) {
      setIsLoggedIn(true);
      fetchEscaneos();
      fetchStats();
    } else {
      alert('Por favor ingresa usuario y contraseña');
    }
  };

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
    if (newValue === 1) {
      fetchEscaneos();
    }
  };

  const fetchEscaneos = async (includeImages = false) => {
    setLoading(true);
    setError('');
    
    try {
      const url = `${API_CONFIG.baseUrl}/api/escaneos?limit=50&include_images=${includeImages}`;
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${API_CONFIG.token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setEscaneos(data.escaneos || []);
        } else {
          setError('Error en la respuesta del servidor');
        }
      } else {
        setError(`Error del servidor: ${response.status}`);
      }
    } catch (error) {
      setError('No se pudo conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_CONFIG.baseUrl}/api/estadisticas`, {
        headers: {
          'Authorization': `Bearer ${API_CONFIG.token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setStats(data.stats || {});
        }
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchImage = async (scanId, tipo) => {
    setLoadingImages(prev => ({...prev, [`${scanId}_${tipo}`]: true}));
    
    try {
      const response = await fetch(`${API_CONFIG.baseUrl}/api/escaneo/${scanId}/imagen?tipo=${tipo}`, {
        headers: {
          'Authorization': `Bearer ${API_CONFIG.token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setSelectedImage({
            base64: data.imagen_base64,
            filename: data.filename,
            tipo: tipo === '3d' ? 'Imagen 3D' : 'Foto de Cámara',
            scanId: scanId,
            serial: data.serial
          });
          setImageDialogOpen(true);
        }
      } else {
        alert('No se pudo cargar la imagen');
      }
    } catch (error) {
      alert('Error al cargar la imagen');
    } finally {
      setLoadingImages(prev => ({...prev, [`${scanId}_${tipo}`]: false}));
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('es-AR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const ImageModal = () => (
    <Dialog 
      open={imageDialogOpen} 
      onClose={() => setImageDialogOpen(false)}
      maxWidth="lg"
      fullWidth
    >
      <DialogTitle sx={{ 
        background: 'linear-gradient(135deg, #6B2C5A 0%, #8E4B7B 100%)',
        color: 'white',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Typography variant="h6">
          {selectedImage?.tipo} - {selectedImage?.filename}
        </Typography>
        <IconButton 
          onClick={() => setImageDialogOpen(false)}
          sx={{ color: 'white' }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ p: 2 }}>
        {selectedImage && (
          <Box sx={{ textAlign: 'center' }}>
            <img 
              src={`data:image/jpeg;base64,${selectedImage.base64}`}
              alt={selectedImage.filename}
              style={{
                maxWidth: '100%',
                maxHeight: '70vh',
                objectFit: 'contain',
                borderRadius: 8,
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
              }}
            />
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', gap: 2 }}>
              <Chip 
                label={`Serial: ${selectedImage.serial}`} 
                color="primary" 
                variant="outlined" 
              />
              <Chip 
                label={selectedImage.tipo} 
                color="secondary" 
                variant="outlined" 
              />
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
            <TableCell><strong>Ancho (cm)</strong></TableCell>
            <TableCell><strong>Largo (cm)</strong></TableCell>
            <TableCell><strong>Alto (cm)</strong></TableCell>
            <TableCell><strong>Volumen (cm³)</strong></TableCell>
            <TableCell><strong>Peso (kg)</strong></TableCell>
            <TableCell><strong>Imágenes</strong></TableCell>
            <TableCell><strong>Acciones</strong></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {escaneos.map((escaneo, index) => (
            <TableRow key={escaneo.id || index} hover>
              <TableCell>
                <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 500 }}>
                  {escaneo.serial}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2" sx={{ color: '#6B2C5A', fontWeight: 500 }}>
                  {escaneo.usuario_escaner || 'N/A'}
                </Typography>
              </TableCell>
              <TableCell>{formatDate(escaneo.fecha)}</TableCell>
              <TableCell sx={{ textAlign: 'center' }}>
                {escaneo.ancho_cm || 'N/A'}
              </TableCell>
              <TableCell sx={{ textAlign: 'center' }}>
                {escaneo.largo_cm || 'N/A'}
              </TableCell>
              <TableCell sx={{ textAlign: 'center' }}>
                {escaneo.alto_cm || 'N/A'}
              </TableCell>
              <TableCell>
                <Chip 
                  label={escaneo.volumen_cm3 ? `${escaneo.volumen_cm3} cm³` : 'N/A'}
                  size="small"
                  color="secondary"
                  variant="outlined"
                />
              </TableCell>
              <TableCell sx={{ textAlign: 'center', fontWeight: 500 }}>
                {escaneo.peso_kg ? `${escaneo.peso_kg} kg` : 'N/A'}
              </TableCell>
              <TableCell>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  {(escaneo.imagen_3d || escaneo.imagen_3d_filename || escaneo.tiene_imagen_3d) && (
                    <Tooltip title="Ver Imagen 3D">
                      <IconButton
                        size="small"
                        onClick={() => fetchImage(escaneo.id, '3d')}
                        disabled={loadingImages[`${escaneo.id}_3d`]}
                        sx={{ 
                          color: '#6B2C5A',
                          '&:hover': { backgroundColor: 'rgba(107, 44, 90, 0.1)' }
                        }}
                      >
                        {loadingImages[`${escaneo.id}_3d`] ? 
                          <CircularProgress size={16} /> : 
                          <ImageIcon fontSize="small" />
                        }
                      </IconButton>
                    </Tooltip>
                  )}
                  
                  {(escaneo.imagen_camara || escaneo.imagen_camara_filename || escaneo.tiene_imagen_camara) && (
                    <Tooltip title="Ver Foto de Cámara">
                      <IconButton
                        size="small"
                        onClick={() => fetchImage(escaneo.id, 'camara')}
                        disabled={loadingImages[`${escaneo.id}_camara`]}
                        sx={{ 
                          color: '#7CB342',
                          '&:hover': { backgroundColor: 'rgba(124, 179, 66, 0.1)' }
                        }}
                      >
                        {loadingImages[`${escaneo.id}_camara`] ? 
                          <CircularProgress size={16} /> : 
                          <CameraIcon fontSize="small" />
                        }
                      </IconButton>
                    </Tooltip>
                  )}
                  
                  {!escaneo.imagen_3d && !escaneo.imagen_camara && 
                   !escaneo.imagen_3d_filename && !escaneo.imagen_camara_filename &&
                   !escaneo.tiene_imagen_3d && !escaneo.tiene_imagen_camara && (
                    <Chip 
                      label="Sin imágenes" 
                      size="small" 
                      variant="outlined"
                      sx={{ color: '#666666', borderColor: '#DDDDDD' }}
                    />
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

  const maquinasFake = [
    {
      nombre: "LS1000 Scanner",
      descripcion: "Escáner 3D Industrial",
      macAddress: "60:D7:E3:DC:1D:E0", 
      idMaquina: "LS1000_001",
      ipAddress: "192.168.1.100",
      modelo: "LS1000",
      sitio: "Buenos Aires",
      ultimoEscaneo: formatDate(new Date())
    }
  ];

  const usuariosFake = [
    {
      usuario: "CLIENTE_001",
      nombreCompleto: "EMPRESA_PRUEBA",
      email: "contacto@empresa-prueba.com",
      rol: "Cliente",
      ultimoAcceso: formatDate(new Date()),
      estado: "Activo"
    }
  ];

  const renderTabContent = () => {
    switch (currentTab) {
      case 0:
        return (
          <div>
            <Typography variant="h5" gutterBottom>MÁQUINAS</Typography>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Nombre</strong></TableCell>
                    <TableCell><strong>Descripción</strong></TableCell>
                    <TableCell><strong>MAC Address</strong></TableCell>
                    <TableCell><strong>ID Máquina</strong></TableCell>
                    <TableCell><strong>IP Address</strong></TableCell>
                    <TableCell><strong>Modelo</strong></TableCell>
                    <TableCell><strong>Sitio</strong></TableCell>
                    <TableCell><strong>Último Escaneo</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {maquinasFake.map((maquina, index) => (
                    <TableRow key={index}>
                      <TableCell>{maquina.nombre}</TableCell>
                      <TableCell>{maquina.descripcion}</TableCell>
                      <TableCell>{maquina.macAddress}</TableCell>
                      <TableCell>{maquina.idMaquina}</TableCell>
                      <TableCell>{maquina.ipAddress}</TableCell>
                      <TableCell>{maquina.modelo}</TableCell>
                      <TableCell>{maquina.sitio}</TableCell>
                      <TableCell>{maquina.ultimoEscaneo}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </div>
        );

      case 1:
        return (
          <div>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h5">ESCANEOS</Typography>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <Chip 
                  label={`Total: ${stats.total_escaneos || 0}`}
                  color="primary"
                  variant="outlined"
                />
                <Chip 
                  label={`Peso promedio: ${stats.peso_promedio_kg || 0} kg`}
                  color="secondary"
                  variant="outlined"
                />
                <Button
                  variant="contained"
                  startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <RefreshIcon />}
                  onClick={() => fetchEscaneos()}
                  disabled={loading}
                  size="small"
                >
                  Actualizar
                </Button>
              </Box>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : escaneos.length === 0 ? (
              <Paper sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="h6" color="textSecondary">
                  No hay escaneos disponibles
                </Typography>
              </Paper>
            ) : (
              <EscaneosTable />
            )}
          </div>
        );

      case 2:
        return (
          <div>
            <Typography variant="h5" gutterBottom>USUARIOS</Typography>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Usuario</strong></TableCell>
                    <TableCell><strong>Nombre Completo</strong></TableCell>
                    <TableCell><strong>Email</strong></TableCell>
                    <TableCell><strong>Rol</strong></TableCell>
                    <TableCell><strong>Último Acceso</strong></TableCell>
                    <TableCell><strong>Estado</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {usuariosFake.map((user, index) => (
                    <TableRow key={index}>
                      <TableCell>{user.usuario}</TableCell>
                      <TableCell>{user.nombreCompleto}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Chip label={user.rol} color="primary" size="small" />
                      </TableCell>
                      <TableCell>{user.ultimoAcceso}</TableCell>
                      <TableCell>
                        <Chip 
                          label={user.estado} 
                          color={user.estado === 'Activo' ? 'success' : 'error'} 
                          size="small" 
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </div>
        );

      default:
        return (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" color="textSecondary">
              Sección en desarrollo
            </Typography>
            <Typography color="textSecondary">
              Esta funcionalidad estará disponible próximamente
            </Typography>
          </Paper>
        );
    }
  };

  if (isLoggedIn) {
    return (
      <ThemeProvider theme={theme}>
        <Box sx={{ backgroundColor: '#FAFAFA', minHeight: '100vh' }}>
          <AppBar position="static" elevation={0}>
            <Toolbar sx={{ py: 1 }}>
              <img 
                src="/logoblanco.png" 
                alt="Logintec"
                style={{ 
                  height: '120px', 
                  width: 'auto',
                  marginRight: '16px'
                }}
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
              <Typography 
                variant="h6" 
                sx={{ 
                  fontWeight: 700,
                  fontSize: '24px',
                  letterSpacing: '0.5px',
                  flexGrow: 1
                }}
              >
                Sistema de Gestión LS1000
              </Typography>
              <Button 
                color="inherit" 
                onClick={() => setIsLoggedIn(false)}
                sx={{ 
                  borderRadius: 8,
                  px: 3,
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  }
                }}
              >
                Salir
              </Button>
            </Toolbar>
          </AppBar>

          <Container maxWidth="xl" sx={{ py: 4 }}>
            <Paper elevation={0} sx={{ mb: 3 }}>
              <Tabs 
                value={currentTab} 
                onChange={handleTabChange}
                variant="fullWidth"
                sx={{ px: 2 }}
              >
                <Tab label="MÁQUINAS" />
                <Tab label="ESCANEOS" />
                <Tab label="USUARIOS" />
                <Tab label="LOGS" />
                <Tab label="SITIOS" />
              </Tabs>
            </Paper>

            <Box sx={{ mt: 3 }}>
              {renderTabContent()}
            </Box>
          </Container>

          <Fab 
            color="primary" 
            sx={{ 
              position: 'fixed', 
              bottom: 16, 
              right: 16,
              background: 'linear-gradient(135deg, #6B2C5A 0%, #8E4B7B 100%)'
            }}
            onClick={fetchStats}
          >
            <AssessmentIcon />
          </Fab>

          <ImageModal />
        </Box>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #FAFAFA 0%, #F0F0F0 100%)'
      }}>
        <Paper 
          elevation={8}
          sx={{ 
            padding: 5, 
            width: 400,
            borderRadius: 3,
          }}
        >
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <img 
              src="/logocarga.png" 
              alt="Logintec"
              style={{ 
                width: '220px', 
                height: 'auto',
                marginBottom: '16px'
              }}
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
            <Typography 
              variant="h4" 
              sx={{ 
                background: 'linear-gradient(135deg, #6B2C5A 0%, #7CB342 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontWeight: 700,
                mb: 1,
                display: 'none'
              }}
            >
              Logintec
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Sistema de Gestión de Escaneos
            </Typography>
          </Box>
          
          <TextField
            fullWidth
            label="Usuario"
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
            margin="normal"
            variant="outlined"
          />
          
          <TextField
            fullWidth
            label="Contraseña"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            margin="normal"
            variant="outlined"
          />
          
          <Button
            fullWidth
            variant="contained"
            onClick={handleLogin}
            size="large"
            sx={{ mt: 3, py: 1.5 }}
          >
            Ingresar
          </Button>
        </Paper>
      </Box>
    </ThemeProvider>
  );
}

export default App;