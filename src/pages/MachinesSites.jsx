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
      <Container
        maxWidth="xl"
        sx={{
          py: { xs: 3, md: 4 },
          px: { xs: 1.5, sm: 2, md: 0 }
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress sx={{ color: '#5b3ea3' }} size={48} />
        </Box>
      </Container>
    );
  }

  if (machines.length === 0 && sites.length === 0) {
    return (
      <Container
        maxWidth="xl"
        sx={{
          py: { xs: 3, md: 4 },
          px: { xs: 1.5, sm: 2, md: 0 }
        }}
      >
        <Alert severity="error">
          No se encontraron máquinas ni sitios registrados.
        </Alert>
      </Container>
    );
  }

  return (
    <Container
      maxWidth="xl"
      sx={{
        py: { xs: 3, md: 4 },
        px: { xs: 1.5, sm: 2, md: 0 }
      }}
    >
      <Box sx={{ maxWidth: 480, mx: 'auto' }}>
        {/* Header */}
        <Box sx={{ mb: { xs: 2.5, md: 4 } }}>
          <Typography
            variant="h4"
            sx={{
              mb: 1,
              color: '#2C2C2C',
              fontWeight: 600,
              fontSize: { xs: '1.4rem', sm: '1.6rem', md: '2rem' }
            }}
          >
            Información de Máquinas y Sitios
          </Typography>
        </Box>
        <Grid container spacing={{ xs: 2, md: 4 }}>
          {/* Sitios */}
          {sites.map((site, idx) => (
            <Grid item xs={12} md={6} key={site.nombre + idx}>
            <Card sx={{ 
              borderRadius: 3, 
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
              borderLeft: '4px solid #07c7c3'
            }}>
              <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    mb: { xs: 2, sm: 3 }
                  }}
                >
                  <Box sx={{ 
                    p: 1.5, 
                    borderRadius: 2, 
                    backgroundColor: '#07c7c3', 
                    color: 'white',
                    mr: 2
                  }}>
                    {getSiteIcon(site.tipo)}
                  </Box>
                  <Box>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 600,
                        color: '#2C2C2C',
                        fontSize: { xs: '1rem', sm: '1.1rem' }
                      }}
                    >
                      {site.nombre}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: '#666666',
                        fontSize: { xs: '0.8rem', sm: '0.9rem' }
                      }}
                    >
                      Sitio de Trabajo
                    </Typography>
                  </Box>
                  {/* Sin indicador de estado */}
                </Box>
                <Divider sx={{ my: 2 }} />
                <List dense>
                  <ListItem>
                    <ListItemIcon>
                      <SettingsIcon sx={{ color: '#07c7c3' }} />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Tipo de Sitio"
                      secondary={site.tipo || 'PC'}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <LocationIcon sx={{ color: '#07c7c3' }} />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Ubicación"
                      secondary={site.ubicacion}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <DeviceHubIcon sx={{ color: '#07c7c3' }} />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Último Escaneo"
                      secondary={MachinesSitesService.formatDate(site.ultima_conexion)}
                    />
                  </ListItem>
                  {site.total_escaneos !== undefined && (
                    <ListItem>
                      <ListItemText 
                        primary="Total de Escaneos"
                        secondary={
                          <Chip 
                            label={site.total_escaneos}
                            size="small"
                            sx={{ 
                              backgroundColor: '#07c7c3',
                              color: 'white',
                              fontWeight: 600
                            }}
                          />
                        }
                      />
                    </ListItem>
                  )}
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
              borderLeft: '4px solid #5b3ea3'
            }}>
              <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    mb: { xs: 2, sm: 3 }
                  }}
                >
                  <Box sx={{ 
                    p: 1.5, 
                    borderRadius: 2, 
                    backgroundColor: '#5b3ea3', 
                    color: 'white',
                    mr: 2
                  }}>
                    <MemoryIcon />
                  </Box>
                  <Box>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 600,
                        color: '#2C2C2C',
                        fontSize: { xs: '1rem', sm: '1.1rem' }
                      }}
                    >
                      {machine.nombre}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: '#666666',
                        fontSize: { xs: '0.8rem', sm: '0.9rem' }
                      }}
                    >
                      Máquina de Escaneo
                    </Typography>
                  </Box>
                </Box>
                <Divider sx={{ my: 2 }} />
                <List dense>
                  <ListItem>
                    <ListItemText 
                      primary="Modelo"
                      secondary={machine.modelo}
                    />
                  </ListItem>
                  {machine.fabricante && machine.fabricante !== 'N/A' && (
                    <ListItem>
                      <ListItemText 
                        primary="Fabricante"
                        secondary={machine.fabricante}
                      />
                    </ListItem>
                  )}
                  {machine.ip && machine.ip !== 'N/A' && (
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
                  )}
                  {machine.mac && machine.mac !== 'N/A' && (
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
                  )}
                  {machine.firmware && machine.firmware !== 'N/A' && (
                    <ListItem>
                      <ListItemText 
                        primary="Firmware"
                        secondary={machine.firmware}
                      />
                    </ListItem>
                  )}
                  {machine.ultima_medicion && machine.ultima_medicion !== 'N/A' && (
                    <ListItem>
                      <ListItemText 
                        primary="Última Medición"
                        secondary={MachinesSitesService.formatDate(machine.ultima_medicion)}
                      />
                    </ListItem>
                  )}
                </List>
              </CardContent>
            </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Container>
  );
};

export default MachinesSites;