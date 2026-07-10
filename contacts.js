// config/contacts.js
// Single source of truth for Halfcon's public contact details.
// Update here and it flows through the footer, contact section, and
// WhatsApp chat link everywhere it's used.

export const CONTACTS = {
  email: 'halfcon111@gmail.com',
  whatsappDisplay: '+234 813 732 1877',
  whatsappNumber: '2348137321877', // digits only, intl format, no + or spaces — required for wa.me links
  instagram: '@halfcom',
  instagramUrl: 'https://instagram.com/halfcom',
  facebook: '@halfcom',
  facebookUrl: 'https://facebook.com/halfcom',
};

export function whatsappLink(message = "Hi Halfcon, I'd like to enquire about a service.") {
  return `https://wa.me/${CONTACTS.whatsappNumber}?text=${encodeURIComponent(message)}`;
}
