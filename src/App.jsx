import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import axios from 'axios';
import ApiService from './apiService';
import { formatDateArgentina } from './utils/dateUtils';
import { checkAuthStatus, checkApiConnectivity, diagnoseImageProblem } from './utils/imageUtils';
import {
  Box, TextField, Button, Paper, Typography,
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, ThemeProvider, createTheme, CircularProgress,
  Alert, Chip, Dialog, DialogContent, DialogTitle, IconButton, Tooltip, Fab, CssBaseline, MenuItem, Switch, FormControlLabel
} from '@mui/material';
import {
  Visibility as ViewIcon,
  Image as ImageIcon,
  Camera as CameraIcon,
  Close as CloseIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  Add as AddIcon,
  Info as InfoIcon,
  LightMode as LightModeIcon,
  DarkMode as DarkModeIcon,
  BarChart as StatsBarChartIcon,
  Inventory2 as PackageIcon,
  Scale as ScaleIcon,
  Timeline as ActivityIcon,
  CalendarMonth as CalendarIcon,
} from '@mui/icons-material';

// ✅ IMPORT MÁQUINAS Y SITIOS
import MachinesSites from './pages/MachinesSites';
import MachinesSitesService from './services/machinesSitesService';
import UserProfile from './pages/UserProfile';
import Exportacion from './pages/Exportacion';
import Reportes from './pages/Reportes';
import WorkingImageDiagnosticModal from './components/WorkingImageDiagnosticModal';
import { DashboardShell } from './components/DashboardShell';

// ========================================================================
// THEME (MUI) + modo día / noche (persiste en localStorage + data-theme en <html>)
// ========================================================================
const THEME_STORAGE_KEY = 'logintec_theme';

function readStoredTheme() {
  try {
    return localStorage.getItem(THEME_STORAGE_KEY) === 'light' ? 'light' : 'dark';
  } catch {
    return 'dark';
  }
}

function createAppTheme(mode) {
  const isDark = mode === 'dark';
  const textPrimary = isDark ? '#fafafa' : '#18181b';
  const textSecondary = isDark ? '#a1a1aa' : '#52525b';
  const paperBg = isDark ? '#111111' : '#ffffff';
  const defaultBg = isDark ? '#0a0a0a' : '#f4f4f5';
  const border = isDark ? '#262626' : '#e4e4e7';
  const inputBg = isDark ? '#1a1a1a' : '#fafafa';
  const tableHeadBg = isDark ? '#171717' : '#f4f4f5';

  return createTheme({
    palette: {
      mode,
      primary: { main: '#5b3ea3', light: '#7B5BB8', dark: '#3D2A73' },
      secondary: { main: '#22c55e', light: '#4ade80', dark: '#15803d' },
      background: { default: defaultBg, paper: paperBg },
      text: { primary: textPrimary, secondary: textSecondary },
      divider: border,
      error: { main: isDark ? '#ef4444' : '#dc2626' },
    },
    typography: {
      fontFamily: '"Inter", system-ui, sans-serif',
      h4: { fontWeight: 600, color: textPrimary },
      h5: { fontWeight: 500, color: textPrimary },
      h6: { fontWeight: 500, color: textPrimary },
    },
    shape: { borderRadius: 10 },
    components: {
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            backgroundColor: paperBg,
            border: `1px solid ${border}`,
            boxShadow: 'none',
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          contained: {
            textTransform: 'none',
            fontWeight: 600,
            borderRadius: 8,
            boxShadow: 'none',
          },
          outlined: { textTransform: 'none', fontWeight: 500, borderRadius: 8 },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: { borderColor: border, fontSize: '0.875rem' },
          head: {
            backgroundColor: tableHeadBg,
            fontWeight: 600,
            color: textPrimary,
            borderColor: border,
          },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: { backgroundColor: inputBg },
          notchedOutline: { borderColor: border },
        },
      },
      MuiChip: {
        styleOverrides: { root: { borderColor: isDark ? '#404040' : '#d4d4d8' } },
      },
    },
  });
}

// ========================================================================
// DEMO MODE CONFIGURATION
// ========================================================================
const DEMO_MODE_KEY = 'logintec_demo_mode';

// Datos de demostración
const DEMO_DATA = {
  user: {
    id: 1,
    email: 'demo@logintec.com',
    nombre: 'Usuario Demo',
    rol: 'Administrador'
  },
  escaneos: [
    {
      id: 1,
      serial: 'DEMO001',
      usuario: 'Juan Pérez',
      usuario_escaneo: 'Juan Pérez',
      maquina_modelo: 'Scanner 3D Pro',
      site_name: 'Planta Central',
      fecha: '2024-01-15T10:30:00Z',
      ancho: 25.5,
      largo: 30.2,
      alto: 15.8,
      volumen: 12150.78,
      peso: 2.3,
      tiene_imagen_3d: true,
      tiene_imagen_camara: true,
      imagen_3d_filename: 'demo_3d_001.jpg',
      imagen_camara_filename: 'demo_cam_001.jpg'
    },
    {
      id: 2,
      serial: 'DEMO002',
      usuario: 'María García',
      usuario_escaneo: 'María García',
      maquina_modelo: 'Scanner Compact',
      site_name: 'Sucursal Norte',
      fecha: '2024-01-14T14:20:00Z',
      ancho: 18.3,
      largo: 22.1,
      alto: 12.5,
      volumen: 5056.125,
      peso: 1.8,
      tiene_imagen_3d: true,
      tiene_imagen_camara: false,
      imagen_3d_filename: 'demo_3d_002.jpg',
      imagen_camara_filename: null
    },
    {
      id: 3,
      serial: 'DEMO003',
      usuario: 'Carlos López',
      usuario_escaneo: 'Carlos López',
      maquina_modelo: 'Scanner Industrial',
      site_name: 'Planta Sur',
      fecha: '2024-01-13T09:15:00Z',
      ancho: 35.2,
      largo: 42.8,
      alto: 28.5,
      volumen: 42924.16,
      peso: 5.7,
      tiene_imagen_3d: false,
      tiene_imagen_camara: true,
      imagen_3d_filename: null,
      imagen_camara_filename: 'demo_cam_003.jpg'
    },
    {
      id: 4,
      serial: 'DEMO004',
      usuario: 'Ana Martínez',
      usuario_escaneo: 'Ana Martínez',
      maquina_modelo: 'Scanner 3D Pro',
      site_name: 'Planta Central',
      fecha: '2024-01-12T16:45:00Z',
      ancho: 28.7,
      largo: 33.4,
      alto: 19.2,
      volumen: 18407.616,
      peso: 3.1,
      tiene_imagen_3d: true,
      tiene_imagen_camara: true,
      imagen_3d_filename: 'demo_3d_004.jpg',
      imagen_camara_filename: 'demo_cam_004.jpg'
    },
    {
      id: 5,
      serial: 'DEMO005',
      usuario: 'Roberto Silva',
      usuario_escaneo: 'Roberto Silva',
      maquina_modelo: 'Scanner Compact',
      site_name: 'Sucursal Este',
      fecha: '2024-01-11T11:30:00Z',
      ancho: 20.1,
      largo: 25.6,
      alto: 14.3,
      volumen: 7361.088,
      peso: 2.1,
      tiene_imagen_3d: false,
      tiene_imagen_camara: false,
      imagen_3d_filename: null,
      imagen_camara_filename: null
    },
    // 🆕 EJEMPLO DE VOXEL CAM CON MÚLTIPLES BULTOS
    {
      id: 6,
      serial: 'VOXEL_CAM_001',
      usuario: 'Voxel Cam App',
      usuario_escaneo: 'voxel_cam_app',
      maquina_modelo: 'Voxel Cam Pro',
      site_name: 'PC San Martín',
      fecha: '2024-01-16T14:20:00Z',
      // Datos agregados del lote
      cantidad_bultos: 4,
      volumen_total: 367.72,
      peso_total: 64.6,
      // Datos individuales de cada bulto
      bultos_individuales: [
        {
          ancho: 25.5,
          largo: 30.2,
          alto: 15.8,
          volumen: 12150.78,
          peso: 2.3
        },
        {
          ancho: 18.3,
          largo: 22.1,
          alto: 12.5,
          volumen: 5056.125,
          peso: 1.8
        },
        {
          ancho: 22.1,
          largo: 28.5,
          alto: 18.2,
          volumen: 11456.37,
          peso: 3.1
        },
        {
          ancho: 19.8,
          largo: 25.3,
          alto: 14.1,
          volumen: 7056.234,
          peso: 2.8
        }
      ],
      tiene_imagen_3d: true,
      tiene_imagen_camara: true,
      imagen_3d_filename: 'voxel_cam_001_3d.jpg',
      imagen_camara_filename: 'voxel_cam_001_cam.jpg'
    }
  ],
  estadisticas: {
    total_escaneos: 6,
    escaneos_hoy: 2,
    escaneos_semana: 4,
    escaneos_mes: 6,
    volumen_total: 90967.509,
    peso_total: 77.1
  }
};

// ========================================================================
// API COMMUNICATION
// ========================================================================
import { API_BASE_URL, BACKEND_PUBLIC_URL, DEFAULT_ESCANEOS_PAGE_SIZE } from './config/api';
const pageSize = DEFAULT_ESCANEOS_PAGE_SIZE;

// getAuthHeaders como función normal fuera de los componentes
const getAuthHeaders = () => ({
  'Authorization': `Bearer ${localStorage.getItem('authToken')}`
});

