// pages/PolicyPages.jsx — Shipping, Returns & Terms pages.
// NOTE FOR THE BUSINESS OWNER: the time windows and fee wording in these
// drafts (e.g. the 7-day defect window) are sensible defaults written to
// replace the old behaviour of sending customers to the FAQ page.
// Please review and adjust any figure that does not match how Halfcon
// actually operates before relying on them.
import React from 'react';
import { Link } from 'react-router-dom';
import { CONTACTS, whatsappLink } from '../config/contacts';

function PolicyLayout({ title, intro, children }) {
  return (
    <div className="wrap" style={{ padding: '56px 24px 80px', maxWidth: '820px', margin: '0 auto' }}>
      <p style={{ fontSize: '13px', marginBottom: '10px' }}>
        <Link to="/">Home</Link> <span style={{ color: 'var(--steel)' }}>/</span> <strong>{title}</strong>
      </p>
      <h1 style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontSize: '38px', fontWeight: 900, textTransform: 'uppercase', marginBottom: '10px' }}>
        {title}
      </h1>
      <p style={{ color: 'var(--steel)', lineHeight: 1.65, marginBottom: '28px' }}>{intro}</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '26px' }}>{children}</div>
      <div style={{ marginTop: '36px', background: 'var(--paper-dim)', borderRadius: 'var(--radius-md)', padding: '16px', fontSize: '14px', lineHeight: 1.6 }}>
        Questions about this policy? Email <strong>{CONTACTS.email}</strong> or message us on WhatsApp at{' '}
        <a href={whatsappLink('Hi Halfcon, I have a question about your policies.')} target="_blank" rel="noopener noreferrer" style={{ fontWeight: 700 }}>
          {CONTACTS.whatsappDisplay}
        </a>.
      </div>
    </div>
  );
}

function Section({ heading, children }) {
  return (
    <section>
      <h2 style={{ fontSize: '19px', fontWeight: 800, marginBottom: '8px' }}>{heading}</h2>
      <div style={{ fontSize: '14.5px', lineHeight: 1.7, color: 'var(--ink)' }}>{children}</div>
    </section>
  );
}

export function ShippingPolicyPage() {
  return (
    <PolicyLayout
      title="Shipping & Delivery Policy"
      intro="How products reach you, how service visits are scheduled, and where you can pick up in person."
    >
      <Section heading="Where we deliver">
        <p>We currently deliver products and carry out services within Lagos. For orders outside Lagos, please contact us on WhatsApp before ordering so we can confirm whether we can serve your location and what it would cost.</p>
      </Section>
      <Section heading="Delivery fees and timing">
        <p>Delivery fees depend on the size of the item and your location, and are confirmed with you before dispatch — you will never be charged a delivery fee you have not agreed to. Once your order is confirmed, our team will contact you to agree a delivery window. You can follow your order's progress any time on the <Link to="/track">Track Order</Link> page.</p>
      </Section>
      <Section heading="Service appointments">
        <p>Maintenance and installation services are carried out at the address and time agreed at checkout. If we need to reschedule, we will contact you as early as possible by phone or WhatsApp. Please make sure someone is available to give our team access at the agreed time.</p>
      </Section>
      <Section heading="Pickup from our outlets (free)">
        <p>You can collect products in person, free of charge, from either outlet, Monday to Saturday, 8:00 AM – 6:00 PM:</p>
        <ul style={{ paddingLeft: '20px', marginTop: '6px' }}>
          <li><strong>Ikorodu:</strong> {CONTACTS.addressIkorodu}</li>
          <li><strong>Alaba International Market:</strong> {CONTACTS.addressAlaba}</li>
        </ul>
        <p style={{ marginTop: '6px' }}>Please bring your Order ID when collecting.</p>
      </Section>
      <Section heading="On delivery">
        <p>Please inspect products in the presence of our delivery team where possible, and report any visible damage immediately so we can resolve it under our <Link to="/returns-policy">Returns &amp; Refund Policy</Link>.</p>
      </Section>
    </PolicyLayout>
  );
}

