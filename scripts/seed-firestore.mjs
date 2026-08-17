// scripts/seed-firestore.mjs
//
// One-time (or re-runnable — it skips existing entries by name) seed script
// for services and artisans. Run this AFTER `firebase deploy` and AFTER
// you've authenticated locally, since it uses Application Default
// Credentials to talk to your live Firestore:
//
//   npm install firebase-admin   (in this scripts/ folder, or reuse functions/node_modules)
//   gcloud auth application-default login   (if you haven't already)
//   node scripts/seed-firestore.mjs
//
// Safe to re-run — it checks for an existing doc with the same name/slug
// before inserting, so it won't create duplicates.
import admin from 'firebase-admin';

admin.initializeApp({ projectId: 'tigertrigger-c1e0a' });
const db = admin.firestore();

const services = [
  { category: 'Home Development', name: 'Home Interior Fit-Out', description: 'Full interior development — flooring, fixtures, finishing — per project scope.', price_cents: 250000000, unit: 'flat' },
  { category: 'Home Development', name: 'Landscaping & Exterior Development', description: 'Garden design, paving, exterior finishing for residential properties.', price_cents: 90000000, unit: 'flat' },
  { category: 'Home Development', name: 'Residential Renovation Consultation', description: 'On-site assessment and renovation planning for homeowners.', price_cents: 7500000, unit: 'flat' },
  { category: 'Innovation and Relocation', name: 'Business Relocation Planning', description: 'End-to-end planning for relocating office or business operations.', price_cents: 60000000, unit: 'flat' },
  { category: 'Innovation and Relocation', name: 'Process Innovation Consultation', description: 'Workflow and operations review for growing businesses.', price_cents: 30000000, unit: 'flat' },
  { category: 'Logistics Service', name: 'Inter-State Logistics Coordination', description: 'Coordinated freight movement between states.', price_cents: 6000000, unit: 'flat' },
  { category: 'Logistics Service', name: 'Local Freight & Delivery', description: 'Same-city freight and delivery service.', price_cents: 150000, unit: 'per_km' },
  { category: 'Logistics Service', name: 'Warehousing & Storage', description: 'Secure short and long-term storage space.', price_cents: 100000, unit: 'per_sqm' },
  { category: 'Office Development', name: 'Office Renovation Consultation', description: 'On-site assessment and renovation planning for office spaces.', price_cents: 10000000, unit: 'flat' },
  { category: 'Office Development', name: 'Office Space Fit-Out', description: 'Full office interior build-out — partitions, wiring, furnishing.', price_cents: 400000000, unit: 'flat' },
  { category: 'Special Duties', name: 'Event Security & Support Duty', description: 'Vetted personnel for event security and logistics support.', price_cents: 2000000, unit: 'hourly' },
  { category: 'Special Duties', name: 'General Special Duty Assignment', description: 'Custom-scoped special duty personnel for one-off assignments.', price_cents: 1500000, unit: 'hourly' },
];

const artisans = [
  { name: 'Emeka Obi', trade: 'Electrician', services_offered: ['Wiring', 'Socket repair', 'Generator installation', 'Inverter setup'], phone: '+234 803 000 0001' },
  { name: 'Bisi Adewale', trade: 'Plumber', services_offered: ['Pipe repair', 'Bathroom fitting', 'Water heater installation'], phone: '+234 803 000 0002' },
  { name: 'Tunde Bakare', trade: 'Carpenter', services_offered: ['Custom furniture', 'Door & window frames', 'Cabinet installation'], phone: '+234 803 000 0003' },
  { name: 'Grace Nnamdi', trade: 'Painter', services_offered: ['Interior painting', 'Exterior painting', 'Wall texturing'], phone: '+234 803 000 0004' },
  { name: 'Ibrahim Musa', trade: 'Mason', services_offered: ['Blockwork', 'Tiling', 'Plastering', 'POP ceiling'], phone: '+234 803 000 0005' },
  { name: 'Chika Eze', trade: 'AC Technician', services_offered: ['AC installation', 'AC servicing', 'Refrigeration repair'], phone: '+234 803 000 0006' },
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
  console.log(`Reserved admin role for ${email} — create a Firebase Auth user with this exact email to activate it.`);
}

await seedServices();
await seedArtisans();
await seedAdmin();
console.log('Seed complete.');
process.exit(0);
