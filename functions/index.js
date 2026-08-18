// index.js — Halfcon backend, single Cloud Function running Express.
import { onRequest } from 'firebase-functions/v2/https';
import express from 'express';
import cors from 'cors';

import { registerAuthRoutes } from './src/routes/auth.js';
import { registerServiceRoutes } from './src/routes/services.js';
import { registerArtisanRoutes } from './src/routes/artisans.js';
import { registerOrderRoutes } from './src/routes/orders.js';
import { registerPaymentRoutes } from './src/routes/payments.js';
import { registerMessageRoutes } from './src/routes/messages.js';

const app = express();

const configuredOrigins = (process.env.CORS_ORIGIN || 'https://www.halfcon.site,https://halfcon.site')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, server-to-server or same-origin)
      if (!origin) return callback(null, true);

      // Check configured exact origins
      if (configuredOrigins.includes(origin)) return callback(null, true);

      // Check localhost / 127.0.0.1 for local development
      if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
        return callback(null, true);
      }

      // Check Firebase Hosting domains (*.web.app, *.firebaseapp.com) and Halfcon domains (*.halfcon.site)
      if (/^https:\/\/([a-z0-9-]+\.)?(web\.app|firebaseapp\.com|halfcon\.site)$/i.test(origin)) {
        return callback(null, true);
      }

      // Default fallback
      callback(null, false);
    },
    credentials: true,
  })
);

app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ ok: true, service: 'halfcon-functions', time: new Date().toISOString() });
});

registerAuthRoutes(app);
registerServiceRoutes(app);
registerArtisanRoutes(app);
registerOrderRoutes(app);
registerPaymentRoutes(app);
registerMessageRoutes(app);

// Everything is exported as one function named "api" — Firebase Hosting (or
// your frontend's VITE_API_URL) routes all /api/* traffic to it.
export const api = onRequest({ region: 'us-central1' }, app);
