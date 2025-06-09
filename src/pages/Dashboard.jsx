import { AppBar, Toolbar, Typography, Container, Box } from '@mui/material';

function Dashboard() {
  return (
    <Box>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6">
            Logintec - Dashboard
          </Typography>
        </Toolbar>
      </AppBar>
      
      <Container sx={{ mt: 4 }}>
        <Typography variant="h4">
          ¡Bienvenido al Dashboard!
        </Typography>
        <Typography>
          Aquí verás las máquinas, medidas, usuarios, etc.
        </Typography>
      </Container>
    </Box>
  );
}

export default Dashboard;