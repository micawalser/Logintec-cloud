// src/pages/MachinesSites.jsx
import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Container, Grid, CircularProgress,
  Card, CardContent, Divider, Chip, List, ListItem, ListItemIcon,
  ListItemText, Alert
} from '@mui/material';
import {
  Computer as ComputerIcon,
  LocationOn as LocationIcon,
  Memory as MemoryIcon,
  LaptopMac as LaptopIcon,
  Smartphone as SmartphoneIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Router as RouterIcon,
  Settings as SettingsIcon,
  DeviceHub as DeviceHubIcon
} from '@mui/icons-material';

import MachinesSitesService from '../Services/machinesSitesService';

const MachinesSites = () => {
  const [loading, setLoading] = useState(true);
  const [siteInfo, setSiteInfo] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const info = await MachinesSitesService.getSiteInfo(); // ✅ Ahora es async
      setSiteInfo(info);
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSiteIcon = (tipo) => {
    switch (tipo) {
      case 'PC': 
        return <ComputerIcon />;
      case 'Notebook': 
        return <LaptopIcon />;
      case 'Móvil': 
        return <SmartphoneIcon />;
      default: 
        return <ComputerIcon />;
    }
  };

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress sx={{ color: '#6B2C5A' }} size={60} />
        </Box>
      </Container>
    );
  }

  if (!siteInfo?.machine || !siteInfo?.site) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Alert severity="error">
          No se pudo cargar la información de la máquina y sitio.
        </Alert>
      </Container>
    );
  }

  const { machine, site, client, isConnected } = siteInfo;

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ mb: 1, color: '#2C2C2C', fontWeight: 600 }}>
          Información de Máquina y Sitio
        </Typography>
        <Typography variant="body1" sx={{ color: '#666666' }}>
          {client.nombre} - {client.descripcion}
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {/* Información del Sitio */}
        <Grid item xs={12} md={6}>
          <Card sx={{ 
            borderRadius: 3, 
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            borderLeft: '4px solid #7CB342'
          }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Box sx={{ 
                  p: 1.5, 
                  borderRadius: 2, 
                  backgroundColor: '#7CB342', 
                  color: 'white',
                  mr: 2
                }}>
                  {getSiteIcon(site.tipo)}
                </Box>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: '#2C2C2C' }}>
                    {site.nombre}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#666666' }}>
                    Sitio de Trabajo
                  </Typography>
                </Box>
                <Box sx={{ ml: 'auto' }}>
                  <Chip 
                    label={site.estado.toUpperCase()}
                    color={site.estado === 'activo' ? 'success' : 'error'}
                    size="small"
                    sx={{ fontWeight: 500 }}
                  />
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <SettingsIcon sx={{ color: '#6B2C5A' }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Tipo de Sitio"
                    secondary={site.tipo}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <LocationIcon sx={{ color: '#6B2C5A' }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Ubicación"
                    secondary={site.ubicacion}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <DeviceHubIcon sx={{ color: '#6B2C5A' }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Última Conexión"
                    secondary={MachinesSitesService.formatDate(site.ultima_conexion)}
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Información de la Máquina */}
        <Grid item xs={12} md={6}>
          <Card sx={{ 
            borderRadius: 3, 
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            borderLeft: '4px solid #6B2C5A'
          }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Box sx={{ 
                  p: 1.5, 
                  borderRadius: 2, 
                  backgroundColor: '#6B2C5A', 
                  color: 'white',
                  mr: 2
                }}>
                  <MemoryIcon />
                </Box>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: '#2C2C2C' }}>
                    {machine.nombre}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#666666' }}>
                    Máquina de Escaneo
                  </Typography>
                </Box>
                <Box sx={{ ml: 'auto' }}>
                  <Chip 
                    icon={machine.enabled ? <CheckCircleIcon /> : <CancelIcon />}
                    label={machine.enabled ? 'HABILITADA' : 'DESHABILITADA'}
                    color={machine.enabled ? 'success' : 'error'}
                    size="small"
                    sx={{ fontWeight: 500 }}
                  />
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              <List dense>
                <ListItem>
                  <ListItemText 
                    primary="Serial Number"
                    secondary={
                      <Typography 
                        variant="body2" 
                        sx={{ fontFamily: 'monospace', backgroundColor: '#F5F5F5', p: 0.5, borderRadius: 1 }}
                      >
                        {machine.serial_number}
                      </Typography>
                    }
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Modelo"
                    secondary={machine.modelo}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Dirección IP"
                    secondary={
                      <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                        {machine.ip_address}
                      </Typography>
                    }
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="MAC Address"
                    secondary={
                      <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                        {machine.mac_address}
                      </Typography>
                    }
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Firmware"
                    secondary={machine.firmware_version}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Última Medición"
                    secondary={MachinesSitesService.formatDate(machine.ultima_medicion)}
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Estado de Conexión */}
        <Grid item xs={12}>
          <Card sx={{ 
            borderRadius: 3, 
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            borderLeft: `4px solid ${isConnected ? '#7CB342' : '#f44336'}`
          }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Box sx={{ 
                  p: 2, 
                  borderRadius: 2, 
                  backgroundColor: isConnected ? '#7CB342' : '#f44336', 
                  color: 'white',
                  mr: 3
                }}>
                  <RouterIcon sx={{ fontSize: 40 }} />
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: '#2C2C2C', mb: 1 }}>
                    Estado de la Conexión
                  </Typography>
                  <Chip 
                    label={isConnected ? 'SITIO Y MÁQUINA OPERATIVOS' : 'PROBLEMAS DE CONEXIÓN'}
                    color={isConnected ? 'success' : 'error'}
                    size="large"
                    sx={{ fontWeight: 600, fontSize: '0.9rem', px: 2 }}
                  />
                  <Typography variant="body2" sx={{ color: '#666666', mt: 2 }}>
                    {isConnected 
                      ? 'El sitio está activo y la máquina está habilitada'
                      : 'Revisa el estado del sitio y la máquina'
                    }
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default MachinesSites;