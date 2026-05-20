import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const distDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'dist');
const indexPath = path.join(distDir, 'index.html');

if (!fs.existsSync(indexPath)) {
  console.error('No se encontró dist/index.html. Ejecutá npm run build primero.');
  process.exit(1);
}

fs.copyFileSync(indexPath, path.join(distDir, '404.html'));
console.log('✓ 404.html generado para GitHub Pages');
