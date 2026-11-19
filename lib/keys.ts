import "server-only";
import { createHash, randomBytes } from "crypto";

export function generateApiKey() {
  const secret = "ll_" + randomBytes(24).toString("base64url");
  return { secret, prefix: secret.slice(0, 9), hash: hashKey(secret) };
}

export function hashKey(secret: string) {
  return createHash("sha256").update(secret).digest("hex");
}
