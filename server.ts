import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, '.data');
const DB_FILE = path.join(DATA_DIR, 'proloco_db.json');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function readDbFromDisk(): Record<string, unknown> | null {
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

function writeDbToDisk(data: Record<string, unknown>): void {
  try {
    ensureDataDir();
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Errore scrittura database su disco:', err);
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

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

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server Pro Loco avviato su http://0.0.0.0:${PORT}`);
  });
}

startServer();
