// src/pages/MachinesSites.jsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Container,
  Grid,
  CircularProgress,
  Card,
  CardContent,
  Divider,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Alert,
} from '@mui/material';
import {
  Computer as ComputerIcon,
  LocationOn as LocationIcon,
  Memory as MemoryIcon,
  LaptopMac as LaptopIcon,
  Smartphone as SmartphoneIcon,
  Settings as SettingsIcon,
  DeviceHub as DeviceHubIcon,
} from '@mui/icons-material';

import MachinesSitesService from '../services/machinesSitesService';

const cardBase = {
  borderRadius: 3,
  color: 'var(--card-foreground)',
  border: '1px solid var(--ms-card-border)',
  boxShadow: 'var(--ms-card-shadow)',
};

const listPrimarySx = { color: 'var(--muted-foreground)', fontSize: '0.8rem' };
const listSecondarySx = { color: 'var(--card-foreground)' };

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
        MachinesSitesService.getAllSites(),
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
      <Container maxWidth="xl" sx={{ py: { xs: 3, md: 4 }, px: { xs: 1.5, sm: 2, md: 3 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress sx={{ color: 'var(--primary)' }} size={48} />
        </Box>
      </Container>
    );
  }

  if (machines.length === 0 && sites.length === 0) {
    return (
      <Container maxWidth="xl" sx={{ py: { xs: 3, md: 4 }, px: { xs: 1.5, sm: 2, md: 3 } }}>
        <Alert severity="error" sx={{ bgcolor: 'var(--card)', color: 'var(--card-foreground)', border: '1px solid var(--border)' }}>
          No se encontraron máquinas ni sitios registrados.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 2, md: 3 }, px: { xs: 1.5, sm: 2, md: 3 } }}>
      <Typography
        variant="h4"
        component="h1"
        sx={{
          mb: 3,
          color: 'var(--foreground)',
          fontWeight: 600,
          fontSize: { xs: '1.35rem', sm: '1.5rem', md: '1.75rem' },
        }}
      >
        Información de Máquinas y Sitios
      </Typography>

      {/* Dos columnas: sitios | máquinas (en móvil se apilan) */}
      <Grid container spacing={3} alignItems="flex-start">
        <Grid size={{ xs: 12, md: 6 }}>
          <Typography
            variant="subtitle1"
            sx={{ mb: 2, color: 'var(--muted-foreground)', fontWeight: 600, letterSpacing: 0.02 }}
          >
            Sitios
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            {sites.map((site, idx) => (
              <Card
                key={site.nombre + idx}
                sx={{
                  ...cardBase,
                  borderLeft: '4px solid #07c7c3',
                  bgcolor: 'var(--ms-site-card)',
                  boxShadow: 'var(--ms-card-shadow), 0 0 24px rgba(7, 199, 195, 0.08)',
                }}
              >
                <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        backgroundColor: '#07c7c3',
                        color: 'white',
                        mr: 2,
                      }}
                    >
                      {getSiteIcon(site.tipo)}
                    </Box>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 600, color: 'var(--card-foreground)', fontSize: '1.05rem' }}>
                        {site.nombre}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'var(--muted-foreground)', fontSize: '0.85rem' }}>
                        Sitio de trabajo
                      </Typography>
                    </Box>
                  </Box>
                  <Divider sx={{ my: 1.5, borderColor: 'var(--border)' }} />
                  <List dense>
                    <ListItem disableGutters>
                      <ListItemIcon sx={{ minWidth: 40 }}>
                        <SettingsIcon sx={{ color: '#07c7c3' }} />
                      </ListItemIcon>
                      <ListItemText
                        primary="Tipo de sitio"
                        secondary={site.tipo || 'PC'}
                        primaryTypographyProps={{ sx: listPrimarySx }}
                        secondaryTypographyProps={{ component: 'div', sx: listSecondarySx }}
                      />
                    </ListItem>
                    <ListItem disableGutters>
                      <ListItemIcon sx={{ minWidth: 40 }}>
                        <LocationIcon sx={{ color: '#07c7c3' }} />
                      </ListItemIcon>
                      <ListItemText
                        primary="Ubicación"
                        secondary={site.ubicacion}
                        primaryTypographyProps={{ sx: listPrimarySx }}
                        secondaryTypographyProps={{ component: 'div', sx: listSecondarySx }}
                      />
                    </ListItem>
                    <ListItem disableGutters>
                      <ListItemIcon sx={{ minWidth: 40 }}>
                        <DeviceHubIcon sx={{ color: '#07c7c3' }} />
                      </ListItemIcon>
                      <ListItemText
                        primary="Último escaneo"
                        secondary={MachinesSitesService.formatDate(site.ultima_conexion)}
                        primaryTypographyProps={{ sx: listPrimarySx }}
                        secondaryTypographyProps={{ component: 'div', sx: listSecondarySx }}
                      />
                    </ListItem>
                    {site.total_escaneos !== undefined && (
                      <ListItem disableGutters>
                        <ListItemText
                          primary="Total de escaneos"
                          secondary={
                            <Chip
                              label={site.total_escaneos}
                              size="small"
                              sx={{
                                mt: 0.5,
                                backgroundColor: '#07c7c3',
                                color: 'white',
                                fontWeight: 600,
                              }}
                            />
                          }
                          primaryTypographyProps={{ sx: listPrimarySx }}
                          secondaryTypographyProps={{ component: 'div' }}
                        />
                      </ListItem>
                    )}
                  </List>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Typography
            variant="subtitle1"
            sx={{ mb: 2, color: 'var(--muted-foreground)', fontWeight: 600, letterSpacing: 0.02 }}
          >
            Máquinas
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            {machines.map((machine, idx) => (
              <Card
                key={machine.id + idx}
                sx={{
                  ...cardBase,
                  borderLeft: '4px solid var(--primary)',
                  bgcolor: 'var(--ms-machine-card)',
                  boxShadow: 'var(--ms-card-shadow), 0 0 28px rgba(91, 62, 163, 0.12)',
                }}
              >
                <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        backgroundColor: 'var(--primary)',
                        color: 'var(--primary-foreground)',
                        mr: 2,
                      }}
                    >
                      <MemoryIcon />
                    </Box>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 600, color: 'var(--card-foreground)', fontSize: '1.05rem' }}>
                        {machine.nombre}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'var(--muted-foreground)', fontSize: '0.85rem' }}>
                        Máquina de escaneo
                      </Typography>
                    </Box>
                  </Box>
                  <Divider sx={{ my: 1.5, borderColor: 'var(--border)' }} />
                  <List dense>
                    <ListItem disableGutters>
                      <ListItemText
                        primary="Modelo"
                        secondary={machine.modelo}
                        primaryTypographyProps={{ sx: listPrimarySx }}
                        secondaryTypographyProps={{ component: 'div', sx: listSecondarySx }}
                      />
                    </ListItem>
                    {machine.fabricante && machine.fabricante !== 'N/A' && (
                      <ListItem disableGutters>
                        <ListItemText
                          primary="Fabricante"
                          secondary={machine.fabricante}
                          primaryTypographyProps={{ sx: listPrimarySx }}
                          secondaryTypographyProps={{ component: 'div', sx: listSecondarySx }}
                        />
                      </ListItem>
                    )}
                    {machine.ip && machine.ip !== 'N/A' && (
                      <ListItem disableGutters>
                        <ListItemText
                          primary="Dirección IP"
                          secondary={
                            <Typography component="span" variant="body2" sx={{ fontFamily: 'monospace', color: 'var(--card-foreground)' }}>
                              {machine.ip}
                            </Typography>
                          }
                          primaryTypographyProps={{ sx: listPrimarySx }}
                          secondaryTypographyProps={{ component: 'div' }}
                        />
                      </ListItem>
                    )}
                    {machine.mac && machine.mac !== 'N/A' && (
                      <ListItem disableGutters>
                        <ListItemText
                          primary="MAC"
                          secondary={
                            <Typography component="span" variant="body2" sx={{ fontFamily: 'monospace', color: 'var(--card-foreground)' }}>
                              {machine.mac}
                            </Typography>
                          }
                          primaryTypographyProps={{ sx: listPrimarySx }}
                          secondaryTypographyProps={{ component: 'div' }}
                        />
                      </ListItem>
                    )}
                    {machine.firmware && machine.firmware !== 'N/A' && (
                      <ListItem disableGutters>
                        <ListItemText
                          primary="Firmware"
                          secondary={machine.firmware}
                          primaryTypographyProps={{ sx: listPrimarySx }}
                          secondaryTypographyProps={{ component: 'div', sx: listSecondarySx }}
                        />
                      </ListItem>
                    )}
                    {machine.ultima_medicion && machine.ultima_medicion !== 'N/A' && (
                      <ListItem disableGutters>
                        <ListItemText
                          primary="Última medición"
                          secondary={MachinesSitesService.formatDate(machine.ultima_medicion)}
                          primaryTypographyProps={{ sx: listPrimarySx }}
                          secondaryTypographyProps={{ component: 'div', sx: listSecondarySx }}
                        />
                      </ListItem>
                    )}
                  </List>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
};

export default MachinesSites;
