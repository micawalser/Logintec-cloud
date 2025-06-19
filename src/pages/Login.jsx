import { Box, TextField, Button, Paper, Typography, Alert, CircularProgress } from '@mui/material';
import { useState } from 'react';
import ApiService from '../apiService'; // Asegúrate que la ruta sea correcta

function LoginComponent({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Por favor ingresa email y contraseña');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const userData = await ApiService.login(email, password);
      if (userData) {
        onLoginSuccess(userData); // Notificamos al componente App
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Error de conexión.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleLogin();
    }
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      <Paper sx={{ padding: 4, width: 400, maxWidth: '90%' }}>
        <Typography variant="h4" align="center" gutterBottom>Logintec</Typography>
        <Typography variant="subtitle1" align="center" color="textSecondary" sx={{ mb: 3 }}>Sistema de Medición Cloud</Typography>
        
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        
        <TextField fullWidth label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} onKeyPress={handleKeyPress} margin="normal" disabled={loading} />
        <TextField fullWidth label="Contraseña" type="password" value={password} onChange={(e) => setPassword(e.target.value)} onKeyPress={handleKeyPress} margin="normal" disabled={loading} />
        
        <Button fullWidth variant="contained" onClick={handleLogin} disabled={loading} sx={{ mt: 3, mb: 2, height: 48, fontSize: '16px' }}>
          {loading ? <CircularProgress size={24} color="inherit" /> : 'Iniciar Sesión'}
        </Button>
      </Paper>
    </Box>
  );
}

export default LoginComponent;
