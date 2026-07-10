// server.js — Halfcon backend entry point
import { createApp } from './mini-express.js';
import { registerAuthRoutes } from './routes/auth.js';
import { registerServiceRoutes } from './routes/services.js';
import { registerOrderRoutes } from './routes/orders.js';
import { registerPaymentRoutes } from './routes/payments.js';
import { registerMessageRoutes } from './routes/messages.js';
import './config/db.js'; // ensures schema is created on boot

const PORT = process.env.PORT || 3000;
const app = createApp();

// Health check
app.get('/api/health', (req, res) => {
  res.json({ ok: true, service: 'halfcon-backend', time: new Date().toISOString() });
});

registerAuthRoutes(app);
registerServiceRoutes(app);
registerOrderRoutes(app);
registerPaymentRoutes(app);
registerMessageRoutes(app);

app.listen(PORT, () => {
  console.log(`Halfcon backend running on http://localhost:${PORT}`);
  console.log(`Payment provider mode: ${process.env.PAYMENT_PROVIDER || 'manual (test mode)'}`);
  console.log(`Google sign-in: ${process.env.GOOGLE_CLIENT_ID ? 'configured' : 'NOT configured (set GOOGLE_CLIENT_ID to enable)'}`);
});
