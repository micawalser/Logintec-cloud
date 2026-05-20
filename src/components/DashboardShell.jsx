import React, { useState } from 'react';
import {
  Dns as ServerIcon,
  DocumentScanner as ScanIcon,
  Person as PersonIcon,
  FileDownload as DownloadIcon,
  BarChart as BarChartIcon,
  QueryStats as StatsIcon,
  Logout as LogoutIcon,
  Menu as MenuHamburgerIcon,
  Close as CloseIcon,
  ChevronRight as ChevronRightIcon,
  Refresh as RefreshIcon,
  LightMode as LightModeIcon,
  DarkMode as DarkModeIcon,
} from '@mui/icons-material';
import {
  Box,
  Drawer,
  IconButton,
  Typography,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Button,
  Menu,
  MenuItem,
  Tooltip,
  useMediaQuery,
  useTheme,
} from '@mui/material';

const NAV = [
  { tab: 0, name: 'Equipos', Icon: ServerIcon },
  { tab: 1, name: 'Escaneos', Icon: ScanIcon },
  { tab: 5, name: 'Estadísticas', Icon: StatsIcon },
  { tab: 2, name: 'Usuario', Icon: PersonIcon },
  { tab: 3, name: 'Exportación', Icon: DownloadIcon },
  { tab: 4, name: 'Reportes', Icon: BarChartIcon },
];

const drawerPaper = {
  width: 256,
  boxSizing: 'border-box',
  bgcolor: 'var(--sidebar)',
  color: 'var(--sidebar-foreground)',
  borderRight: '1px solid var(--sidebar-border)',
};

