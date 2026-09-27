import express from 'express';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let DATA_DIR = path.join(__dirname, '.data');
let DB_FILE = path.join(DATA_DIR, 'proloco_db.json');

function ensureDataDir() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  } catch {
    DATA_DIR = path.join(os.tmpdir(), 'proloco_data');
    DB_FILE = path.join(DATA_DIR, 'proloco_db.json');
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }
}

function readDbFromDisk() {
  try {
    ensureDataDir();
    if (!fs.existsSync(DB_FILE)) {
      return null;
    }
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Errore lettura database su disco:', err);
    return null;
  }
}

function writeDbToDisk(data) {
  try {
    ensureDataDir();
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Errore scrittura database su disco:', err);
  }
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: '25mb' }));

  // API: Leggi intero stato del database sincronizzato
  app.get('/api/db', (_req, res) => {
    const db = readDbFromDisk();
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.json({ ok: true, db });
  });

  // API: Salva / aggiorna stato del database (parziale o completo)
  app.post('/api/db', (req, res) => {
    const incoming = req.body || {};
    const existing = readDbFromDisk() || {};
    const merged = {
      ...existing,
      ...incoming,
      updatedAt: Date.now()
    };
    writeDbToDisk(merged);
    res.json({ ok: true, updatedAt: merged.updatedAt });
  });

  // API: Azzera completamente il database sul server
  app.post('/api/db/reset', (req, res) => {
    const incoming = req.body || {};
    const resetState = {
      azzerato: true,
      soci: [],
      eventi: [],
      donazioni: [],
      campagne: [],
      cestino: [],
      comunicazioni: [],
      archivioGiornalini: [],
      giornalinoAttivoId: '',
      ...(incoming.config ? { config: incoming.config } : {}),
      ...(incoming.sitoConfig ? { sitoConfig: incoming.sitoConfig } : {}),
      ...(incoming.giornalinoConfig ? { giornalinoConfig: incoming.giornalinoConfig } : {}),
      updatedAt: Date.now()
    };
    writeDbToDisk(resetState);
    res.json({ ok: true, db: resetState });
  });

  const distPath = path.join(__dirname, 'dist');
  const hasBuiltDist = fs.existsSync(path.join(distPath, 'index.html'));
  const isProduction =
    process.env.NODE_ENV === 'production' ||
    (process.env.NODE_ENV !== 'development' && hasBuiltDist);

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(distPath, { index: false }));
    app.get('*', (_req, res) => {
      res.setHeader('Cache-Control', 'no-cache');
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server Pro Loco avviato su http://0.0.0.0:${PORT} (${isProduction ? 'production' : 'development'})`);
  });
}

startServer();
