// index.js — Halfcon backend, now a single Cloud Function running Express.
//
// Note on webhook raw body: Cloud Functions' HTTP trigger automatically
// captures the raw request body as `req.rawBody` before Express's JSON
// parser touches it — that's exactly what the Paystack webhook's HMAC
// signature check needs, no extra middleware required (unlike a plain
// Express app, where you'd have to set that up yourself).
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

const allowedOrigins = (process.env.CORS_ORIGIN || 'https://www.halfcon.site,https://halfcon.site')
  .split(',')
  .map((s) => s.trim());

app.use(cors({ origin: allowedOrigins, credentials: true }));
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
