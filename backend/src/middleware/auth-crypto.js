// auth-crypto.js — password hashing (scrypt) + session tokens using ONLY Node built-ins.
// No bcrypt/jsonwebtoken dependency required — this keeps the project runnable
// even where npm registry access is restricted, while remaining fully secure.
import crypto from 'node:crypto';

const SCRYPT_KEYLEN = 64;

export function hashPassword(plainPassword) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(plainPassword, salt, SCRYPT_KEYLEN).toString('hex');
  return { hash, salt };
}

export function verifyPassword(plainPassword, salt, expectedHash) {
  const hash = crypto.scryptSync(plainPassword, salt, SCRYPT_KEYLEN).toString('hex');
  const a = Buffer.from(hash, 'hex');
  const b = Buffer.from(expectedHash, 'hex');
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

export function newId() {
  return crypto.randomUUID();
}

export function newSessionToken() {
  return crypto.randomBytes(32).toString('hex');
}
