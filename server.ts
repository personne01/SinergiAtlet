import path from 'path';
import express from 'express';
import { createServer as createViteServer } from 'vite';
import app from './server/app';

const PORT = Number(process.env.PORT) || 3000;

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    console.log('[SinergiAtlet] Running in development mode with Vite middleware');
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    console.log('[SinergiAtlet] Running in production mode serving static assets');
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[SinergiAtlet] Server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[SinergiAtlet] Error starting server:', err);
  process.exit(1);
});