// Función para verificar si está en modo demo
const isDemoMode = () => {
  return localStorage.getItem(DEMO_MODE_KEY) === 'true';
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/** Reintenta GET ante 502/503 (típico de Render frío o proxy). Respeta `signal` (p. ej. AbortController). */
async function axiosGetWithColdStartRetry(url, config = {}, options = {}) {
  const { maxAttempts = 6, baseDelayMs = 2000 } = options;
  const mergedConfig = { timeout: 120000, ...config };
  let lastError;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    mergedConfig.signal?.throwIfAborted?.();
    try {
      return await axios.get(url, mergedConfig);
    } catch (err) {
      lastError = err;
      if (err?.code === 'ERR_CANCELED' || err?.name === 'CanceledError') {
        throw err;
      }
      const status = err?.response?.status;
      const retryable = status === 502 || status === 503;
      if (!retryable || attempt === maxAttempts - 1) {
        throw err;
      }
      await sleep(baseDelayMs * (attempt + 1));
      mergedConfig.signal?.throwIfAborted?.();
    }
  }
  throw lastError;
}

const api = {
  login: (usuario, password) => {
    if (isDemoMode()) {
      // Simular login exitoso en modo demo
      return Promise.resolve({
        data: {
          access_token: 'demo_token_' + Date.now(),
          token_type: 'bearer'
        }
      });
    }
    const params = new URLSearchParams();
    params.append('username', usuario);
    params.append('password', password);
    return axios.post(`${BACKEND_PUBLIC_URL}/auth/token`, params, {
      headers: { 
        'Content-Type': 'application/x-www-form-urlencoded' 
      },
    });
  },
  fetchCurrentUser: () => {
    if (isDemoMode()) {
      return Promise.resolve({ data: DEMO_DATA.user });
    }
    return axios.get(`${API_BASE_URL}/api/cloud/me`, { headers: getAuthHeaders() });
  },
  fetchEscaneos: (page = 1, requestOptions = {}) => {
    if (isDemoMode()) {
      // Simular paginación con datos demo
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedEscaneos = DEMO_DATA.escaneos.slice(startIndex, endIndex);
      
      return Promise.resolve({
        data: {
          items: paginatedEscaneos,
          total: DEMO_DATA.escaneos.length,
          page: page,
          page_size: pageSize
        }
      });
    }
    const { signal } = requestOptions;
    return axiosGetWithColdStartRetry(
      `${API_BASE_URL}/api/cloud/escaneos?page=${page}&page_size=${pageSize}`,
      { headers: getAuthHeaders(), ...(signal ? { signal } : {}) },
      { maxAttempts: 6, baseDelayMs: 2000 },
    );
  },
  fetchStats: () => {
    if (isDemoMode()) {
      return Promise.resolve({ data: DEMO_DATA.estadisticas });
    }
    return axios.get(`${API_BASE_URL}/api/cloud/estadisticas`, { headers: getAuthHeaders() });
  },
  fetchImage: (scanId, tipo) => {
    if (isDemoMode()) {
      // Simular imagen demo (imagen placeholder)
      const escaneo = DEMO_DATA.escaneos.find(e => e.id === scanId);
      if (!escaneo) {
        return Promise.reject({ response: { status: 404, data: { message: 'Escaneo no encontrado' } } });
      }
      
      const hasImage = tipo === '3d' ? escaneo.tiene_imagen_3d : escaneo.tiene_imagen_camara;
      if (!hasImage) {
        return Promise.reject({ response: { status: 404, data: { message: `No hay imagen ${tipo} disponible` } } });
      }
      
      // Crear una imagen placeholder en base64 (pixel transparente)
      const placeholderImage = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
      
      return Promise.resolve({
        data: {
          success: true,
          imagen_base64: placeholderImage,
          filename: tipo === '3d' ? escaneo.imagen_3d_filename : escaneo.imagen_camara_filename,
          serial: escaneo.serial
        }
      });
    }
    return axios.get(
      `${API_BASE_URL}/api/cloud/escaneo/${scanId}/imagen?tipo=${tipo}`,
      { 
        headers: getAuthHeaders(), 
        timeout: 60000, // Aumentar timeout a 60 segundos
        responseType: 'json'
      }
    );
  }
};

// ========================================================================
// UTILITY & FORMATTING FUNCTIONS
// ========================================================================
const formatDate = (dateInput) => {
    return formatDateArgentina(dateInput);
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

const getUsuarioValue = (escaneo) => {
    const campos = ['usuario_escaneo', 'usuario_escaner', 'usuario_scanner', 'usuario', 'user_name', 'username', 'nombre_usuario'];
    for (const campo of campos) {
        if (escaneo[campo] && escaneo[campo] !== '' && escaneo[campo] !== null && escaneo[campo] !== 'No especificado') {
            return escaneo[campo];
        }
    }
    return 'N/D';
};

  // Función mejorada para verificar si una imagen existe
  const hasImage = (escaneo, tipo) => {
    const flag = tipo === '3d' ? escaneo.tiene_imagen_3d : escaneo.tiene_imagen_camara;
    const image = tipo === '3d' ? escaneo.imagen_3d : escaneo.imagen_camara;
    const filename = tipo === '3d' ? escaneo.imagen_3d_filename : escaneo.imagen_camara_filename;

    const hasImageFlag = !!flag;
    const hasImageData = !!(image && image.length > 0);
    const hasFilename = !!(filename && filename !== '');

    const result = !!(hasImageFlag || hasImageData || hasFilename);

    // Logging para debug
    if (escaneo.serial) {
      // console.log(`🔍 Verificando imagen ${tipo} para ${escaneo.serial}:`, {
      //   flag: hasImageFlag,
      //   imageData: hasImageData,
      //   filename: hasFilename,
      //   result: result
      // });
    }

    return result;
  };

// 1. Formatear la fecha:
const formatFechaLegible = (escaneo) => {
  // Si viene el campo legible, úsalo; si no, formatea el ISO
  return escaneo.maquina_ultima_medicion_legible || escaneo.ultima_conexion_legible || (escaneo.fecha ? formatDate(escaneo.fecha) : 'N/A');
};

// Reemplazar función de formateo de volumen
const formatVolumeSmart = (volumen) => {
  if (!volumen && volumen !== 0) return 'N/A';
  // ✅ Volumen ya viene en dm³ desde la BD, solo formatear
  let valor = parseFloat(volumen).toFixed(3);
  valor = valor.replace(/\.0+$|(\.\d*?[1-9])0+$/, '$1');
  return `${valor} dm³`;
};

const DEMO_CHART_DATA = [
  { day: 'Lun', scans: 18, volume: 342 },
  { day: 'Mar', scans: 24, volume: 456 },
  { day: 'Mié', scans: 15, volume: 287 },
  { day: 'Jue', scans: 31, volume: 589 },
  { day: 'Vie', scans: 28, volume: 521 },
  { day: 'Sáb', scans: 12, volume: 228 },
  { day: 'Dom', scans: 8, volume: 156 },
];

const DEMO_TOP_USERS = [
  { name: 'Juan Pérez', scans: 45, volume: 867.3 },
  { name: 'María García', scans: 38, volume: 712.8 },
  { name: 'Carlos López', scans: 32, volume: 598.2 },
  { name: 'Ana Martínez', scans: 28, volume: 521.4 },
  { name: 'Roberto Silva', scans: 13, volume: 147.8 },
];

const numberOrZero = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
};

const parseFechaEscaneo = (escaneo) => {
  const raw =
    escaneo?.fecha ??
    escaneo?.timestamp_str ??
    escaneo?.fecha_escaneo ??
    escaneo?.created_at ??
    escaneo?.timestamp;
  if (raw == null || raw === '') return null;
  const normalized =
    typeof raw === 'string' && raw.includes(' ') && !raw.includes('T')
      ? raw.replace(' ', 'T')
      : raw;
  const d = new Date(normalized);
  return Number.isNaN(d.getTime()) ? null : d;
};

const startOfDay = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

