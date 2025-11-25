import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 10000;

// Servir archivos estáticos desde la carpeta dist
app.use(express.static(join(__dirname, 'dist')));

// Para todas las rutas, servir index.html (necesario para React Router)
app.get('*', (req, res) => {
  try {
    res.sendFile(join(__dirname, 'dist', 'index.html'));
  } catch (error) {
    res.status(500).send('Error al cargar la aplicación');
  }
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});

