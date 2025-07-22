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

import MachinesSitesService from '../services/machinesSitesService';

const MachinesSites = () => {
  const [loading, setLoading] = useState(true);
  const [machines, setMachines] = useState([]);
  const [sites, setSites] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [machinesArr, sitesArr] = await Promise.all([
        MachinesSitesService.getAllMachines(),
        MachinesSitesService.getAllSites()
      ]);
      setMachines(machinesArr);
      setSites(sitesArr);
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

  if (machines.length === 0 && sites.length === 0) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Alert severity="error">
          No se encontraron máquinas ni sitios registrados.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ mb: 1, color: '#2C2C2C', fontWeight: 600 }}>
          Información de Máquinas y Sitios
        </Typography>
      </Box>
      <Grid container spacing={4}>
        {/* Sitios */}
        {sites.map((site, idx) => (
          <Grid item xs={12} md={6} key={site.nombre + idx}>
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
                      label={site.estado?.toUpperCase()}
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
        ))}
        {/* Máquinas */}
        {machines.map((machine, idx) => (
          <Grid item xs={12} md={6} key={machine.id + idx}>
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
                      {machine.modelo}
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
                          {machine.id}
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
                          {machine.ip}
                        </Typography>
                      }
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="MAC Address"
                      secondary={
                        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                          {machine.mac}
                        </Typography>
                      }
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Firmware"
                      secondary={machine.firmware}
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
        ))}
      </Grid>
    </Container>
  );
};

export default MachinesSites;