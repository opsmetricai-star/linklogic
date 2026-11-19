import { createHmac, timingSafeEqual } from "crypto";

/** Verify a Stripe-style signature header: "t=<unix>,v1=<hex>[,v1=<hex>]" over `${t}.${rawBody}`. */
export function verifySignature(raw: string, header: string | null, secret: string, toleranceSec = 300, now = Date.now()) {
  if (!header || !secret) return false;
  const parts = Object.fromEntries(
    header.split(",").map((p) => {
      const i = p.indexOf("=");
      return [p.slice(0, i), p.slice(i + 1)];
    }),
  );
  const t = Number(parts.t);
  if (!Number.isFinite(t) || Math.abs(now / 1000 - t) > toleranceSec) return false;
  const expected = createHmac("sha256", secret).update(`${t}.${raw}`).digest();
  return header
    .split(",")
    .filter((p) => p.startsWith("v1="))
    .some((p) => {
      const got = Buffer.from(p.slice(3), "hex");
      return got.length === expected.length && timingSafeEqual(got, expected);
    });
}

/** "plink_1:plus,price_2:scale" → map */
export function parsePlanMap(s: string | undefined): Record<string, "plus" | "scale"> {
  const out: Record<string, "plus" | "scale"> = {};
  for (const pair of (s ?? "").split(",")) {
    const [k, v] = pair.split(":").map((x) => x?.trim());
    if (k && (v === "plus" || v === "scale")) out[k] = v;
  }
  return out;
}
