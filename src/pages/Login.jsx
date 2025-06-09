import { Box, TextField, Button, Paper, Typography } from '@mui/material';
import { useState } from 'react';

function App() {
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogin = () => {
    if (usuario && password) {
      setIsLoggedIn(true);
    } else {
      alert('Por favor ingresa usuario y contraseña');
    }
  };

  if (isLoggedIn) {
    return (
      <div style={{ padding: '20px' }}>
        <Typography variant="h4">Dashboard - Próximamente el menú</Typography>
        <Button 
          variant="outlined" 
          onClick={() => setIsLoggedIn(false)}
          style={{ marginTop: '20px' }}
        >
          Salir
        </Button>
      </div>
    );
  }

  return (
    <Box sx={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh',
      backgroundColor: '#f5f5f5'
    }}>
      <Paper sx={{ padding: 4, width: 350 }}>
        <Typography variant="h4" align="center" gutterBottom>
          Logintec
        </Typography>
        
        <TextField
          fullWidth
          label="Usuario"
          value={usuario}
          onChange={(e) => setUsuario(e.target.value)}
          margin="normal"
        />
        
        <TextField
          fullWidth
          label="Contraseña"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          margin="normal"
        />
        
        <Button
          fullWidth
          variant="contained"
          onClick={handleLogin}
          sx={{ mt: 2 }}
        >
          Ingresar
        </Button>
      </Paper>
    </Box>
  );
}

export default App;