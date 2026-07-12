import crypto from "crypto";
import { promisify } from "util";

const scrypt = promisify(crypto.scrypt);

/**
 * Hashes a plaintext password using crypto.scrypt.
 * Returns a string formatted as "salt:derivedKeyHex".
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.randomBytes(16).toString("hex");
  const derivedKey = (await scrypt(password, salt, 64)) as Buffer;
  return `${salt}:${derivedKey.toString("hex")}`;
}

/**
 * Compares a plaintext password against a salt:derivedKeyHex hash.
 */
export async function comparePassword(
  password: string,
  hash: string,
): Promise<boolean> {
  const parts = hash.split(":");
  const salt = parts[0];
  const key = parts[1];
  if (!salt || !key) return false;

  const keyBuffer = Buffer.from(key, "hex");
  const derivedKey = (await scrypt(password, salt, 64)) as Buffer;

  if (keyBuffer.length !== derivedKey.length) {
    return false;
  }

  return crypto.timingSafeEqual(keyBuffer, derivedKey);
}
