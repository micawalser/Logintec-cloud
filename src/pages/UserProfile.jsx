import React, { useState, useEffect } from "react";
import { Paper, Typography, TextField, Button, Alert, Box, Divider, Avatar } from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import ApiService from '../apiService';

const MIN_PASSWORD_LENGTH = 8;

function normalizeUser(raw) {
  if (!raw || typeof raw !== 'object') return {};
  return {
    ...raw,
    nombre: raw.nombre || raw.full_name || raw.name || raw.username || raw.usuario || '',
    email: raw.email || raw.correo || raw.mail || '',
  };
}

const UserProfile = () => {
  const [user, setUser] = useState({});
  const [profileLoading, setProfileLoading] = useState(true);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("error");

  useEffect(() => {
    let cancelled = false;

    try {
      const userData = JSON.parse(localStorage.getItem("userData") || "null");
      if (userData) setUser(normalizeUser(userData));
    } catch {
      /* ignore */
    }

    ApiService.getCurrentUser()
      .then((userData) => {
        if (cancelled || !userData) return;
        const normalized = normalizeUser(userData);
        setUser(normalized);
        localStorage.setItem("userData", JSON.stringify(normalized));
      })
      .catch(() => {
        if (!cancelled) {
          setMessageType("warning");
          setMessage("No se pudieron cargar los datos del perfil. Verificá que la sesión siga activa.");
        }
      })
      .finally(() => {
        if (!cancelled) setProfileLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setMessage("");

    if (newPassword !== confirmPassword) {
      setMessageType("error");
      setMessage("Las contraseñas nuevas no coinciden.");
      return;
    }
    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      setMessageType("error");
      setMessage(`La nueva contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.`);
      return;
    }

    setPasswordLoading(true);
    try {
      await ApiService.changePassword(currentPassword, newPassword);
      setMessageType("success");
      setMessage("Contraseña actualizada correctamente.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      const status = error?.response?.status;
      const detail = error?.response?.data?.detail;

      if (status === 404) {
        setMessageType("warning");
        setMessage(
          "El servidor aún no tiene habilitado el cambio de contraseña. Hay que agregar el endpoint POST /api/cloud/change-password en el backend (aghbackend).",
        );
      } else if (status === 400 || status === 401) {
        setMessageType("error");
        setMessage(
          typeof detail === 'string'
            ? detail
            : 'La contraseña actual es incorrecta.',
        );
      } else if (status === 422) {
        setMessageType("error");
        setMessage('Datos inválidos. Revisá los campos e intentá de nuevo.');
      } else {
        setMessageType("error");
        setMessage('No se pudo cambiar la contraseña. Intentá más tarde.');
      }
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', minHeight: '60vh', background: 'transparent' }}>
      <Paper elevation={4} sx={{ p: 4, width: 400, borderRadius: 4 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
          <Avatar sx={{ bgcolor: 'primary.main', width: 64, height: 64, mb: 1 }}>
            <LockIcon fontSize="large" />
          </Avatar>
          <Typography variant="h5" fontWeight={600} gutterBottom>Perfil de Usuario</Typography>
        </Box>
        <Divider sx={{ mb: 2 }} />
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" color="text.secondary">Nombre</Typography>
          <Typography variant="body1" sx={{ mb: 1 }}>
            {profileLoading ? 'Cargando...' : (user.nombre || '—')}
          </Typography>
          <Typography variant="subtitle2" color="text.secondary">Email</Typography>
          <Typography variant="body1">
            {profileLoading ? 'Cargando...' : (user.email || '—')}
          </Typography>
        </Box>
        <Divider sx={{ my: 2 }} />
        <Typography variant="h6" fontWeight={500} sx={{ mb: 2 }}>Cambiar contraseña</Typography>
        <Box component="form" onSubmit={handleChangePassword}>
          <TextField
            label="Contraseña actual"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            fullWidth
            required
            margin="normal"
            autoComplete="current-password"
          />
          <TextField
            label="Nueva contraseña"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            fullWidth
            required
            margin="normal"
            autoComplete="new-password"
          />
          <TextField
            label="Confirmar nueva contraseña"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            fullWidth
            required
            margin="normal"
            autoComplete="new-password"
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            disabled={passwordLoading || profileLoading}
            sx={{ mt: 2, py: 1.2, fontWeight: 600 }}
          >
            {passwordLoading ? 'Guardando...' : 'Cambiar contraseña'}
          </Button>
        </Box>
        {message && (
          <Alert severity={messageType} sx={{ mt: 2 }}>{message}</Alert>
        )}
      </Paper>
    </Box>
  );
};

export default UserProfile;