function getInitials(nombre) {
  if (!nombre || typeof nombre !== 'string') return 'LT';
  return nombre
    .split(/\s+/)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

const userAvatarSx = {
  width: 32,
  height: 32,
  minWidth: 32,
  flexShrink: 0,
  borderRadius: '50%',
  border: '1px solid rgba(91, 62, 163, 0.35)',
  bgcolor: 'rgba(91, 62, 163, 0.12)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  overflow: 'hidden',
  fontSize: '0.6875rem',
  fontWeight: 700,
  lineHeight: 1,
  letterSpacing: '-0.04em',
  color: 'var(--primary)',
  fontFamily: 'inherit',
};

export function DashboardShell({
  currentTab,
  onTabChange,
  children,
  user,
  onLogout,
  isDemo,
  onRefresh,
  showRefresh,
  colorMode,
  onToggleColorMode,
}) {
  const muiTheme = useTheme();
  const isLgUp = useMediaQuery(muiTheme.breakpoints.up('lg'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  const activeLabel = NAV.find((n) => n.tab === currentTab)?.name ?? 'Dashboard';
  const nombre = user?.nombre || user?.full_name || user?.name || 'Usuario';
  const email = user?.email || '';
  const rol = user?.rol || user?.role || '';

  const drawer = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: 64,
          px: 2,
          borderBottom: '1px solid var(--sidebar-border)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: 2,
              border: '1px solid rgba(91, 62, 163, 0.35)',
              bgcolor: 'rgba(91, 62, 163, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ScanIcon sx={{ fontSize: 20, color: 'var(--primary)' }} />
          </Box>
          <Box>
            <Typography sx={{ fontSize: '0.875rem', fontWeight: 600 }}>Logintec</Typography>
            <Typography sx={{ fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>Cloud</Typography>
          </Box>
        </Box>
        {!isLgUp && (
          <IconButton size="small" onClick={() => setMobileOpen(false)} sx={{ color: 'var(--muted-foreground)' }}>
            <CloseIcon sx={{ fontSize: 20 }} />
          </IconButton>
        )}
      </Box>

      <List sx={{ flex: 1, py: 1.5, px: 1.5, minHeight: 0, overflow: 'auto' }}>
        {NAV.map((item) => {
          const { Icon } = item;
          const active = currentTab === item.tab;
          const iconColor = active ? 'var(--primary)' : 'var(--muted-foreground)';
          return (
            <ListItemButton
              key={item.tab}
              selected={active}
              onClick={() => {
                onTabChange(item.tab);
                setMobileOpen(false);
              }}
              sx={{
                borderRadius: 2,
                mb: 0.5,
                py: 1.25,
                '&.Mui-selected': {
                  bgcolor: 'rgba(91, 62, 163, 0.12)',
                  color: 'var(--primary)',
                  '&:hover': { bgcolor: 'rgba(91, 62, 163, 0.18)' },
                },
                color: active ? 'var(--primary)' : 'var(--muted-foreground)',
              }}
            >
              <ListItemIcon sx={{ minWidth: 40, color: iconColor }}>
                <Icon sx={{ fontSize: 20 }} />
              </ListItemIcon>
              <ListItemText primary={item.name} primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: 500 }} />
              {active && <ChevronRightIcon sx={{ fontSize: 16, opacity: 0.8, color: 'inherit' }} />}
            </ListItemButton>
          );
        })}
      </List>

      <Divider sx={{ borderColor: 'var(--sidebar-border)' }} />
      <Box sx={{ p: 1.5 }}>
        <Button
          fullWidth
          onClick={(e) => setAnchorEl(e.currentTarget)}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.25,
            justifyContent: 'flex-start',
            textTransform: 'none',
            color: 'inherit',
            borderRadius: 2,
            py: 1.25,
            px: 1.5,
            minWidth: 0,
            '&:hover': { bgcolor: 'rgba(255,255,255,0.06)' },
          }}
        >
          <Box component="span" sx={userAvatarSx}>
            {getInitials(nombre)}
          </Box>
          <Box sx={{ textAlign: 'left', overflow: 'hidden', minWidth: 0 }}>
            <Typography noWrap sx={{ fontSize: '0.875rem', fontWeight: 500 }}>
              {nombre}
            </Typography>
            <Typography noWrap sx={{ fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>
              {rol || email || '—'}
            </Typography>
          </Box>
        </Button>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
          anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
          transformOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        >
          <Box sx={{ px: 2, py: 1, maxWidth: 220 }}>
            <Typography variant="body2" fontWeight={600}>
              {nombre}
            </Typography>
            {email ? (
              <Typography variant="caption" color="text.secondary">
                {email}
              </Typography>
            ) : null}
          </Box>
          <Divider />
          <MenuItem
            onClick={() => {
              setAnchorEl(null);
              onTabChange(2);
              setMobileOpen(false);
            }}
          >
            <ListItemIcon>
              <PersonIcon fontSize="small" />
            </ListItemIcon>
            Mi perfil
          </MenuItem>
          <MenuItem
            onClick={() => {
              setAnchorEl(null);
              onLogout();
            }}
            sx={{ color: 'error.main' }}
          >
            <ListItemIcon>
              <LogoutIcon fontSize="small" sx={{ color: 'error.main' }} />
            </ListItemIcon>
            Cerrar sesión
          </MenuItem>
        </Menu>
      </Box>
    </Box>
  );

  return (
    <Box
      sx={{
        display: 'flex',
        flex: 1,
        minHeight: 0,
        height: '100%',
        maxHeight: '100%',
        overflow: 'hidden',
        bgcolor: 'var(--background)',
        color: 'var(--foreground)',
      }}
    >
      <Drawer
        variant="temporary"
        anchor="left"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{ display: { xs: 'block', lg: 'none' }, '& .MuiDrawer-paper': drawerPaper }}
      >
        {drawer}
      </Drawer>
      <Drawer
        variant="permanent"
        anchor="left"
        sx={{
          display: { xs: 'none', lg: 'flex' },
          flexShrink: 0,
          width: 256,
          height: '100%',
          '& .MuiDrawer-paper': {
            ...drawerPaper,
            height: '100%',
            maxHeight: '100%',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            position: 'relative',
          },
        }}
      >
        {drawer}
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          minHeight: 0,
          overflow: 'hidden',
        }}
      >
        <Box
          component="header"
          sx={{
            flexShrink: 0,
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: { xs: 2, lg: 3 },
            borderBottom: '1px solid var(--border)',
            bgcolor: 'var(--header-bg)',
            backdropFilter: 'blur(8px)',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton sx={{ display: { lg: 'none' }, color: 'var(--muted-foreground)' }} onClick={() => setMobileOpen(true)}>
              <MenuHamburgerIcon sx={{ fontSize: 22 }} />
            </IconButton>
            <Box sx={{ display: { xs: 'none', sm: 'flex' }, alignItems: 'center', gap: 1, fontSize: '0.875rem' }}>
              <Typography component="span" sx={{ color: 'var(--muted-foreground)' }}>
                Dashboard
              </Typography>
              <ChevronRightIcon sx={{ fontSize: 16, color: 'var(--muted-foreground)' }} />
              <Typography component="span" fontWeight={600}>
                {activeLabel}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Tooltip title={colorMode === 'dark' ? 'Modo día' : 'Modo noche'}>
              <IconButton
                size="small"
                onClick={onToggleColorMode}
                aria-label={colorMode === 'dark' ? 'Activar modo día' : 'Activar modo noche'}
                sx={{ border: '1px solid var(--border)', borderRadius: 1, color: 'var(--foreground)' }}
              >
                {colorMode === 'dark' ? <LightModeIcon sx={{ fontSize: 18 }} /> : <DarkModeIcon sx={{ fontSize: 18 }} />}
              </IconButton>
            </Tooltip>
            <Typography
              component="span"
              sx={{
                fontSize: '0.75rem',
                fontWeight: 700,
                px: 1.25,
                py: 0.5,
                borderRadius: 999,
                bgcolor: isDemo ? 'rgba(245, 158, 11, 0.2)' : 'rgba(34, 197, 94, 0.2)',
                color: isDemo ? 'var(--warning)' : 'var(--success)',
              }}
            >
              {isDemo ? 'MODO DEMO' : 'MODO REAL'}
            </Typography>
            {showRefresh ? (
              <IconButton size="small" onClick={onRefresh} title="Actualizar" sx={{ border: '1px solid var(--border)', borderRadius: 1 }}>
                <RefreshIcon sx={{ fontSize: 18 }} />
              </IconButton>
            ) : null}
          </Box>
        </Box>
        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            overflow: 'auto',
            WebkitOverflowScrolling: 'touch',
            p: { xs: 2, lg: 3 },
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}
