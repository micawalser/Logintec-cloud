import React, { useState, useEffect } from "react";
import { Paper, Typography, TextField, Button, Alert, Box, Divider, Avatar } from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import ApiService from '../apiService';

const UserProfile = () => {
  const [user, setUser] = useState({});
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("error");

  useEffect(() => {
    let cancelled = false;

    try {
      const userData = JSON.parse(localStorage.getItem("userData") || "null");
      if (userData) setUser(userData);
    } catch {
      /* ignore */
    }

    ApiService.getCurrentUser()
      .then((userData) => {
        if (cancelled || !userData) return;
        setUser(userData);
        localStorage.setItem("userData", JSON.stringify(userData));
      })
      .catch(() => {
        if (!cancelled) {
          setMessageType("warning");
          setMessage("No se pudieron actualizar los datos del perfil.");
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMessageType("error");
      setMessage("Las contraseñas no coinciden");
      return;
    }
    setMessageType("warning");
    setMessage("El cambio de contraseña todavía no está conectado al backend.");
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
          <Typography variant="body1" sx={{ mb: 1 }}>{user.nombre || "-"}</Typography>
          <Typography variant="subtitle2" color="text.secondary">Email</Typography>
          <Typography variant="body1">{user.email || "-"}</Typography>
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
          <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2, py: 1.2, fontWeight: 600 }}>
            Cambiar contraseña
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