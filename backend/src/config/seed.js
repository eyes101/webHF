// seed.js — populates initial Halfcon services + a default staff/admin login.
// Run with: npm run seed
import { db } from './db.js';
import { hashPassword, newId } from '../middleware/auth-crypto.js';

function slugify(text) {
  return text.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

const SERVICES = [
  // category, name, description, price in NGN naira, unit
  ['Special Duties', 'General Special Duty Assignment', 'On-demand specialised duty staffing for short-term or urgent assignments.', 15000, 'hourly'],
  ['Special Duties', 'Event Security & Support Duty', 'Dedicated personnel for event coverage, access control, and on-site support.', 20000, 'hourly'],

  ['Home Development', 'Residential Renovation Consultation', 'On-site assessment and renovation plan for a residential property.', 75000, 'flat'],
  ['Home Development', 'Home Interior Fit-Out', 'Full interior development — flooring, fixtures, finishing — per project scope.', 2500000, 'flat'],
  ['Home Development', 'Landscaping & Exterior Development', 'Outdoor space planning and development for residential properties.', 900000, 'flat'],

  ['Office Development', 'Office Space Fit-Out', 'End-to-end office interior build-out including partitions, electrical, and furnishing.', 4000000, 'flat'],
  ['Office Development', 'Office Renovation Consultation', 'On-site assessment and renovation plan for a commercial office space.', 100000, 'flat'],

  ['Innovation and Relocation', 'Business Relocation Planning', 'Full relocation strategy — timeline, logistics coordination, and site handover.', 600000, 'flat'],
  ['Innovation and Relocation', 'Process Innovation Consultation', 'Workflow and operations review with recommendations for modernisation.', 300000, 'flat'],

  ['Logistics Service', 'Local Freight & Delivery', 'Point-to-point freight transport within city limits.', 1500, 'per_km'],
  ['Logistics Service', 'Warehousing & Storage', 'Secure short or long-term storage for goods and equipment.', 1000, 'per_sqm'],
  ['Logistics Service', 'Inter-State Logistics Coordination', 'Coordinated multi-leg transport across state/regional lines.', 60000, 'flat'],
];

console.log('Seeding services...');
const insertService = db.prepare(`
  INSERT INTO services (id, category, name, slug, description, price_cents, currency, unit)
  VALUES (?, ?, ?, ?, ?, ?, 'NGN', ?)
`);

let count = 0;
for (const [category, name, description, priceUsd, unit] of SERVICES) {
  const existing = db.prepare('SELECT id FROM services WHERE name = ? AND category = ?').get(name, category);
  if (existing) continue;
  const id = newId();
  const slug = slugify(name) + '-' + id.slice(0, 6);
  insertService.run(id, category, name, slug, description, Math.round(priceUsd * 100), unit);
  count++;
}
console.log(`Inserted ${count} services (skipped duplicates).`);

console.log('Seeding default staff account...');
const staffEmail = 'admin@halfcon.it.com';
const existingStaff = db.prepare('SELECT id FROM users WHERE email = ?').get(staffEmail);
if (!existingStaff) {
  const { hash, salt } = hashPassword('ChangeThisPassword123!');
  db.prepare(`INSERT INTO users (id, name, email, password_hash, password_salt, role)
              VALUES (?, 'Halfcon Admin', ?, ?, ?, 'admin')`)
    .run(newId(), staffEmail, hash, salt);
  console.log(`Created admin account: ${staffEmail} / ChangeThisPassword123!  (CHANGE THIS PASSWORD IMMEDIATELY)`);
} else {
  console.log('Admin account already exists, skipping.');
}

console.log('Seed complete.');
