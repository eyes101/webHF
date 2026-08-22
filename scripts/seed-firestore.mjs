// scripts/seed-firestore.mjs
//
// Seed script for Halfcon services and verified artisans.
import admin from 'firebase-admin';

if (admin.apps.length === 0) {
  admin.initializeApp({ projectId: 'tigertrigger-c1e0a' });
}
const db = admin.firestore();

const services = [
  // 1. Electrical & Power Systems
  { category: 'Electrical & Power', name: 'Complete Home Electrical Rewiring', description: 'Certified full-structure cable inspection, load balancing, and rewiring with premium safety conduits.', price_cents: 18000000, unit: 'per project' },
  { category: 'Electrical & Power', name: 'Solar Inverter & Battery Installation', description: 'End-to-end solar panels, hybrid inverter, and lithium battery bank sizing, mounting, and calibration.', price_cents: 35000000, unit: 'per setup' },
  { category: 'Electrical & Power', name: 'Generator Automated Changeover Setup', description: 'ATS (Automatic Transfer Switch) installation and generator power integration for zero-downtime switching.', price_cents: 6500000, unit: 'per unit' },
  { category: 'Electrical & Power', name: 'Smart Home Lighting & Socket Fit-Out', description: 'Installation of automated dimmers, smart switches, safety breakers, and USB sockets.', price_cents: 4500000, unit: 'flat' },

  // 2. Plumbing & Water Infrastructure
  { category: 'Plumbing & Water', name: 'Comprehensive Leak Detection & Piping', description: 'Non-invasive acoustic and thermal pipe leak diagnosis, pressure testing, and emergency pipe repair.', price_cents: 5500000, unit: 'flat' },
  { category: 'Plumbing & Water', name: 'Borehole, Pump & Water Filtration Setup', description: 'Submersible pump installation, water treatment filtration system, and overhead tank plumbing.', price_cents: 28000000, unit: 'per project' },
  { category: 'Plumbing & Water', name: 'Bathroom Sanitary Ware & Heater Fitting', description: 'Expert installation of water heaters, shower systems, modern vanities, faucets, and WC suites.', price_cents: 8500000, unit: 'per bathroom' },
  { category: 'Plumbing & Water', name: 'Drainage & Sewage Line Maintenance', description: 'High-pressure drain jetting, soakaway clearing, and odor-trap servicing.', price_cents: 7000000, unit: 'flat' },

  // 3. Carpentry & Interior Fit-Out
  { category: 'Carpentry & Interiors', name: 'Custom Kitchen Cabinetry & Wardrobes', description: 'Bespoke moisture-resistant MDF/HDF modular cabinetry, soft-close hinges, and granite countertops.', price_cents: 45000000, unit: 'per project' },
  { category: 'Carpentry & Interiors', name: 'POP False Ceiling & Drywall Partitions', description: 'Designer plaster of Paris (POP) ceiling design with cove lighting slots and gypsum acoustic walls.', price_cents: 22000000, unit: 'per room' },
  { category: 'Carpentry & Interiors', name: 'Door Joinery & Security Lock Fitting', description: 'Hardwood security doors, reinforced frames, digital smart door locks, and architectural hardware.', price_cents: 9500000, unit: 'flat' },
  { category: 'Carpentry & Interiors', name: 'Floor Tiling & Wooden Decking', description: 'Precision porcelain, marble, or interlocking tile laying and outdoor treated wooden deck styling.', price_cents: 15000000, unit: 'per area' },

  // 4. Building Maintenance & Surface Repairs
  { category: 'Building Maintenance', name: 'Complete Exterior & Interior Painting', description: 'Surface preparation, moisture-seal primer, crack filling, and premium weather-shield emulsion coats.', price_cents: 32000000, unit: 'per building' },
  { category: 'Building Maintenance', name: 'Roof Waterproofing & Storm Leak Repair', description: 'Bituminous membrane waterproofing, gutter realignment, and roof sheet leak sealing.', price_cents: 16000000, unit: 'per roof' },
  { category: 'Building Maintenance', name: 'Tile Re-Grouting & Surface Patching', description: 'Precision porcelain tile re-grouting, marble polish restoration, and surface crack sealing.', price_cents: 12000000, unit: 'flat' },
  { category: 'Building Maintenance', name: 'Wall Plastering, Screeding & Damp Proofing', description: 'Damp-proof wall plastering, smooth putty screeding, and protective moisture seal.', price_cents: 18000000, unit: 'per project' },

  // 5. Logistics & Special Duties
  { category: 'Logistics Service', name: 'Inter-State Logistics Coordination', description: 'Coordinated freight movement and scheduled haulage between major Nigerian state capitals.', price_cents: 6000000, unit: 'flat' },
  { category: 'Logistics Service', name: 'Local Freight & Express Dispatch', description: 'Same-day city express dispatch and cargo transportation.', price_cents: 150000, unit: 'per km' },
  { category: 'Special Duties', name: 'Special Operations Duty Assignment', description: 'Vetted personnel and field logistics deployment for high-priority operational tasks.', price_cents: 2000000, unit: 'hourly' },
];

