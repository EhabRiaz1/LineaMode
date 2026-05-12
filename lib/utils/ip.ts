import { createHash } from "node:crypto";

const SALT = process.env.IP_HASH_SALT ?? "lineamode-default-salt";

export function parseIp(request: Request): string | null {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  const real = request.headers.get("x-real-ip");
  if (real) return real.trim();
  return null;
}

export function hashIp(ip: string | null): string | null {
  if (!ip) return null;
  return createHash("sha256").update(`${SALT}:${ip}`).digest("hex").slice(0, 32);
}
