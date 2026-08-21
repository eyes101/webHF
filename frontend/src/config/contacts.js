// config/contacts.js
// Single source of truth for Halfcon's public contact details and branch locations.

export const GOOGLE_CLIENT_ID = '716921218997-p4r2r4309mgm8kdus6npp83u1s1boga9.apps.googleusercontent.com';

export const CONTACTS = {
  email: 'halfcon111@gmail.com',
  website: 'www.halfcon.site',
  whatsappDisplay: '+234 813 732 1877',
  whatsappNumber: '2348137321877',
  phoneSecondary: '+234 704 100 3623',
  phoneSecondaryNumber: '2347041003623',
  addressIkorodu: "No. 6, Adebisi Close, off Believer's Road, Isawo Road, Agric, Ikorodu, Lagos",
  addressAlaba: "Shop H106B, Alaba Int'l Market, Ojo, Lagos",
  instagram: '@halfcon',
  instagramUrl: 'https://instagram.com/halfcon',
  facebook: '@halfcon',
  facebookUrl: 'https://facebook.com/halfcon',
};

export function whatsappLink(message = "Hi Halfcon, I'd like to enquire about your products and services.") {
  return `https://wa.me/${CONTACTS.whatsappNumber}?text=${encodeURIComponent(message)}`;
}
