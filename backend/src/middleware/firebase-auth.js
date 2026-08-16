// firebase-auth.js
//
// Verifies a Firebase Auth ID token (a signed JWT) WITHOUT the
// `firebase-admin` npm package, using only Node's built-in `crypto` + `fetch`
// — same zero-dependency approach as google-auth.js.
//
// How this fits together: the FRONTEND uses the real `firebase` npm package
// (that's normal and fine — it's a browser SDK, not a backend dependency) to
// let the user sign in with Google, Facebook, or email/password. Once signed
// in, Firebase gives the frontend a signed ID token. The frontend sends that
// token to our backend, and THIS file's job is to confirm Firebase really
// issued it before we trust the identity inside it.
//
// A Firebase ID token is a standard JWT signed with RS256. Firebase rotates
// its signing keys periodically and publishes the current ones at a public,
// unauthenticated URL — we fetch those, find the matching key by `kid`, and
// verify the signature against it (identical mechanics to google-auth.js,
// just different issuer/audience/key-source).
import crypto from 'node:crypto';

const FIREBASE_CERTS_URL =
  'https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com';

let cachedCerts = null;
let cachedCertsExpiry = 0;

function base64UrlDecode(str) {
  return Buffer.from(str.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8');
}

async function getFirebaseCerts() {
  if (cachedCerts && Date.now() < cachedCertsExpiry) return cachedCerts;
  const res = await fetch(FIREBASE_CERTS_URL);
  if (!res.ok) throw new Error('Could not fetch Firebase signing certs');
  const data = await res.json();
  cachedCerts = data.keys;
  cachedCertsExpiry = Date.now() + 60 * 60 * 1000; // cache for 1 hour
  return cachedCerts;
}

function jwkToPem(jwk) {
  return crypto.createPublicKey({ key: jwk, format: 'jwk' });
}

/**
 * Verifies a Firebase Auth ID token (JWT string) for the given project.
 * Throws on any failure. Returns the decoded payload on success, containing
 * fields like: sub / user_id (Firebase UID), email, email_verified, name,
 * picture, firebase.sign_in_provider (e.g. "google.com", "facebook.com",
 * "password").
 */
export async function verifyFirebaseIdToken(idToken, projectId) {
  if (!idToken || typeof idToken !== 'string' || idToken.split('.').length !== 3) {
    throw new Error('Malformed ID token');
  }
  if (!projectId) {
    throw new Error('Server is missing FIREBASE_PROJECT_ID configuration');
  }
  const [headerB64, payloadB64, signatureB64] = idToken.split('.');

  const header = JSON.parse(base64UrlDecode(headerB64));
  let payload;
  try {
    payload = JSON.parse(base64UrlDecode(payloadB64));
  } catch {
    throw new Error('Malformed ID token payload');
  }

  // 1. Cheap checks first, before any crypto work.
  const now = Math.floor(Date.now() / 1000);
  if (payload.exp && now > payload.exp) throw new Error('Token expired');
  if (payload.iat && payload.iat > now + 300) throw new Error('Token issued in the future');
  const expectedIssuer = `https://securetoken.google.com/${projectId}`;
  if (payload.iss !== expectedIssuer) throw new Error('Invalid issuer');
  if (payload.aud !== projectId) throw new Error('Token audience does not match this Firebase project');
  if (!payload.sub || typeof payload.sub !== 'string') throw new Error('Token missing subject (uid)');
  if (header.alg !== 'RS256') throw new Error('Unexpected signing algorithm');

  // 2. Find the matching public key by 'kid' and verify the RS256 signature.
  const certs = await getFirebaseCerts();
  const matchingKey = certs.find((k) => k.kid === header.kid);
  if (!matchingKey) throw new Error('No matching Firebase signing key found (try again — keys rotate)');

  const publicKey = jwkToPem(matchingKey);
  const signedData = `${headerB64}.${payloadB64}`;
  const signature = Buffer.from(signatureB64.replace(/-/g, '+').replace(/_/g, '/'), 'base64');

  const verifier = crypto.createVerify('RSA-SHA256');
  verifier.update(signedData);
  const isValid = verifier.verify(publicKey, signature);

  if (!isValid) throw new Error('Invalid token signature');

  return payload;
}