export function ReturnsPolicyPage() {
  return (
    <PolicyLayout
      title="Returns & Refund Policy"
      intro="What to do if a product arrives defective or a job is not done right — and how refunds work."
    >
      <Section heading="Defective or damaged products">
        <p>If a product arrives damaged, or develops a fault within <strong>7 days</strong> of delivery that is not caused by misuse, contact us with your Order ID and a photo or video of the issue. We will arrange repair, replacement, or a refund, in that order, at no cost to you. Manufacturer warranties apply beyond this window on applicable products.</p>
      </Section>
      <Section heading="Wrong item delivered">
        <p>If we deliver the wrong item, tell us within 48 hours and we will collect it and deliver the correct item free of charge.</p>
      </Section>
      <Section heading="Change of mind">
        <p>Unused products in their original, unopened packaging can be returned within 7 days of delivery; you cover the return delivery unless the return is our mistake. Installed, custom-made, or cut-to-size items (for example custom kitchens, curtains, and mixed paint) cannot be returned for change of mind.</p>
      </Section>
      <Section heading="Service workmanship">
        <p>If maintenance or installation work we carried out is defective, report it within <strong>14 days</strong> of completion and we will return to put it right free of charge. Where a job was booked through an artisan with escrow, payment is only released when you approve the work — see our <Link to="/terms">Terms &amp; Conditions</Link>.</p>
      </Section>
      <Section heading="How refunds are paid">
        <p>Approved refunds are paid to the original payment method (or by bank transfer where that is not possible) within 5–10 business days of approval. You will be notified when your refund is processed.</p>
      </Section>
      <Section heading="Cancellations">
        <p>You can cancel a product order before dispatch for a full refund. If a scheduled service visit is cancelled by you less than 24 hours before the appointment, a call-out fee may apply.</p>
      </Section>
    </PolicyLayout>
  );
}

export function TermsPage() {
  return (
    <PolicyLayout
      title="Terms & Conditions"
      intro="The terms that govern Halfcon's website, orders, payments, services, and artisan hiring."
    >
      <Section heading="Who we are">
        <p>Halfcon (“we”, “us”) provides home care and maintenance services, electronics and materials sales, and a platform for hiring verified artisans, operating from Ikorodu and Alaba International Market, Lagos, Nigeria.</p>
      </Section>
      <Section heading="Orders and prices">
        <p>Prices are shown in Nigerian Naira (₦) and are confirmed on the order before payment. If a listed price is clearly incorrect, we may cancel the order and refund any payment in full. A promotional code can be used only where the checkout accepts it, one code per order.</p>
      </Section>
      <Section heading="Payments">
        <p>Payments are processed securely via Paystack (card, transfer, and USSD). An order is confirmed once payment is received or, for escrow artisan bookings, once the first milestone is funded.</p>
      </Section>
      <Section heading="Artisan hiring and escrow protection">
        <p>When you hire an artisan through Halfcon, your payment is held in escrow and released in milestones: the materials portion plus 30% of the labour fee is released to start the job, and the remaining 70% of the labour fee is released only after you inspect the completed work and approve it. If you do not approve the work, contact us so we can mediate before any further release.</p>
      </Section>
      <Section heading="Your responsibilities">
        <p>Please provide accurate delivery/service addresses and contact details, and ensure our team or the artisan can safely access the site at the agreed time. You are responsible for obtaining any landlord or estate permissions needed for the work.</p>
      </Section>
      <Section heading="Service quality and liability">
        <p>We stand behind our workmanship as described in the <Link to="/returns-policy">Returns &amp; Refund Policy</Link>. Nothing in these terms removes rights you have under Nigerian consumer protection law.</p>
      </Section>
      <Section heading="Changes to these terms">
        <p>We may update these terms from time to time; the version published on this page at the time of your order applies to that order.</p>
      </Section>
    </PolicyLayout>
  );
}
