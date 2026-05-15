import crypto from "crypto";

function getKey() {
  const secret = process.env.ENCRYPTION_SECRET || "default-secret-key";
  return crypto.createHash("sha256").update(secret).digest();
}

export function encrypt(text) {
  const iv = crypto.randomBytes(16);
  const key = getKey();

  const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);

  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");

  return `${iv.toString("hex")}:${encrypted}`;
}

export function decrypt(encryptedText) {
  const [ivHex, encrypted] = encryptedText.split(":");

  const iv = Buffer.from(ivHex, "hex");
  const key = getKey();

  const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);

  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}