const startOfWeek = (date) => {
  const d = startOfDay(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d;
};

const startOfMonth = (date) => {
  const d = startOfDay(date);
  d.setDate(1);
  return d;
};

const mapEscaneoItem = (escaneo) => {
  const enriched = MachinesSitesService.enrichScanWithMachineData(escaneo);
  return {
    ...enriched,
    fecha: escaneo.timestamp_str || escaneo.fecha,
    cantidad_bultos: escaneo.cantidad_total_bultos || escaneo.cantidad_bultos || 1,
  };
};

const formatStatNumber = (value, decimals = 0) => {
  const number = numberOrZero(value);
  return number.toLocaleString('es-AR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

function StatCard({ icon: Icon, label, value, unit, trend, trendUp = true }) {
  return (
    <Paper
      sx={{
        p: 2,
        borderRadius: 3,
        bgcolor: 'var(--card)',
        minHeight: 125,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
        <Box
          sx={{
            width: 38,
            height: 38,
            borderRadius: 2,
            bgcolor: 'rgba(91, 62, 163, 0.14)',
            color: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon sx={{ fontSize: 22 }} />
        </Box>
        {trend && (
          <Typography sx={{ color: trendUp ? '#22c55e' : '#ef4444', fontSize: '0.75rem', fontWeight: 700 }}>
            {trend}
          </Typography>
        )}
      </Box>
      <Typography sx={{ fontSize: '1.55rem', lineHeight: 1.1, fontWeight: 700, color: 'var(--foreground)' }}>
        {value}
        {unit && (
          <Typography component="span" sx={{ ml: 0.5, fontSize: '0.8rem', fontWeight: 500, color: 'var(--muted-foreground)' }}>
            {unit}
          </Typography>
        )}
      </Typography>
      <Typography sx={{ mt: 0.75, fontSize: '0.86rem', color: 'var(--muted-foreground)' }}>{label}</Typography>
    </Paper>
  );
}

function ProgressMetric({ label, value, color }) {
  const colors = {
    primary: 'var(--primary)',
    emerald: '#10b981',
    amber: '#f59e0b',
    blue: '#3b82f6',
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
        <Typography sx={{ fontSize: '0.9rem', color: 'var(--muted-foreground)' }}>{label}</Typography>
        <Typography sx={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--foreground)' }}>{value}%</Typography>
      </Box>
      <Box sx={{ height: 8, bgcolor: 'var(--muted)', borderRadius: 999, overflow: 'hidden' }}>
        <Box
          sx={{
            height: '100%',
            width: `${value}%`,
            bgcolor: colors[color],
            borderRadius: 999,
            transition: 'width 220ms ease',
          }}
        />
      </Box>
    </Box>
  );
}

// ========================================================================
// COMPONENT: LoginForm
// ========================================================================
const LoginForm = ({ onLogin, colorMode, onToggleColorMode }) => {
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [demoMode, setDemoMode] = useState(localStorage.getItem(DEMO_MODE_KEY) === 'true');

  useEffect(() => {
    if (demoMode) {
      setUsuario('demo@logintec.com');
      setPassword('demo123');
    }
  }, [demoMode]);

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

  const handleDemoModeToggle = (event) => {
    const isDemo = event.target.checked;
    setDemoMode(isDemo);
    localStorage.setItem(DEMO_MODE_KEY, isDemo.toString());
    if (isDemo) {
      setUsuario('demo@logintec.com');
      setPassword('demo123');
    } else {
      setUsuario('');
      setPassword('');
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        position: 'relative',
        display: 'flex',
        minHeight: '100vh',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(145deg, var(--background) 0%, var(--muted) 45%, var(--background) 100%)',
        px: 2,
        py: 5,
      }}
    >
      <Tooltip title={colorMode === 'dark' ? 'Modo día' : 'Modo noche'} placement="left">
        <IconButton
          type="button"
          onClick={onToggleColorMode}
          aria-label={colorMode === 'dark' ? 'Activar modo día' : 'Activar modo noche'}
          sx={{
            position: 'absolute',
            top: { xs: 12, sm: 20 },
            right: { xs: 12, sm: 20 },
            zIndex: 2,
            border: '1px solid var(--border)',
            bgcolor: 'var(--card)',
            color: 'var(--foreground)',
            '&:hover': { bgcolor: 'var(--muted)' },
          }}
        >
          {colorMode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
        </IconButton>
      </Tooltip>
      <Paper
        elevation={0}
        sx={{
          width: '100%',
          maxWidth: 420,
          p: 4,
          borderRadius: 3,
          border: '1px solid var(--border)',
          bgcolor: 'var(--card)',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
        }}
      >
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Box
            component="img"
            src="/logocloud.png"
            alt="Logintec"
            sx={{ width: 220, height: 'auto', mb: 2, mx: 'auto', display: 'block' }}
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
          <Typography variant="body2" sx={{ color: 'var(--muted-foreground)' }}>
            Sistema de gestión de escaneos
          </Typography>
        </Box>

        <Box
          sx={{
            mb: 3,
            p: 2,
            borderRadius: 2,
            border: '2px solid',
            borderColor: demoMode ? 'rgba(91, 62, 163, 0.5)' : 'var(--border)',
            bgcolor: demoMode ? 'rgba(91, 62, 163, 0.08)' : 'var(--muted)',
          }}
        >
          <FormControlLabel
            control={<Switch checked={demoMode} onChange={handleDemoModeToggle} color="primary" />}
            label={
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  Modo demo
                </Typography>
                <Typography variant="caption" sx={{ color: 'var(--muted-foreground)' }}>
                  {demoMode ? 'Usando datos de demostración' : 'Conectar a base de datos real'}
                </Typography>
              </Box>
            }
          />
          {demoMode && (
            <Alert severity="info" sx={{ mt: 1, fontSize: '0.75rem', bgcolor: 'rgba(91, 62, 163, 0.12)' }}>
              <strong>Modo demo:</strong> usa cualquier email y contraseña para ingresar.
            </Alert>
          )}
        </Box>

        <TextField
          fullWidth
          label="Email"
          type="email"
          autoComplete="username"
          value={usuario}
          onChange={(e) => setUsuario(e.target.value)}
          margin="normal"
          disabled={demoMode}
        />
        <TextField
          fullWidth
          label="Contraseña"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          margin="normal"
          disabled={demoMode}
        />

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}

        <Button
          type="submit"
          fullWidth
          size="large"
          variant="contained"
          disabled={loading}
          sx={{ mt: 3, py: 1.5, fontWeight: 600, bgcolor: 'var(--primary)', '&:hover': { bgcolor: 'var(--primary-dark)' } }}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : demoMode ? 'Ingresar (demo)' : 'Ingresar'}
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
      <DialogTitle sx={{ background: 'linear-gradient(135deg, #5b3ea3 0%, #7B5BB8 100%)', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
// COMPONENT: EscaneosTable
// ========================================================================
const EscaneosTable = ({ escaneos, onViewImage, loadingImages }) => {
  const calculateVolume = (escaneo) => {
    if (escaneo.volumen) return escaneo.volumen;
    const [ancho, altura, largo] = [escaneo.ancho || 0, escaneo.altura || escaneo.alto || 0, escaneo.largo || 0];
    return (ancho && altura && largo) ? ancho * altura * largo : null;
  };

  const getLargoValueCm = (escaneo) => {
    const largo = getSafeValue(escaneo, 'largo', null);
    if (largo !== null) return formatDimensionCm(largo);
    const altoAsLargo = getSafeValue(escaneo, 'alto', null);
    return altoAsLargo !== null ? `${formatDimensionCm(altoAsLargo)}*` : 'N/A';
  };

  return (
    <TableContainer component={Paper} sx={{ mt: 2 }}>
      <Table sx={{ minWidth: 1485 }}>
        <TableHead>
          <TableRow>
            <TableCell>Serial</TableCell><TableCell>Usuario</TableCell><TableCell>Máquina</TableCell><TableCell>Sitio</TableCell><TableCell>Fecha</TableCell>
            <TableCell>Ancho (cm)</TableCell><TableCell>Largo (cm)</TableCell><TableCell>Alto (cm)</TableCell>
            <TableCell>Volumen (dm³)</TableCell><TableCell>Peso (kg)</TableCell><TableCell>Cantidad Bultos</TableCell><TableCell>Imágenes</TableCell><TableCell>Acciones</TableCell><TableCell>Detalle</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {escaneos.map((escaneo) => {
            return (
              <TableRow key={escaneo.id} hover>
                <TableCell sx={{ maxWidth: 150, overflow: 'hidden' }}>
                  <Tooltip title={getSafeValue(escaneo, 'serial') || ''} arrow>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {getSafeValue(escaneo, 'serial')}
                    </Typography>
                  </Tooltip>
                </TableCell>
                <TableCell><Typography variant="body2" sx={{ color: '#5b3ea3', fontWeight: 500 }}>{getUsuarioValue(escaneo)}</Typography></TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {escaneo.machine_name || escaneo.maquina?.nombre || escaneo.maquina_modelo || 'N/D'}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {escaneo.site_name || escaneo.sitio?.nombre || escaneo.site_name || 'N/D'}
                  </Typography>
                </TableCell>
                <TableCell>{formatDate(escaneo.fecha)}</TableCell>
                <TableCell>{formatDimensionCm(getSafeValue(escaneo, 'ancho'))}</TableCell>
                <TableCell>{getLargoValueCm(escaneo)}</TableCell>
                <TableCell>{formatDimensionCm(getSafeValue(escaneo, 'altura') || getSafeValue(escaneo, 'alto'))}</TableCell>
                <TableCell><Chip label={formatVolumeSmart(calculateVolume(escaneo))} size="small" color="secondary" variant="outlined" /></TableCell>
                <TableCell>{formatPesoKg(escaneo.peso)}</TableCell>
                <TableCell sx={{ textAlign: 'center' }}>
                  {escaneo.cantidad_bultos ? escaneo.cantidad_bultos : '-'}
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                    {hasImage(escaneo, '3d') && (
                      <Tooltip title="Ver Imagen 3D">
                        <span>
                          <IconButton size="small" onClick={() => onViewImage(escaneo.id, '3d')} disabled={loadingImages[`${escaneo.id}_3d`]} sx={{ color: '#5b3ea3' }}>
                            {loadingImages[`${escaneo.id}_3d`] ? <CircularProgress size={16} /> : <ImageIcon fontSize="small" />}
                          </IconButton>
                        </span>
                      </Tooltip>
                    )}
                    {hasImage(escaneo, 'camara') && (
                       <Tooltip title="Ver Foto de Cámara">
                         <span>
                          <IconButton size="small" onClick={() => onViewImage(escaneo.id, 'camara')} disabled={loadingImages[`${escaneo.id}_camara`]} sx={{ color: '#7CB342' }}>
                            {loadingImages[`${escaneo.id}_camara`] ? <CircularProgress size={16} /> : <CameraIcon fontSize="small" />}
                          </IconButton>
                         </span>
                      </Tooltip>
                    )}
                  </Box>
                </TableCell>
                <TableCell>
                  <Tooltip title="Ver detalles del escaneo">
                    <IconButton size="small" sx={{ color: '#5b3ea3' }}><ViewIcon fontSize="small" /></IconButton>
                  </Tooltip>
                </TableCell>
                <TableCell>
                  {/* Mostrar ícono + si tiene detalles de bultos, sino gris */}
                  {escaneo.cantidad_bultos && escaneo.cantidad_bultos > 1 ? (
                    <Tooltip title="Ver detalles de bultos individuales">
                      <IconButton size="small" sx={{ color: '#5b3ea3' }} onClick={() => handleViewDetalleBultos(escaneo)}>
                        <AddIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  ) : (
                    <Tooltip title="Sin detalles adicionales">
                      <IconButton size="small" disabled sx={{ color: '#ccc' }}>
                        <AddIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

// ========================================================================
// COMPONENT: Dashboard
// ========================================================================
const Dashboard = ({ onLogout, colorMode, onToggleColorMode }) => {
  const [currentTab, setCurrentTab] = useState(1);
  const [escaneos, setEscaneos] = useState([]);
  const [escaneosFiltrados, setEscaneosFiltrados] = useState([]);
  const [estadisticas, setEstadisticas] = useState({});
  const [statsEscaneos, setStatsEscaneos] = useState([]);
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsError, setStatsError] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [loadingImages, setLoadingImages] = useState({});
  const [diagnosticModalOpen, setDiagnosticModalOpen] = useState(false);
  const [diagnosticData, setDiagnosticData] = useState(null);
  const [searchSN, setSearchSN] = useState('');
  const [paginaActual, setPaginaActual] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [totalEscaneos, setTotalEscaneos] = useState(0);
  const [filtroSitio, setFiltroSitio] = useState('');
  const [filtroMaquina, setFiltroMaquina] = useState('');
  const [sitiosUnicos, setSitiosUnicos] = useState([]);
  const [maquinasUnicas, setMaquinasUnicas] = useState([]);
  const [filtrosCargados, setFiltrosCargados] = useState(false);
  const filtrosCargadosRef = useRef(false);
  const filtrosCargaEnCursoRef = useRef(false);
  /** Si un GET escaneos se cancela (Strict Mode), no bajar `loading` si ya arrancó otro fetch. */
  const escaneosFetchGenRef = useRef(0);
  const [detalleBultosModalOpen, setDetalleBultosModalOpen] = useState(false);
  const [detalleBultosData, setDetalleBultosData] = useState(null);
  const [detalleBultosLoading, setDetalleBultosLoading] = useState(false);
  const [detalleBultosError, setDetalleBultosError] = useState(null);
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('userData') || 'null');
    } catch {
      return null;
    }
  });

  useEffect(() => {
    filtrosCargadosRef.current = filtrosCargados;
  }, [filtrosCargados]);

  /** Refs evitan recrear el callback cuando cambia filtrosCargados (eso re-disparaba el efecto del tab y pedía escaneos dos veces). */
  const loadFilterOptions = useCallback(async () => {
    if (filtrosCargadosRef.current || filtrosCargaEnCursoRef.current) return;
    filtrosCargaEnCursoRef.current = true;
    try {
      const [sitios, maquinas] = await Promise.all([
        MachinesSitesService.getAllSites(),
        MachinesSitesService.getAllMachines(),
      ]);
      setSitiosUnicos(sitios.map((s) => s.nombre).filter(Boolean));
      setMaquinasUnicas(maquinas.map((m) => m.nombre).filter(Boolean));
      setFiltrosCargados(true);
      filtrosCargadosRef.current = true;
    } catch (error) {
      console.error('Error cargando filtros:', error);
      setFiltrosCargados(true);
      filtrosCargadosRef.current = true;
    } finally {
      filtrosCargaEnCursoRef.current = false;
    }
  }, []);

  // Fetch escaneos con paginación real (`requestOptions.signal` para AbortController / Strict Mode)
  const fetchEscaneos = useCallback(async (pagina = 1, requestOptions = {}) => {
    const { signal } = requestOptions;
    const gen = ++escaneosFetchGenRef.current;
    setLoading(true);
    setError('');
    try {
      const response = await api.fetchEscaneos(pagina, { signal });
      const { items, total, page, page_size } = response.data;
      
      // ✅ MAPEAR campos y pre-enriquecer datos
      const itemsMapeados = (items || []).map(mapEscaneoItem);
      
      setEscaneos(itemsMapeados);
      setPaginaActual(page || 1);
      setTotalEscaneos(total || 0);
      setTotalPaginas(Math.ceil((total || 0) / (page_size || pageSize)));
    } catch (err) {
      if (err?.code === 'ERR_CANCELED' || err?.name === 'CanceledError') {
        return;
      }
      const status = err?.response?.status;
      const code = err?.code;
      if (status === 502 || status === 503 || code === 'ERR_NETWORK') {
        setError(
          'No se pudo conectar con el servidor (no disponible o error de red). En desarrollo usa `npm run dev` con el proxy de Vite; si el backend está en Render, puede estar frío o saturado: reintenta en unos segundos.',
        );
      } else {
        setError('No se pudo cargar la lista de escaneos.');
      }
    } finally {
      if (escaneosFetchGenRef.current === gen) {
        setLoading(false);
      }
    }
  }, []);

  const fetchTodosEscaneosParaStats = useCallback(async () => {
    const todos = [];
    let pagina = 1;
    let hayMas = true;

    while (hayMas) {
      const response = await api.fetchEscaneos(pagina);
      const { items, total, page_size } = response.data;
      todos.push(...(items || []).map(mapEscaneoItem));

      if ((items || []).length < page_size || todos.length >= (total || 0)) {
        hayMas = false;
      } else {
        pagina += 1;
      }
    }

    return todos;
  }, []);

  const fetchEstadisticas = useCallback(async () => {
    setStatsLoading(true);
    setStatsError('');
    try {
      const [statsRes, escaneosLista] = await Promise.all([
        api.fetchStats(),
        fetchTodosEscaneosParaStats(),
      ]);
      setEstadisticas(isDemoMode() ? DEMO_DATA.estadisticas : (statsRes.data || {}));
      setStatsEscaneos(escaneosLista);
    } catch (err) {
      console.error('Error cargando estadísticas:', err);
      setStatsError('No se pudieron cargar las estadísticas.');
      setStatsEscaneos([]);
    } finally {
      setStatsLoading(false);
    }
  }, [fetchTodosEscaneosParaStats]);

  /**
   * Tab Escaneos: primero lista (backend ya enriquece sitio/máquina por fila).
   * Filtros después, en segundo plano, para no competir en red/RAM con la petición de escaneos
   * ni re-disparar escaneos al cambiar la identidad del callback de filtros.
   */
  useEffect(() => {
    if (currentTab !== 1) return;
    const ac = new AbortController();
    (async () => {
      try {
        await fetchEscaneos(1, { signal: ac.signal });
      } finally {
        if (!ac.signal.aborted) {
          loadFilterOptions();
        }
      }
    })();
    return () => {
      ac.abort();
    };
  }, [currentTab, fetchEscaneos, loadFilterOptions]);

  useEffect(() => {
    if (currentTab !== 5) return;
    fetchEstadisticas();
  }, [currentTab, fetchEstadisticas]);

  useEffect(() => {
    let cancelled = false;
    api
      .fetchCurrentUser()
      .then(({ data }) => {
        if (cancelled || !data) return;
        setUser(data);
        localStorage.setItem('userData', JSON.stringify(data));
      })
      .catch(() => {
        if (cancelled) return;
        try {
          const parsed = JSON.parse(localStorage.getItem('userData') || 'null');
          if (parsed) setUser(parsed);
        } catch {
          /* ignore */
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Filtrar escaneos por SN, sitio y máquina
  useEffect(() => {
    let filtrados = escaneos;
    if (searchSN.trim()) {
      filtrados = filtrados.filter(escaneo =>
        escaneo.serial &&
        escaneo.serial.toLowerCase().includes(searchSN.toLowerCase())
      );
    }
    if (filtroSitio) {
      filtrados = filtrados.filter(escaneo => 
        escaneo.sitio?.nombre === filtroSitio || escaneo.site_name === filtroSitio
      );
    }
    if (filtroMaquina) {
      filtrados = filtrados.filter(escaneo => 
        escaneo.maquina?.nombre === filtroMaquina || escaneo.maquina_modelo === filtroMaquina
      );
    }
    setEscaneosFiltrados(filtrados);
  }, [escaneos, searchSN, filtroSitio, filtroMaquina]);

  const escaneosVisiblesParaTabla = useMemo(() => {
    const list = filtrarDuplicadosPorSerial(escaneosFiltrados);
    return [...list].sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
  }, [escaneosFiltrados]);

  const cantidadRegistrosEscaneos = totalEscaneos || escaneosVisiblesParaTabla.length;

  const statsComputadas = useMemo(() => {
    const now = new Date();
    const hoyStart = startOfDay(now);
    const semanaStart = startOfWeek(now);
    const mesStart = startOfMonth(now);

    let escaneos_hoy = 0;
    let escaneos_semana = 0;
    let escaneos_mes = 0;
    let volumen_total = 0;
    let peso_total = 0;

    statsEscaneos.forEach((escaneo) => {
      volumen_total += numberOrZero(escaneo.volumen ?? escaneo.volumen_total);
      peso_total += numberOrZero(escaneo.peso ?? escaneo.peso_total);

      const fecha = parseFechaEscaneo(escaneo);
      if (!fecha) return;
      if (fecha >= hoyStart) escaneos_hoy += 1;
      if (fecha >= semanaStart) escaneos_semana += 1;
      if (fecha >= mesStart) escaneos_mes += 1;
    });

    const totalApi = numberOrZero(estadisticas.total_escaneos);
    return {
      total_escaneos: totalApi > 0 ? totalApi : statsEscaneos.length,
      escaneos_hoy,
      escaneos_semana,
      escaneos_mes,
      volumen_total,
      peso_total,
    };
  }, [statsEscaneos, estadisticas.total_escaneos]);

  const chartDataEstadisticas = useMemo(() => {
    const dayLabels = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const today = new Date();
    const days = Array.from({ length: 7 }, (_, index) => {
      const date = new Date(today);
      date.setDate(today.getDate() - (6 - index));
      return {
        key: date.toISOString().slice(0, 10),
        day: dayLabels[date.getDay()],
        scans: 0,
        volume: 0,
      };
    });

    if (!statsEscaneos.length) {
      return isDemoMode() ? DEMO_CHART_DATA : days;
    }

    const byDate = new Map(days.map((day) => [day.key, day]));
    statsEscaneos.forEach((escaneo) => {
      const scanDate = parseFechaEscaneo(escaneo);
      if (!scanDate) return;
      const key = scanDate.toISOString().slice(0, 10);
      const target = byDate.get(key);
      if (!target) return;
      target.scans += 1;
      target.volume += numberOrZero(escaneo.volumen ?? escaneo.volumen_total);
    });

    return days.map(({ day, scans, volume }) => ({ day, scans, volume }));
  }, [statsEscaneos]);

  const topUsuariosEstadisticas = useMemo(() => {
    if (!statsEscaneos.length) {
      return isDemoMode() ? DEMO_TOP_USERS : [];
    }

    const mesStart = startOfMonth(new Date());
    const usersMap = new Map();

    statsEscaneos.forEach((escaneo) => {
      const fecha = parseFechaEscaneo(escaneo);
      if (!fecha || fecha < mesStart) return;

      const name =
        escaneo.usuario_nombre_completo ||
        escaneo.usuario ||
        escaneo.usuario_escaneo ||
        escaneo.username ||
        'Sin usuario';
      const current = usersMap.get(name) || { name, scans: 0, volume: 0 };
      current.scans += 1;
      current.volume += numberOrZero(escaneo.volumen ?? escaneo.volumen_total);
      usersMap.set(name, current);
    });

    return Array.from(usersMap.values())
      .sort((a, b) => b.scans - a.scans || b.volume - a.volume)
      .slice(0, 5);
  }, [statsEscaneos]);

  // Función mejorada para manejar la carga de imágenes
  const handleViewImage = async (scanId, tipo, forceCheck = false) => {
    // console.log(`🖼️ Intentando cargar imagen ${tipo} para scanId: ${scanId}`);
    setLoadingImages(prev => ({ ...prev, [`${scanId}_${tipo}`]: true }));

    try {
      // Verificar token antes de hacer la petición
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      // console.log(`🔑 Token encontrado, haciendo petición a la API...`);
      const response = await api.fetchImage(scanId, tipo);

      // console.log(`📡 Respuesta recibida:`, response.data);

      if (response.data.success && response.data.imagen_base64) {
        // console.log(`✅ Imagen cargada exitosamente`);
        setSelectedImage({
          base64: response.data.imagen_base64,
          filename: response.data.filename || `imagen_${tipo}_${scanId}`,
          tipo: tipo === '3d' ? 'Imagen 3D' : 'Foto de Cámara',
          scanId,
          serial: response.data.serial || 'N/A'
        });
        setImageDialogOpen(true);
      } else {
        console.error(`❌ Respuesta sin éxito:`, response.data);
        // Mostrar mensaje más amigable
        const errorMessage = response.data.message || `No se pudo cargar la imagen ${tipo}`;
        alert(`⚠️ ${errorMessage}\n\n💡 Sugerencia: Usa el diagnóstico para verificar el estado de la imagen.`);
      }
    } catch (error) {
      console.error(`❌ Error cargando imagen ${tipo}:`, error);

      let errorMessage = 'Error al cargar la imagen';
      let suggestion = '';

      if (error.response) {
        console.error('Respuesta del servidor:', error.response.data);
        console.error('Status:', error.response.status);

        if (error.response.status === 401) {
          errorMessage = 'Error de autenticación. Por favor, vuelve a iniciar sesión.';
          suggestion = '🔑 Tu sesión ha expirado. Inicia sesión nuevamente.';
      } else if (error.response.status === 404) {
        errorMessage = `La imagen ${tipo} no existe para este escaneo.`;
        suggestion = '📸 Esta imagen no fue guardada o se perdió del servidor.';
        
        // Información adicional para diagnóstico
        // console.log('🔍 Diagnóstico 404:', {
        //   scanId,
        //   tipo,
        //   url: `${API_BASE_URL}/api/cloud/escaneo/${scanId}/imagen?tipo=${tipo}`,
        //   token: token ? 'Presente' : 'Ausente',
        //   escaneo: escaneos.find(e => e.id === scanId)
        // });
        } else if (error.response.status === 500) {
          errorMessage = 'Error interno del servidor. Inténtalo más tarde.';
          suggestion = '🔄 El servidor está teniendo problemas. Intenta más tarde.';
        } else {
          errorMessage = `Error del servidor (${error.response.status}): ${error.response.data?.detail || error.response.data?.message || 'Error desconocido'}`;
          suggestion = '🔧 Contacta al administrador del sistema.';
        }
      } else if (error.request) {
        console.error('Error de red:', error.request);
        errorMessage = 'Error de conexión a internet.';
        suggestion = '🌐 Verifica tu conexión WiFi/internet e intenta nuevamente.';
      } else if (error.code === 'ENOTFOUND' || error.message.includes('getaddrinfo ENOTFOUND')) {
        errorMessage = 'No se puede conectar al servidor. Verifica tu conexión a internet.';
        suggestion = '📶 Revisa tu conexión WiFi y asegúrate de estar conectado a internet.';
      } else if (error.code === 'ECONNABORTED') {
        errorMessage = 'La carga de la imagen tardó demasiado. Inténtalo de nuevo.';
        suggestion = '⏱️ La imagen es muy grande o el servidor está lento. Intenta más tarde.';
      } else {
        errorMessage = `Error: ${error.message}`;
        suggestion = '🔍 Usa el diagnóstico para obtener más información.';
      }

      // Mostrar mensaje mejorado con sugerencias
      alert(`❌ ${errorMessage}\n\n💡 ${suggestion}\n\n🔍 Usa el botón de diagnóstico (ℹ️) para verificar el estado de la imagen.`);
    } finally {
      setLoadingImages(prev => ({ ...prev, [`${scanId}_${tipo}`]: false }));
    }
  };

  // Función para intentar cargar imágenes no marcadas como disponibles
  const handleTryLoadImage = async (scanId, tipo) => {
    // console.log(`🔍 Intentando cargar imagen ${tipo} no marcada como disponible para scanId: ${scanId}`);
    
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        alert('❌ No hay token de autenticación. Por favor, vuelve a iniciar sesión.');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/cloud/escaneo/${scanId}/imagen?tipo=${tipo}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (response.ok && data.success && data.imagen_base64) {
        // console.log(`✅ ¡Imagen ${tipo} encontrada aunque no estaba marcada como disponible!`);
        setSelectedImage({
          base64: data.imagen_base64,
          filename: data.filename || `imagen_${tipo}_${scanId}`,
          tipo: tipo === '3d' ? 'Imagen 3D' : 'Foto de Cámara',
          scanId,
          serial: data.serial || 'N/A'
        });
        setImageDialogOpen(true);
        
        // Mostrar mensaje de éxito
        alert(`🎉 ¡Imagen ${tipo} encontrada!\n\nLa imagen existe en el servidor pero no estaba marcada como disponible en la base de datos.`);
      } else {
        // console.log(`❌ Imagen ${tipo} no encontrada en el servidor`);
        alert(`❌ La imagen ${tipo} no existe en el servidor.\n\nStatus: ${response.status}\nMensaje: ${data.message || 'No disponible'}`);
      }
    } catch (error) {
      console.error(`❌ Error intentando cargar imagen ${tipo}:`, error);
      alert(`❌ Error al intentar cargar la imagen ${tipo}:\n\n${error.message}`);
    }
  };

  // Función para abrir modal de detalles de bultos
  const handleViewDetalleBultos = async (escaneo) => {
    console.log('🚀 Iniciando handleViewDetalleBultos con escaneo:', escaneo);
    console.log('📊 Datos del escaneo:', {
      id: escaneo.id,
      serial: escaneo.serial,
      cantidad_bultos: escaneo.cantidad_bultos,
      volumen: escaneo.volumen,
      peso: escaneo.peso
    });
    
    setDetalleBultosModalOpen(true);
    setDetalleBultosLoading(true);
    setDetalleBultosError(null);
    setDetalleBultosData(escaneo); // Datos básicos del escaneo

    try {
      console.log('🔄 Cargando detalles de bultos para escaneo:', escaneo.id);
      
      // Verificar si estamos en modo demo
      if (isDemoMode()) {
        // En modo demo, usar los datos que ya están en el escaneo
        console.log('📊 Modo demo: usando datos existentes');
        setDetalleBultosData(escaneo);
        setDetalleBultosLoading(false);
        return;
      }

      // Cargar detalles reales desde la API
      console.log('🌐 Llamando a ApiService.getDetallesBultos con ID:', escaneo.id);
      const detallesResponse = await ApiService.getDetallesBultos(escaneo.id);
      console.log('✅ Detalles cargados:', detallesResponse);
      console.log('🔍 DEBUG - Primer grupo:', detallesResponse.bultos_agrupados?.[0]);
      console.log('🔍 DEBUG - Volumen en grupo:', detallesResponse.bultos_agrupados?.[0]?.volumen);

      // Combinar datos del escaneo con los detalles de bultos agrupados
      const datosCompletos = {
        ...escaneo,
        bultos_agrupados: detallesResponse.bultos_agrupados || [],
        total_grupos: detallesResponse.total_grupos || 0,
        total_bultos: detallesResponse.total_bultos || escaneo.cantidad_bultos || 1,
        volumen_total: detallesResponse.volumen_total || escaneo.volumen,
        peso_total: detallesResponse.peso_total || escaneo.peso
      };

      console.log('📋 Datos completos para el modal:', datosCompletos);
      setDetalleBultosData(datosCompletos);
    } catch (error) {
      console.error('❌ Error cargando detalles de bultos:', error);
      setDetalleBultosError(error.message || 'Error al cargar los detalles de bultos');
      
      // Mantener los datos básicos del escaneo aunque falle la carga de detalles
      setDetalleBultosData({
        ...escaneo,
        bultos_individuales: [],
        cantidad_bultos: escaneo.cantidad_bultos || 1
      });
    } finally {
      setDetalleBultosLoading(false);
      console.log('✅ handleViewDetalleBultos completado');
    }
  };

  const renderEstadisticasTab = () => {
    const stats = statsComputadas;
    const total = stats.total_escaneos;
    const imagenes3d = statsEscaneos.length
      ? Math.round((statsEscaneos.filter((e) => e.tiene_imagen_3d).length / statsEscaneos.length) * 100)
      : 0;
    const fotosCamara = statsEscaneos.length
      ? Math.round((statsEscaneos.filter((e) => e.tiene_imagen_camara).length / statsEscaneos.length) * 100)
      : 0;
    const utilizacion = total > 0 ? Math.min(100, Math.round((stats.escaneos_mes / total) * 100)) : 0;
    const conFecha = statsEscaneos.filter((e) => parseFechaEscaneo(e)).length;
    const tasaExito = statsEscaneos.length
      ? Math.round((conFecha / statsEscaneos.length) * 100)
      : 0;
    const maxScans = Math.max(1, ...chartDataEstadisticas.map((data) => data.scans));

    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {statsError && <Alert severity="warning">{statsError}</Alert>}

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: 'repeat(2, minmax(0, 1fr))',
              md: 'repeat(3, minmax(0, 1fr))',
              xl: 'repeat(6, minmax(0, 1fr))',
            },
            gap: 2,
          }}
        >
          <StatCard icon={StatsBarChartIcon} label="Total Escaneos" value={formatStatNumber(stats.total_escaneos)} />
          <StatCard icon={ActivityIcon} label="Hoy" value={formatStatNumber(stats.escaneos_hoy)} />
          <StatCard icon={CalendarIcon} label="Esta Semana" value={formatStatNumber(stats.escaneos_semana)} />
          <StatCard icon={CalendarIcon} label="Este Mes" value={formatStatNumber(stats.escaneos_mes)} />
          <StatCard icon={PackageIcon} label="Volumen Total" value={formatStatNumber(stats.volumen_total, 1)} unit="dm³" />
          <StatCard icon={ScaleIcon} label="Peso Total" value={formatStatNumber(stats.peso_total, 1)} unit="kg" />
        </Box>

        {statsLoading && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, color: 'var(--muted-foreground)' }}>
            <CircularProgress size={18} />
            <Typography variant="body2">Actualizando estadísticas...</Typography>
          </Box>
        )}

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' },
            gap: 3,
          }}
        >
          <Paper sx={{ p: 3, borderRadius: 3, bgcolor: 'var(--card)' }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 4 }}>
              <Box>
                <Typography sx={{ fontSize: '1.05rem', fontWeight: 700 }}>Escaneos por Día</Typography>
                <Typography sx={{ fontSize: '0.85rem', color: 'var(--muted-foreground)' }}>Últimos 7 días</Typography>
              </Box>
              {stats.escaneos_semana > 0 && (
                <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--muted-foreground)' }}>
                  {stats.escaneos_semana} esta semana
                </Typography>
              )}
            </Box>

            <Box sx={{ height: 190, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 1.25 }}>
              {chartDataEstadisticas.map((data) => (
                <Box key={data.day} sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                  <Typography sx={{ fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>{data.scans}</Typography>
                  <Box
                    sx={{
                      width: '100%',
                      height: `${Math.max(8, (data.scans / maxScans) * 140)}px`,
                      bgcolor: 'rgba(91, 62, 163, 0.82)',
                      borderRadius: '7px 7px 0 0',
                      transition: 'height 220ms ease, background-color 220ms ease',
                      '&:hover': { bgcolor: 'var(--primary)' },
                    }}
                  />
                  <Typography sx={{ fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>{data.day}</Typography>
                </Box>
              ))}
            </Box>
          </Paper>

          <Paper sx={{ p: 3, borderRadius: 3, bgcolor: 'var(--card)' }}>
            <Box sx={{ mb: 4 }}>
              <Typography sx={{ fontSize: '1.05rem', fontWeight: 700 }}>Resumen de Actividad</Typography>
              <Typography sx={{ fontSize: '0.85rem', color: 'var(--muted-foreground)' }}>Métricas principales</Typography>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <ProgressMetric label="Utilización de escáneres" value={utilizacion} color="primary" />
              <ProgressMetric label="Imágenes 3D capturadas" value={imagenes3d} color="emerald" />
              <ProgressMetric label="Fotos de cámara" value={fotosCamara} color="amber" />
              <ProgressMetric label="Tasa de éxito" value={tasaExito} color="blue" />
            </Box>
          </Paper>
        </Box>

        <Paper sx={{ p: 3, borderRadius: 3, bgcolor: 'var(--card)' }}>
          <Box sx={{ mb: 3 }}>
            <Typography sx={{ fontSize: '1.05rem', fontWeight: 700 }}>Top Usuarios</Typography>
            <Typography sx={{ fontSize: '0.85rem', color: 'var(--muted-foreground)' }}>Mayor cantidad de escaneos este mes</Typography>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
            {topUsuariosEstadisticas.length === 0 && !statsLoading && (
              <Typography sx={{ fontSize: '0.85rem', color: 'var(--muted-foreground)' }}>
                No hay escaneos este mes para mostrar usuarios.
              </Typography>
            )}
            {topUsuariosEstadisticas.map((usuario, index) => (
              <Box
                key={usuario.name}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  p: 1.5,
                  borderRadius: 2,
                  bgcolor: 'rgba(255, 255, 255, 0.03)',
                  transition: 'background-color 160ms ease',
                  '&:hover': { bgcolor: 'rgba(91, 62, 163, 0.11)' },
                }}
              >
                <Box
                  sx={{
                    width: 34,
                    height: 34,
                    borderRadius: '50%',
                    bgcolor: 'rgba(91, 62, 163, 0.14)',
                    border: '1px solid rgba(91, 62, 163, 0.25)',
                    color: 'var(--primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                  }}
                >
                  {index + 1}
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography sx={{ fontSize: '0.9rem', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {usuario.name}
                  </Typography>
                  <Typography sx={{ fontSize: '0.78rem', color: 'var(--muted-foreground)' }}>{usuario.scans} escaneos</Typography>
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography sx={{ fontFamily: 'monospace', fontSize: '0.9rem', fontWeight: 700 }}>{formatStatNumber(usuario.volume, 1)}</Typography>
                  <Typography sx={{ fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>dm³</Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </Paper>
      </Box>
    );
  };

  // TAB ESCANEOS
  const renderEscaneosTab = () => (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5">ESCANEOS</Typography>
      </Box>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {/* Filtros */}
      <Box sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', gap: 2 }}>
        <TextField
          select
          label="Filtrar por sitio"
          value={filtroSitio}
          onChange={e => setFiltroSitio(e.target.value)}
          size="small"
          sx={{ minWidth: 180 }}
        >
          <MenuItem value="">Todos los sitios</MenuItem>
          {sitiosUnicos.map(sitio => (
            <MenuItem key={sitio} value={sitio}>{sitio}</MenuItem>
          ))}
        </TextField>
        <TextField
          select
          label="Filtrar por máquina"
          value={filtroMaquina}
          onChange={e => setFiltroMaquina(e.target.value)}
          size="small"
          sx={{ minWidth: 180 }}
        >
          <MenuItem value="">Todas las máquinas</MenuItem>
          {maquinasUnicas.map(maquina => (
            <MenuItem key={maquina} value={maquina}>{maquina}</MenuItem>
          ))}
        </TextField>
        <Chip
          label={`${cantidadRegistrosEscaneos} ${cantidadRegistrosEscaneos === 1 ? 'registro' : 'registros'}`}
          size="small"
          variant="outlined"
          sx={{ alignSelf: 'center', fontWeight: 600 }}
        />
        </Box>
        <Button 
          variant="contained" 
          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <RefreshIcon />} 
          onClick={() => fetchEscaneos(paginaActual)} 
          disabled={loading} 
          sx={{ 
            minWidth: 150,
            px: 3,
            py: 1.2,
            fontSize: '0.9rem',
            fontWeight: 600,
            borderRadius: 999,
            backgroundColor: '#5b3ea3',
            whiteSpace: 'nowrap',
            '&:hover': { backgroundColor: '#3D2A73' }
          }}
        >
          Actualizar
        </Button>
      </Box>
      {/* Búsqueda por SN */}
      <Paper sx={{ p: 2, mb: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
        <SearchIcon color="action" />
        <TextField fullWidth size="small" placeholder="Buscar por número de serie..." value={searchSN} onChange={(e) => setSearchSN(e.target.value)} variant="outlined"
          InputProps={{
            endAdornment: searchSN && <IconButton size="small" onClick={() => setSearchSN('')}><ClearIcon /></IconButton>
          }}
        />
      </Paper>
      {/* Tabla de escaneos */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>
      ) : (
        <TableContainer component={Paper} sx={{ mt: 2 }}>
          <Table sx={{ minWidth: 1485 }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontSize: '0.95rem', minWidth: 110, maxWidth: 150 }}>Serial</TableCell>
                <TableCell sx={{ fontSize: '0.95rem', minWidth: 90 }}>Usuario</TableCell>
                <TableCell sx={{ fontSize: '0.95rem', minWidth: 140 }}>Máquina</TableCell>
                <TableCell sx={{ fontSize: '0.95rem', minWidth: 140 }}>Sitio</TableCell>
                <TableCell sx={{ fontSize: '0.95rem', minWidth: 130 }}>Fecha</TableCell>
                <TableCell sx={{ fontSize: '0.95rem', minWidth: 85 }}>Ancho (cm)</TableCell>
                <TableCell sx={{ fontSize: '0.95rem', minWidth: 85 }}>Largo (cm)</TableCell>
                <TableCell sx={{ fontSize: '0.95rem', minWidth: 85 }}>Alto (cm)</TableCell>
                <TableCell sx={{ fontSize: '0.95rem', minWidth: 95 }}>Volumen (dm³)</TableCell>
                <TableCell sx={{ fontSize: '0.95rem', minWidth: 85 }}>Peso (kg)</TableCell>
                <TableCell sx={{ fontSize: '0.95rem', minWidth: 110 }}>Cantidad Bultos</TableCell>
                <TableCell sx={{ fontSize: '0.95rem', minWidth: 120 }}>Imágenes</TableCell>
                <TableCell sx={{ fontSize: '0.95rem', minWidth: 80 }}>Detalle</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {escaneosVisiblesParaTabla.map((escaneo) => {
                  return (
                    <TableRow key={escaneo.id} hover>
                      <TableCell sx={{ fontSize: '0.92rem', maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        <Tooltip title={escaneo.serial || ''} arrow>
                          <Typography variant="body2" sx={{ fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {escaneo.serial}
                          </Typography>
                        </Tooltip>
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.92rem' }}>{escaneo.usuario || escaneo.usuario_escaneo || escaneo.username || 'N/D'}</TableCell>
                      <TableCell sx={{ fontSize: '0.92rem' }}>{escaneo.machine_name || escaneo.maquina?.nombre || escaneo.maquina_modelo || 'N/D'}</TableCell>
                      <TableCell sx={{ fontSize: '0.92rem' }}>{escaneo.site_name || escaneo.sitio?.nombre || escaneo.site_name || 'N/D'}</TableCell>
                      <TableCell sx={{ fontSize: '0.85rem' }}>{formatDate(escaneo.fecha)}</TableCell>
                      <TableCell sx={{ fontSize: '0.92rem' }}>{escaneo.ancho}</TableCell>
                      <TableCell sx={{ fontSize: '0.92rem' }}>{escaneo.largo}</TableCell>
                      <TableCell sx={{ fontSize: '0.92rem' }}>{escaneo.alto || escaneo.altura}</TableCell>
                      <TableCell sx={{ fontSize: '0.92rem' }}>
                        <Chip label={formatVolumeSmart(escaneo.volumen)} size="small" color="secondary" variant="outlined" />
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.92rem' }}>{formatPesoKg(escaneo.peso ?? escaneo.peso_kg ?? escaneo.machine_peso)}</TableCell>
                      <TableCell sx={{ fontSize: '0.92rem', textAlign: 'center' }}>
                        {escaneo.cantidad_bultos ? escaneo.cantidad_bultos : '-'}
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.92rem' }}>
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap' }}>
                          {/* Imagen 3D */}
                          <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
                            {escaneo.tiene_imagen_3d ? (
                              <Tooltip title="Ver Imagen 3D">
                                <span>
                                  <IconButton 
                                    size="small" 
                                    onClick={() => handleViewImage(escaneo.id, '3d')} 
                                    disabled={loadingImages[`${escaneo.id}_3d`]} 
                                    sx={{ 
                                      color: '#5b3ea3',
                                      '&:hover': { backgroundColor: 'rgba(107, 44, 90, 0.1)' }
                                    }}
                                  >
                                    {loadingImages[`${escaneo.id}_3d`] ? <CircularProgress size={16} /> : <ImageIcon fontSize="small" />}
                                  </IconButton>
                                </span>
                              </Tooltip>
                            ) : (
                              <Tooltip title="Intentar cargar imagen 3D">
                                <span>
                                  <IconButton 
                                    size="small" 
                                    onClick={() => handleTryLoadImage(escaneo.id, '3d')} 
                                    sx={{ 
                                      color: '#999',
                                      '&:hover': { backgroundColor: 'rgba(153, 153, 153, 0.1)' }
                                    }}
                                  >
                                    <ImageIcon fontSize="small" />
                                  </IconButton>
                                </span>
                              </Tooltip>
                            )}
                          </Box>

                          {/* Imagen de Cámara */}
                          <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
                            {escaneo.tiene_imagen_camara ? (
                              <Tooltip title="Ver Foto de Cámara">
                                <span>
                                  <IconButton 
                                    size="small" 
                                    onClick={() => handleViewImage(escaneo.id, 'camara')} 
                                    disabled={loadingImages[`${escaneo.id}_camara`]} 
                                    sx={{ 
                                      color: '#07c7c3',
                                      '&:hover': { backgroundColor: 'rgba(7, 199, 195, 0.1)' }
                                    }}
                                  >
                                    {loadingImages[`${escaneo.id}_camara`] ? <CircularProgress size={16} /> : <CameraIcon fontSize="small" />}
                                  </IconButton>
                                </span>
                              </Tooltip>
                            ) : (
                              <Tooltip title="Intentar cargar imagen de cámara">
                                <span>
                                  <IconButton 
                                    size="small" 
                                    onClick={() => handleTryLoadImage(escaneo.id, 'camara')} 
                                    sx={{ 
                                      color: '#999',
                                      '&:hover': { backgroundColor: 'rgba(153, 153, 153, 0.1)' }
                                    }}
                                  >
                                    <CameraIcon fontSize="small" />
                                  </IconButton>
                                </span>
                              </Tooltip>
                            )}
                          </Box>

                        </Box>
                      </TableCell>
                      {/* Columna Detalle */}
                      <TableCell sx={{ fontSize: '0.92rem', textAlign: 'center' }}>
                        {/* Mostrar ícono + si tiene detalles de bultos, sino gris */}
                        {(() => {
                          const tieneMultiplesBultos = escaneo.cantidad_bultos && escaneo.cantidad_bultos > 1;
                          return tieneMultiplesBultos ? (
                            <Tooltip title="Ver detalles de bultos individuales">
                              <IconButton 
                                size="small" 
                                sx={{ color: '#5b3ea3' }} 
                                onClick={() => {
                                  handleViewDetalleBultos(escaneo);
                                }}
                              >
                                <AddIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          ) : (
                            <Tooltip title={`Sin detalles adicionales (${escaneo.cantidad_bultos || 1} bulto${(escaneo.cantidad_bultos || 1) > 1 ? 's' : ''})`}>
                              <IconButton size="small" disabled sx={{ color: '#ccc' }}>
                                <AddIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          );
                        })()}
                      </TableCell>
                      {/* Eliminar columna Acciones */}
                    </TableRow>
                  );
                })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      {/* Controles de paginación */}
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 2, gap: 2 }}>
        <Button
          variant="outlined"
          disabled={paginaActual === 1 || loading}
          onClick={() => { setPaginaActual(paginaActual - 1); fetchEscaneos(paginaActual - 1); }}
        >Anterior</Button>
        <Typography variant="body2" sx={{ mx: 2 }}>
          Página {paginaActual} de {totalPaginas}
        </Typography>
        <Button
          variant="outlined"
          disabled={paginaActual === totalPaginas || loading}
          onClick={() => { setPaginaActual(paginaActual + 1); fetchEscaneos(paginaActual + 1); }}
        >Siguiente</Button>
      </Box>
      <Dialog open={imageDialogOpen} onClose={() => setImageDialogOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle sx={{ background: 'linear-gradient(135deg, #5b3ea3 0%, #7B5BB8 100%)', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">{selectedImage?.tipo} - {selectedImage?.filename}</Typography>
          <IconButton onClick={() => setImageDialogOpen(false)} sx={{ color: 'white' }}><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 2, textAlign: 'center' }}>
          {selectedImage && (
            <img
              src={`data:image/jpeg;base64,${selectedImage.base64}`}
              alt={selectedImage.filename}
              style={{ maxWidth: '100%', maxHeight: '70vh', objectFit: 'contain', borderRadius: 8, boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)' }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de Detalles de Bultos */}
      <Dialog open={detalleBultosModalOpen} onClose={() => setDetalleBultosModalOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle sx={{ background: 'linear-gradient(135deg, #5b3ea3 0%, #7B5BB8 100%)', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Detalles de Bultos - {detalleBultosData?.serial}</Typography>
          <IconButton onClick={() => setDetalleBultosModalOpen(false)} sx={{ color: 'white' }}><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          {/* Estado de carga */}
          {detalleBultosLoading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
              <CircularProgress sx={{ mr: 2 }} />
              <Typography variant="body1">Cargando detalles de bultos...</Typography>
            </Box>
          )}

          {/* Mensaje de error */}
          {detalleBultosError && (
            <Alert severity="warning" sx={{ mb: 3 }}>
              <Typography variant="body2">
                <strong>Advertencia:</strong> {detalleBultosError}
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                Se mostrarán los datos básicos del escaneo, pero los detalles individuales de bultos no están disponibles.
              </Typography>
            </Alert>
          )}

          {/* Contenido principal */}
          {detalleBultosData && !detalleBultosLoading && (
            <>
              {/* Resumen del lote */}
              <Box sx={{ mb: 3, p: 2, bgcolor: '#f5f5f5', borderRadius: 2 }}>
                <Typography variant="h6" sx={{ mb: 1 }}>Resumen del Lote</Typography>
                <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                  <Chip label={`${detalleBultosData.total_bultos || detalleBultosData.cantidad_bultos || 1} bultos`} color="primary" />
                  <Chip label={`${detalleBultosData.total_grupos || 1} grupos diferentes`} color="info" />
                  <Chip label={`Volumen total: ${formatVolumeSmart(detalleBultosData.volumen_total || detalleBultosData.volumen)}`} color="secondary" />
                  <Chip label={`Peso total: ${formatPesoKg(detalleBultosData.peso_total || detalleBultosData.peso)}`} color="default" />
                </Box>
              </Box>

              {/* Tabla de grupos de bultos */}
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Grupo</TableCell>
                      <TableCell>Cantidad</TableCell>
                      <TableCell>Ancho (cm)</TableCell>
                      <TableCell>Largo (cm)</TableCell>
                      <TableCell>Alto (cm)</TableCell>
                      <TableCell>Volumen Unit. (dm³)</TableCell>
                      <TableCell>Peso Unit. (kg)</TableCell>
                      <TableCell>Volumen Total</TableCell>
                      <TableCell>Peso Total</TableCell>
                      <TableCell>Imagen</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {detalleBultosData.bultos_agrupados && detalleBultosData.bultos_agrupados.length > 0 ? (
                      detalleBultosData.bultos_agrupados.map((grupo, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <Chip label={`Grupo ${index + 1}`} size="small" color="primary" variant="outlined" />
                          </TableCell>
                          <TableCell>
                            <Chip label={`${grupo.cantidad_grupos} bultos`} size="small" color="secondary" />
                          </TableCell>
                          <TableCell>{formatDimensionCm(grupo.ancho)}</TableCell>
                          <TableCell>{formatDimensionCm(grupo.largo)}</TableCell>
                          <TableCell>{formatDimensionCm(grupo.alto)}</TableCell>
                          <TableCell>
                            <Chip 
                              label={formatVolumeSmart(
                                grupo.volumen || grupo.volumen_unitario || 
                                (grupo.ancho && grupo.largo && grupo.alto 
                                  ? (grupo.ancho * grupo.largo * grupo.alto / 1_000_000) // mm → dm³
                                  : 0)
                              )} 
                              size="small" 
                              color="secondary" 
                              variant="outlined" 
                            />
                          </TableCell>
                          <TableCell>{formatPesoKg(grupo.peso)}</TableCell>
                          <TableCell>
                            <Chip 
                              label={formatVolumeSmart(
                                grupo.volumen_total_grupo || grupo.volumen_total || 
                                ((grupo.volumen || grupo.volumen_unitario || (grupo.ancho * grupo.largo * grupo.alto / 1_000_000)) * grupo.cantidad_grupos)
                              )} 
                              size="small" 
                              color="info" 
                            />
                          </TableCell>
                          <TableCell><Chip label={formatPesoKg(grupo.peso_total_grupo)} size="small" color="warning" /></TableCell>
                          <TableCell>
                            {grupo.tiene_imagen_camara ? (
                              <Tooltip title="Ver imagen del bulto">
                                <IconButton 
                                  size="small" 
                                  onClick={() => {
                                    setSelectedImage({
                                      base64: grupo.imagen_camara,
                                      filename: grupo.imagen_camara_filename || `bulto_${index + 1}.jpg`,
                                      tipo: 'Imagen de Bulto',
                                      serial: detalleBultosData.serial
                                    });
                                    setImageDialogOpen(true);
                                  }}
                                  sx={{ color: '#07c7c3' }}
                                >
                                  <CameraIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            ) : (
                              <Tooltip title="Sin imagen">
                                <IconButton size="small" disabled sx={{ color: '#ccc' }}>
                                  <CameraIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={9} sx={{ textAlign: 'center', py: 3 }}>
                          <Typography variant="body2" color="text.secondary">
                            {detalleBultosError 
                              ? 'No se pudieron cargar los detalles de bultos agrupados'
                              : 'No hay detalles de bultos agrupados disponibles'
                            }
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );

  // RESTO DE TABS: En desarrollo
  const renderOtherTabs = () => {
    if (currentTab === 2) return <UserProfile />;
    if (currentTab === 3) return <Exportacion />;
    if (currentTab === 4) return <Reportes />;
    return <Typography sx={{p:3, textAlign: 'center'}}>Sección en desarrollo.</Typography>;
  };

  const renderTabContent = () => {
    if (currentTab === 0) return <MachinesSites />;
    if (currentTab === 1) return renderEscaneosTab();
    if (currentTab === 2) return <UserProfile />;
    if (currentTab === 3) return <Exportacion />;
    if (currentTab === 4) return <Reportes />;
    if (currentTab === 5) return renderEstadisticasTab();
    return renderOtherTabs();
  };

  return (
    <Box sx={{ flex: 1, minHeight: 0, height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <DashboardShell
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        user={user}
        onLogout={onLogout}
        isDemo={isDemoMode()}
        showRefresh={currentTab === 1 || currentTab === 5}
        onRefresh={() => {
          if (currentTab === 5) {
            fetchEstadisticas();
            return;
          }
          fetchEscaneos(paginaActual);
        }}
        colorMode={colorMode}
        onToggleColorMode={onToggleColorMode}
      >
        {renderTabContent()}
      </DashboardShell>

      {diagnosticData && (
        <WorkingImageDiagnosticModal
          open={diagnosticModalOpen}
          onClose={() => {
            setDiagnosticModalOpen(false);
            setDiagnosticData(null);
          }}
          scanId={diagnosticData.scanId}
          tipo={diagnosticData.tipo}
          serial={diagnosticData.serial}
        />
      )}
    </Box>
  );
};

// ========================================================================
// APP ROOT COMPONENT
// ========================================================================
function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('authToken'));
  const [colorMode, setColorMode] = useState(() => {
    const m = readStoredTheme();
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', m);
    }
    return m;
  });

  const theme = useMemo(() => createAppTheme(colorMode), [colorMode]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', colorMode);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, colorMode);
    } catch {
      /* ignore */
    }
  }, [colorMode]);

  const toggleColorMode = useCallback(() => {
    setColorMode((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  const handleLogin = async (usuario, password) => {
    const response = await api.login(usuario, password);
    localStorage.setItem('authToken', response.data.access_token);
    try {
      const { data } = await api.fetchCurrentUser();
      if (data) localStorage.setItem('userData', JSON.stringify(data));
    } catch {
      try {
        if (!localStorage.getItem('userData')) {
          localStorage.setItem(
            'userData',
            JSON.stringify({ nombre: usuario, email: usuario, rol: 'Usuario' }),
          );
        }
      } catch {
        /* ignore */
      }
    }
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    setIsLoggedIn(false);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: '100vh',
          bgcolor: 'var(--background)',
          ...(isLoggedIn && {
            height: '100vh',
            maxHeight: '100vh',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }),
        }}
      >
        {isLoggedIn ? (
          <Dashboard onLogout={handleLogout} colorMode={colorMode} onToggleColorMode={toggleColorMode} />
        ) : (
          <LoginForm onLogin={handleLogin} colorMode={colorMode} onToggleColorMode={toggleColorMode} />
        )}
      </Box>
    </ThemeProvider>
  );
}

// Agregar función utilitaria para formatear el peso
function formatPesoKg(peso) {
  let valor = Number(peso);
  if (isNaN(valor)) valor = 0;
  return valor.toFixed(1) + ' kg';
}

// Filtrar duplicados por número de serie (solo el más reciente)
function filtrarDuplicadosPorSerial(escaneos) {
  const map = {};
  escaneos.forEach(e => {
    const serial = e.serial;
    if (!serial) return;
    if (!map[serial] || new Date(e.fecha) > new Date(map[serial].fecha)) {
      map[serial] = e;
    }
  });
  return Object.values(map);
}

export default App;