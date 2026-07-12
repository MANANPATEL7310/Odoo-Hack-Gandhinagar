import { scryptSync, randomBytes, timingSafeEqual } from "crypto";

/**
 * Hashes a plaintext password using Node's native scrypt key derivation function.
 * Returns a string formatted as "salt:hash".
 */
export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

/**
 * Verifies a plaintext password against a stored "salt:hash" string.
 * Uses a constant-time comparison to prevent timing attacks.
 */
export function verifyPassword(password: string, storedHash: string): boolean {
  const parts = storedHash.split(":");
  if (parts.length !== 2) return false;
  const [salt, key] = parts;
  const hash = scryptSync(password, salt!, 64).toString("hex");
  return timingSafeEqual(Buffer.from(key!, "hex"), Buffer.from(hash, "hex"));
}
