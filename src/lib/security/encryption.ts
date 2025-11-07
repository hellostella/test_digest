import crypto from "crypto";
import { env } from "@/lib/env";

const key = Buffer.from(env.ENCRYPTION_KEY, env.ENCRYPTION_KEY.length === 64 ? "hex" : "utf8");

if (key.length !== 32) {
  throw new Error("ENCRYPTION_KEY must decode to 32 bytes for AES-256-GCM");
}

export function encrypt(value: string | null | undefined) {
  if (!value) return value ?? null;
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, encrypted]).toString("base64");
}

export function decrypt(value: string | null | undefined) {
  if (!value) return value ?? null;
  const raw = Buffer.from(value, "base64");
  const iv = raw.subarray(0, 12);
  const tag = raw.subarray(12, 28);
  const payload = raw.subarray(28);
  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(tag);
  const decrypted = Buffer.concat([decipher.update(payload), decipher.final()]);
  return decrypted.toString("utf8");
}
