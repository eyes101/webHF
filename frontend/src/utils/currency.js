// utils/currency.js
// Halfcon operates in Nigerian Naira (NGN). Prices are stored in the database
// as integer "cents" (i.e. kobo — 1 Naira = 100 kobo) to avoid floating point
// rounding issues, the same pattern used for USD cents elsewhere.
export function formatNaira(cents) {
  const naira = cents / 100;
  return '₦' + naira.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