const artisans = [
  { name: 'Emeka Obi', trade: 'Electrician', services_offered: ['Complete Rewiring', 'Solar Inverter Setup', 'Generator Automation', 'Circuit Diagnostics'], phone: '+234 803 000 0001' },
  { name: 'Bisi Adewale', trade: 'Plumber', services_offered: ['Leak Detection', 'Water Heater Setup', 'Water Treatment', 'Bathroom Fitting'], phone: '+234 803 000 0002' },
  { name: 'Tunde Bakare', trade: 'Carpenter', services_offered: ['Kitchen Cabinets', 'Wardrobes', 'POP Ceilings', 'Security Door Fitting'], phone: '+234 803 000 0003' },
  { name: 'Grace Nnamdi', trade: 'Painter & Decorator', services_offered: ['Interior Emulsion', 'Weather-Shield Exterior', 'Wall Screeding', 'Waterproofing'], phone: '+234 803 000 0004' },
  { name: 'Ibrahim Musa', trade: 'Mason & Builder', services_offered: ['Blockwork', 'Tiling & Marble', 'POP Ceilings', 'Plastering'], phone: '+234 803 000 0005' },
  { name: 'Chika Eze', trade: 'HVAC Technician', services_offered: ['AC Installation', 'Inverter AC Servicing', 'Duct Maintenance'], phone: '+234 803 000 0006' },
];

function slugify(text) {
  return text.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

async function seedServices() {
  const col = db.collection('services');
  let inserted = 0;
  for (const s of services) {
    const existing = await col.where('name', '==', s.name).limit(1).get();
    if (!existing.empty) continue;
    const ref = col.doc();
    const slug = `${slugify(s.name)}-${ref.id.slice(0, 6)}`;
    await ref.set({ ...s, slug, currency: 'NGN', active: true, created_at: admin.firestore.FieldValue.serverTimestamp() });
    inserted++;
  }
  console.log(`Services: inserted ${inserted}, skipped ${services.length - inserted} (already existed).`);
}

async function seedArtisans() {
  const col = db.collection('artisans');
  let inserted = 0;
  for (const a of artisans) {
    const existing = await col.where('name', '==', a.name).limit(1).get();
    if (!existing.empty) continue;
    await col.add({ ...a, bio: null, active: true, created_at: admin.firestore.FieldValue.serverTimestamp() });
    inserted++;
  }
  console.log(`Artisans: inserted ${inserted}, skipped ${artisans.length - inserted} (already existed).`);
}

async function seedAdmin() {
  const email = 'admin@halfcon.it.com';
  const col = db.collection('users');
  const existing = await col.where('email', '==', email).limit(1).get();
  if (!existing.empty) {
    console.log('Admin placeholder already exists, skipping.');
    return;
  }
  await col.add({ name: 'Halfcon Admin', email, role: 'admin', created_at: admin.firestore.FieldValue.serverTimestamp() });
  console.log(`Reserved admin role for ${email}.`);
}

await seedServices();
await seedArtisans();
await seedAdmin();
console.log('Seed complete.');
process.exit(0);
