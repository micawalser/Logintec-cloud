import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 10000;

// Servir archivos estáticos desde la carpeta dist (JS/CSS con MIME correcto)
app.use(express.static(join(__dirname, 'dist'), { index: false }));

// SPA: solo rutas sin extensión (evita devolver HTML para /assets/*.js)
app.get('*', (req, res, next) => {
  if (req.path.includes('.')) return next();
  res.sendFile(join(__dirname, 'dist', 'index.html'), (err) => {
    if (err) res.status(500).send('Error al cargar la aplicación');
  });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});

