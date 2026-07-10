// google-auth.js
//
// Verifies a Google "ID token" (a signed JWT) WITHOUT the `google-auth-library`
// npm package, using only Node's built-in `crypto` + `fetch`. This keeps the
// backend's zero-dependency design intact (see mini-express.js header comment
// for why — npm registry access was blocked in the build sandbox).
//
// How "Sign in with Google" works on the frontend (Google Identity Services):
// the browser button, once clicked, returns a signed JWT directly to our
// frontend — no server-side redirect dance needed. The frontend sends that
// JWT to our backend, and THIS file's job is to confirm Google really signed
// it (so nobody can forge "I am someone@gmail.com") before we trust it.
//
// A Google ID token is a standard JWT: header.payload.signature, all
// base64url-encoded. Google rotates its signing keys periodically and
// publishes the current ones at a public, unauthenticated URL — we fetch
// those, find the matching key by `kid` (key id), and verify the RS256
// signature against it.
import crypto from 'node:crypto';

const GOOGLE_CERTS_URL = 'https://www.googleapis.com/oauth2/v3/certs';
const GOOGLE_ISSUER = ['accounts.google.com', 'https://accounts.google.com'];

let cachedCerts = null;
let cachedCertsExpiry = 0;

function base64UrlDecode(str) {
  return Buffer.from(str.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8');
}

async function getGoogleCerts() {
  if (cachedCerts && Date.now() < cachedCertsExpiry) return cachedCerts;
  const res = await fetch(GOOGLE_CERTS_URL);
  if (!res.ok) throw new Error('Could not fetch Google signing certs');
  const data = await res.json();
  cachedCerts = data.keys;
  cachedCertsExpiry = Date.now() + 60 * 60 * 1000; // cache for 1 hour
  return cachedCerts;
}

function jwkToPem(jwk) {
  // Build a KeyObject directly from the JWK using Node's built-in support
  // (Node 16+ supports importing JWK format natively via crypto.createPublicKey).
  return crypto.createPublicKey({ key: jwk, format: 'jwk' });
}

/**
 * Verifies a Google ID token (JWT string).
 * Throws on any failure. Returns the decoded payload on success, containing
 * fields like: sub (Google's unique user id), email, email_verified, name, picture.
 */
export async function verifyGoogleIdToken(idToken, expectedClientId) {
  if (!idToken || typeof idToken !== 'string' || idToken.split('.').length !== 3) {
    throw new Error('Malformed ID token');
  }
  const [headerB64, payloadB64, signatureB64] = idToken.split('.');

  const header = JSON.parse(base64UrlDecode(headerB64));
  let payload;
  try {
    payload = JSON.parse(base64UrlDecode(payloadB64));
  } catch {
    throw new Error('Malformed ID token payload');
  }

  // 1. Check expiry & issuer & audience BEFORE doing any crypto work (cheap checks first)
  const now = Math.floor(Date.now() / 1000);
  if (payload.exp && now > payload.exp) throw new Error('Token expired');
  if (!GOOGLE_ISSUER.includes(payload.iss)) throw new Error('Invalid issuer');
  if (expectedClientId && payload.aud !== expectedClientId) {
    throw new Error('Token audience does not match this app\'s Google Client ID');
  }

  // 2. Find the matching public key by 'kid' and verify the signature
  const certs = await getGoogleCerts();
  const matchingKey = certs.find((k) => k.kid === header.kid);
  if (!matchingKey) throw new Error('No matching Google signing key found (try again — keys rotate)');

  const publicKey = jwkToPem(matchingKey);
  const signedData = `${headerB64}.${payloadB64}`;
  const signature = Buffer.from(signatureB64.replace(/-/g, '+').replace(/_/g, '/'), 'base64');

  const verifier = crypto.createVerify('RSA-SHA256');
  verifier.update(signedData);
  const isValid = verifier.verify(publicKey, signature);

  if (!isValid) throw new Error('Invalid token signature');

  return payload;
}
