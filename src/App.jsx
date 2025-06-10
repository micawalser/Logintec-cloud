import { 
  Box, TextField, Button, Paper, Typography, AppBar, Toolbar,
  Tabs, Tab, Container, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, ThemeProvider, createTheme, CircularProgress,
  Alert, AlertTitle, Chip, Card, CardContent, Grid
} from '@mui/material';
import { useState, useEffect } from 'react';
import ApiService from './apiService'; // ✅ IMPORTAR EL SERVICIO

// Tema personalizado (mantenemos el mismo)
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
          backgroundColor: '#7CB342',
          height: 3,
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          fontSize: '16px',
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
  const [currentTab, setCurrentTab] = useState(0);
  
  // ✅ NUEVOS ESTADOS PARA DATOS REALES
  const [escaneos, setEscaneos] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('checking');
  const [searchTerm, setSearchTerm] = useState('');

  // ✅ VERIFICAR CONEXIÓN AL CARGAR
  useEffect(() => {
    checkConnection();
  }, []);

  // ✅ CARGAR DATOS CUANDO SE LOGUEA
  useEffect(() => {
    if (isLoggedIn) {
      loadAllData();
    }
  }, [isLoggedIn]);

  const checkConnection = async () => {
    try {
      setConnectionStatus('checking');
      const health = await ApiService.getHealth();
      console.log('✅ Conexión con backend:', health);
      setConnectionStatus('connected');
    } catch (error) {
      console.error('❌ Error de conexión:', error);
      setConnectionStatus('error');
    }
  };

  const loadAllData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Cargar escaneos y estadísticas en paralelo
      const [escaneosData, statsData] = await Promise.all([
        ApiService.getEscaneos(100, 0, false),
        ApiService.getStats()
      ]);
      
      setEscaneos(escaneosData.escaneos || []);
      setStats(statsData.stats || null);
      
      console.log('✅ Datos cargados:', {
        escaneos: escaneosData.escaneos?.length || 0,
        stats: statsData.stats
      });
      
    } catch (error) {
      console.error('❌ Error cargando datos:', error);
      setError('Error conectando con el servidor. Verifica tu conexión.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = () => {
    if (usuario && password) {
      setIsLoggedIn(true);
    } else {
      alert('Por favor ingresa usuario y contraseña');
    }
  };

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  const handleSearch = () => {
    if (searchTerm) {
      const filtered = escaneos.filter(escaneo => 
        escaneo.serial.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setEscaneos(filtered);
    } else {
      loadAllData(); // Recargar todos si no hay término de búsqueda
    }
  };

  const renderConnectionStatus = () => {
    switch (connectionStatus) {
      case 'checking':
        return (
          <Chip 
            label="Verificando conexión..." 
            color="warning" 
            size="small"
            icon={<CircularProgress size={16} />}
          />
        );
      case 'connected':
        return (
          <Chip 
            label="Conectado a Render" 
            color="success" 
            size="small"
          />
        );
      case 'error':
        return (
          <Chip 
            label="Error de conexión" 
            color="error" 
            size="small"
          />
        );
      default:
        return null;
    }
  };

  const renderStatsCards = () => {
    if (!stats) return null;

    return (
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Escaneos
              </Typography>
              <Typography variant="h4" component="div">
                {stats.total_escaneos}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Escaneos Hoy
              </Typography>
              <Typography variant="h4" component="div">
                {stats.escaneos_hoy}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Volumen Promedio
              </Typography>
              <Typography variant="h4" component="div">
                {stats.volumen_promedio_cm3} cm³
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Con Imágenes
              </Typography>
              <Typography variant="h4" component="div">
                {stats.escaneos_con_imagen_3d || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  };

  // Datos fake para otras pestañas (mantenemos los existentes)
  const maquinasFake = [
    {
      nombre: "LS1000 Scanner",
      descripcion: "Escáner 3D Industrial",
      macAddress: "60:D7:E3:DC:1D:E0", 
      idMaquina: "LS1000_001",
      ipAddress: "192.168.1.100",
      modelo: "LS1000",
      sitio: "Buenos Aires",
      ultimoEscaneo: ApiService.formatDate(new Date())
    }
  ];

  const usuariosFake = [
    {
      usuario: "CLIENTE_001",
      nombreCompleto: "EMPRESA_PRUEBA",
      email: "contacto@empresa-prueba.com",
      rol: "Cliente",
      ultimoAcceso: ApiService.formatDate(new Date()),
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
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h5">ESCANEOS REALES</Typography>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                {renderConnectionStatus()}
                <Button 
                  variant="outlined" 
                  onClick={loadAllData}
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={20} /> : 'Actualizar'}
                </Button>
              </Box>
            </Box>

            {/* ✅ ESTADÍSTICAS */}
            {renderStatsCards()}

            {/* ✅ ERROR */}
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                <AlertTitle>Error de Conexión</AlertTitle>
                {error}
              </Alert>
            )}

            {/* ✅ BÚSQUEDA */}
            <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
              <TextField
                label="Buscar por número de serie"
                variant="outlined"
                size="small"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                sx={{ flexGrow: 1 }}
              />
              <Button 
                variant="contained" 
                onClick={handleSearch}
                disabled={loading}
              >
                Buscar
              </Button>
            </Box>

            {/* ✅ TABLA DE ESCANEOS REALES */}
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>ID</strong></TableCell>
                    <TableCell><strong>Número de Serie</strong></TableCell>
                    <TableCell><strong>Alto (cm)</strong></TableCell>
                    <TableCell><strong>Ancho (cm)</strong></TableCell>
                    <TableCell><strong>Largo (cm)</strong></TableCell>
                    <TableCell><strong>Volumen (cm³)</strong></TableCell>
                    <TableCell><strong>Fecha</strong></TableCell>
                    <TableCell><strong>Cliente</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={8} align="center">
                        <CircularProgress />
                        <Typography sx={{ mt: 1 }}>Cargando escaneos...</Typography>
                      </TableCell>
                    </TableRow>
                  ) : escaneos.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} align="center">
                        <Typography color="textSecondary">
                          No hay escaneos disponibles
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    escaneos.map((escaneo, index) => (
                      <TableRow key={escaneo.id || index}>
                        <TableCell>{escaneo.id}</TableCell>
                        <TableCell>
                          <strong>{escaneo.serial}</strong>
                        </TableCell>
                        <TableCell>{ApiService.convertToCm(escaneo.altura)}</TableCell>
                        <TableCell>{ApiService.convertToCm(escaneo.ancho)}</TableCell>
                        <TableCell>{ApiService.convertToCm(escaneo.alto)}</TableCell>
                        <TableCell>
                          {ApiService.calculateVolume(escaneo.altura, escaneo.ancho, escaneo.alto)}
                        </TableCell>
                        <TableCell>{ApiService.formatDate(escaneo.fecha)}</TableCell>
                        <TableCell>
                          <Chip label="EMPRESA_PRUEBA" color="primary" size="small" />
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {/* ✅ INFORMACIÓN ADICIONAL */}
            {escaneos.length > 0 && (
              <Box sx={{ mt: 2, textAlign: 'center' }}>
                <Typography variant="body2" color="textSecondary">
                  Mostrando {escaneos.length} escaneos • Datos en tiempo real desde Render
                </Typography>
              </Box>
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
                  e.target.nextSibling.style.display = 'block';
                }}
              />
              <Typography 
                variant="h6" 
                sx={{ 
                  fontWeight: 700,
                  fontSize: '24px',
                  letterSpacing: '0.5px',
                  display: 'none'
                }}
              >
                Logintec
              </Typography>
              <Box sx={{ flexGrow: 1 }} />
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
                e.target.nextSibling.style.display = 'block';
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