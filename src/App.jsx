import { 
  Box, TextField, Button, Paper, Typography, AppBar, Toolbar,
  Tabs, Tab, Container, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, ThemeProvider, createTheme
} from '@mui/material';
import { useState } from 'react';

// Tema personalizado basado en tu logo
const theme = createTheme({
  palette: {
    primary: {
      main: '#6B2C5A', // Morado del logo
      light: '#8E4B7B',
      dark: '#4A1E3F',
    },
    secondary: {
      main: '#7CB342', // Verde del logo
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

  // Datos de prueba para máquinas
  const maquinasFake = [
    {
      nombre: "Cubiscan 325 - Software",
      descripcion: "Máquina de escaneo 3D",
      macAddress: "60:D7:E3:DC:1D:E0",
      idMaquina: "CUB001",
      ipAddress: "192.168.1.100",
      modelo: "Cubiscan 325",
      sitio: "Farmington",
      ultimoEscaneo: "1/24/2025, 16:39:16"
    },
    {
      nombre: "XD Warehouse 59",
      descripcion: "Sistema de almacén",
      macAddress: "A7:B3:6F:91",
      idMaquina: "XD059",
      ipAddress: "192.168.1.101",
      modelo: "Cubiscan 59",
      sitio: "Chicago",
      ultimoEscaneo: "10/14/2024, 14:27:59"
    },
    {
      nombre: "325 Engineering B",
      descripcion: "Máquina de ingeniería",
      macAddress: "60:D7:E3:DC:1F:A3",
      idMaquina: "ENG325B",
      ipAddress: "192.168.1.102",
      modelo: "Cubiscan 325",
      sitio: "Farmington",
      ultimoEscaneo: "2/7/2025, 08:52:06"
    }
  ];

  // Datos de prueba para medidas
  const medidasFake = [
    {
      numeroSerie: "PKG001234",
      ancho: 25.4,
      alto: 15.2,
      largo: 35.8,
      peso: 2.1,
      volumen: 13847,
      fecha: "2025-01-24 16:39:16",
      maquina: "Cubiscan 325 - Software",
      sitio: "Farmington",
      usuario: "admin"
    },
    {
      numeroSerie: "BOX987654",
      ancho: 40.0,
      alto: 30.5,
      largo: 50.2,
      peso: 5.8,
      volumen: 61244,
      fecha: "2025-01-24 14:22:11",
      maquina: "XD Warehouse 59",
      sitio: "Chicago",
      usuario: "operator1"
    },
    {
      numeroSerie: "CNT555888",
      ancho: 12.7,
      alto: 8.9,
      largo: 22.3,
      peso: 0.8,
      volumen: 2523,
      fecha: "2025-01-23 09:15:33",
      maquina: "325 Engineering B",
      sitio: "Farmington",
      usuario: "tech_user"
    },
    {
      numeroSerie: "PAL123789",
      ancho: 120.0,
      alto: 80.0,
      largo: 100.0,
      peso: 25.5,
      volumen: 960000,
      fecha: "2025-01-22 11:45:27",
      maquina: "Cubiscan 325 - Software",
      sitio: "Farmington",
      usuario: "admin"
    }
  ];

  // Datos de prueba para usuarios
  const usuariosFake = [
    {
      usuario: "admin",
      nombreCompleto: "Administrador Sistema",
      email: "admin@logintec.com",
      rol: "Admin",
      ultimoAcceso: "2025-01-24 16:45:22",
      estado: "Activo"
    },
    {
      usuario: "operator1",
      nombreCompleto: "Juan Pérez",
      email: "juan.perez@logintec.com",
      rol: "Operador",
      ultimoAcceso: "2025-01-24 14:30:15",
      estado: "Activo"
    },
    {
      usuario: "supervisor_tom",
      nombreCompleto: "Tomás Rodriguez",
      email: "tomas.rodriguez@logintec.com",
      rol: "Supervisor",
      ultimoAcceso: "2025-01-23 18:22:41",
      estado: "Activo"
    },
    {
      usuario: "tech_user",
      nombreCompleto: "María González",
      email: "maria.gonzalez@logintec.com",
      rol: "Técnico",
      ultimoAcceso: "2025-01-22 09:15:33",
      estado: "Inactivo"
    }
  ];

  // Datos de prueba para logs
  const logsFake = [
    {
      fechaHora: "2025-01-24 16:39:16",
      usuario: "admin",
      accion: "Escaneo realizado",
      maquina: "Cubiscan 325 - Software",
      detalles: "Paquete PKG001234 escaneado exitosamente",
      tipo: "Info"
    },
    {
      fechaHora: "2025-01-24 16:35:22",
      usuario: "operator1",
      accion: "Login exitoso",
      maquina: "Sistema",
      detalles: "Usuario operator1 ingresó al sistema",
      tipo: "Info"
    },
    {
      fechaHora: "2025-01-24 15:22:11",
      usuario: "tech_user",
      accion: "Error de conexión",
      maquina: "XD Warehouse 59",
      detalles: "Timeout al conectar con la máquina",
      tipo: "Error"
    },
    {
      fechaHora: "2025-01-24 14:45:33",
      usuario: "admin",
      accion: "Mantenimiento",
      maquina: "325 Engineering B",
      detalles: "Calibración de sensores completada",
      tipo: "Warning"
    }
  ];

  // Datos de prueba para sitios
  const sitiosFake = [
    {
      nombre: "Farmington",
      localidad: "Farmington, NM",
      direccion: "1234 Industrial Blvd, Farmington, NM 87401",
      ip: "192.168.1.1",
      macAddress: "00:1B:44:11:3A:B7",
      cantidadMaquinas: 3,
      estado: "Activo"
    },
    {
      nombre: "Chicago",
      localidad: "Chicago, IL",
      direccion: "5678 Warehouse Ave, Chicago, IL 60601",
      ip: "192.168.2.1",
      macAddress: "00:1B:44:22:5C:D9",
      cantidadMaquinas: 2,
      estado: "Activo"
    },
    {
      nombre: "Denver",
      localidad: "Denver, CO",
      direccion: "9876 Logistics St, Denver, CO 80202",
      ip: "192.168.3.1",
      macAddress: "00:1B:44:33:7E:F1",
      cantidadMaquinas: 1,
      estado: "Mantenimiento"
    }
  ];

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

  const renderTabContent = () => {
    switch (currentTab) {
      case 0:
        return (
          <div>
            <Typography variant="h5" gutterBottom>MÁQUINAS</Typography>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
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
            <Typography variant="h5" gutterBottom>MEDIDAS</Typography>
            
            <Box sx={{ mb: 3 }}>
              <TextField
                label="Buscar por número de serie"
                variant="outlined"
                size="small"
                sx={{ mb: 2 }}
              />
              <Button variant="contained" sx={{ ml: 2, height: 40 }}>
                Buscar
              </Button>
            </Box>

            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableCell><strong>Número de Serie</strong></TableCell>
                    <TableCell><strong>Ancho (cm)</strong></TableCell>
                    <TableCell><strong>Alto (cm)</strong></TableCell>
                    <TableCell><strong>Largo (cm)</strong></TableCell>
                    <TableCell><strong>Peso (kg)</strong></TableCell>
                    <TableCell><strong>Volumen (cm³)</strong></TableCell>
                    <TableCell><strong>Fecha</strong></TableCell>
                    <TableCell><strong>Máquina</strong></TableCell>
                    <TableCell><strong>Sitio</strong></TableCell>
                    <TableCell><strong>Usuario</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {medidasFake.map((medida, index) => (
                    <TableRow key={index}>
                      <TableCell>{medida.numeroSerie}</TableCell>
                      <TableCell>{medida.ancho}</TableCell>
                      <TableCell>{medida.alto}</TableCell>
                      <TableCell>{medida.largo}</TableCell>
                      <TableCell>{medida.peso}</TableCell>
                      <TableCell>{medida.volumen}</TableCell>
                      <TableCell>{medida.fecha}</TableCell>
                      <TableCell>{medida.maquina}</TableCell>
                      <TableCell>{medida.sitio}</TableCell>
                      <TableCell>{medida.usuario}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </div>
        );
      case 2:
        return (
          <div>
            <Typography variant="h5" gutterBottom>USUARIOS</Typography>
            
            <Box sx={{ mb: 3 }}>
              <Button variant="contained" color="primary">
                + Crear Usuario
              </Button>
            </Box>

            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableCell><strong>Usuario</strong></TableCell>
                    <TableCell><strong>Nombre Completo</strong></TableCell>
                    <TableCell><strong>Email</strong></TableCell>
                    <TableCell><strong>Rol</strong></TableCell>
                    <TableCell><strong>Último Acceso</strong></TableCell>
                    <TableCell><strong>Estado</strong></TableCell>
                    <TableCell><strong>Acciones</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {usuariosFake.map((user, index) => (
                    <TableRow key={index}>
                      <TableCell>{user.usuario}</TableCell>
                      <TableCell>{user.nombreCompleto}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Button 
                          variant="outlined" 
                          size="small"
                          color={user.rol === 'Admin' ? 'error' : user.rol === 'Supervisor' ? 'warning' : 'primary'}
                        >
                          {user.rol}
                        </Button>
                      </TableCell>
                      <TableCell>{user.ultimoAcceso}</TableCell>
                      <TableCell>
                        <Button 
                          variant="outlined" 
                          size="small"
                          color={user.estado === 'Activo' ? 'success' : 'error'}
                        >
                          {user.estado}
                        </Button>
                      </TableCell>
                      <TableCell>
                        <Button variant="text" size="small">Editar</Button>
                        <Button variant="text" size="small" color="error">Eliminar</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </div>
        );
      case 3:
        return (
          <div>
            <Typography variant="h5" gutterBottom>LOGS</Typography>
            
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableCell><strong>Fecha/Hora</strong></TableCell>
                    <TableCell><strong>Usuario</strong></TableCell>
                    <TableCell><strong>Acción</strong></TableCell>
                    <TableCell><strong>Máquina</strong></TableCell>
                    <TableCell><strong>Detalles</strong></TableCell>
                    <TableCell><strong>Tipo</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {logsFake.map((log, index) => (
                    <TableRow key={index}>
                      <TableCell>{log.fechaHora}</TableCell>
                      <TableCell>{log.usuario}</TableCell>
                      <TableCell>{log.accion}</TableCell>
                      <TableCell>{log.maquina}</TableCell>
                      <TableCell>{log.detalles}</TableCell>
                      <TableCell>
                        <Button 
                          variant="outlined" 
                          size="small"
                          color={log.tipo === 'Error' ? 'error' : log.tipo === 'Warning' ? 'warning' : 'success'}
                        >
                          {log.tipo}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </div>
        );
      case 4:
        return (
          <div>
            <Typography variant="h5" gutterBottom>SITIOS</Typography>
            
            <Box sx={{ mb: 3 }}>
              <Button variant="contained" color="primary">
                + Crear Sitio
              </Button>
            </Box>

            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableCell><strong>Nombre Sitio</strong></TableCell>
                    <TableCell><strong>Localidad</strong></TableCell>
                    <TableCell><strong>Dirección</strong></TableCell>
                    <TableCell><strong>IP</strong></TableCell>
                    <TableCell><strong>MAC Address</strong></TableCell>
                    <TableCell><strong>Máquinas</strong></TableCell>
                    <TableCell><strong>Estado</strong></TableCell>
                    <TableCell><strong>Acciones</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sitiosFake.map((sitio, index) => (
                    <TableRow key={index}>
                      <TableCell>{sitio.nombre}</TableCell>
                      <TableCell>{sitio.localidad}</TableCell>
                      <TableCell>{sitio.direccion}</TableCell>
                      <TableCell>{sitio.ip}</TableCell>
                      <TableCell>{sitio.macAddress}</TableCell>
                      <TableCell>{sitio.cantidadMaquinas}</TableCell>
                      <TableCell>
                        <Button 
                          variant="outlined" 
                          size="small"
                          color={sitio.estado === 'Activo' ? 'success' : 'error'}
                        >
                          {sitio.estado}
                        </Button>
                      </TableCell>
                      <TableCell>
                        <Button variant="text" size="small">Ver</Button>
                        <Button variant="text" size="small">Editar</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </div>
        );
      default:
        return null;
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
                  // Si no se encuentra la imagen, mostrar texto como fallback
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
                  display: 'none' // Oculto por defecto, se muestra si falla la imagen
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
                <Tab label="MEDIDAS" />
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
                // Si no se encuentra la imagen, mostrar texto como fallback
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
                display: 'none' // Oculto por defecto, se muestra si falla la imagen
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