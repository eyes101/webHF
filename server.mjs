// server.mjs — Standalone server for Google Cloud Run container deployments
import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

import { registerAuthRoutes } from './functions/src/routes/auth.js';
import { registerServiceRoutes } from './functions/src/routes/services.js';
import { registerArtisanRoutes } from './functions/src/routes/artisans.js';
import { registerOrderRoutes } from './functions/src/routes/orders.js';
import { registerPaymentRoutes } from './functions/src/routes/payments.js';
import { registerMessageRoutes } from './functions/src/routes/messages.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// Health check endpoint for Google Cloud Run and Load Balancers
app.get('/api/health', (req, res) => {
  res.json({ ok: true, service: 'halfcon-cloudrun', time: new Date().toISOString() });
});

// Register all API routes
registerAuthRoutes(app);
registerServiceRoutes(app);
registerArtisanRoutes(app);
registerOrderRoutes(app);
registerPaymentRoutes(app);
registerMessageRoutes(app);

// Serve frontend static files if built
const distPath = path.join(__dirname, 'frontend', 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));

  app.get('*', (req, res) => {
    // Only serve index.html for non-API routes
    if (req.path.startsWith('/api')) {
      return res.status(404).json({ error: 'Endpoint not found' });
    }
    res.sendFile(path.join(distPath, 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.send('Halfcon API is running. Build the frontend to view the UI.');
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Halfcon Cloud Run server listening on port ${PORT}`);
});
