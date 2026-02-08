import { createHash, timingSafeEqual } from "node:crypto";
import { readFileSync } from "node:fs";

const ESTH_LICENSE_SECRET = "ESTH_PUBLIC_LICENSE_V1";

export interface LicenseResult {
  valid: boolean;
  plan?: string;
  holder?: string;
  reason?: string;
}

function signPayload(payload: string): string {
  return createHash("sha256").update(`${payload}:${ESTH_LICENSE_SECRET}`).digest("hex");
}

export function validateLicense(licenseValue: string): LicenseResult {
  const [holder, plan, signature] = licenseValue.split("|");
  if (!holder || !plan || !signature) {
    return { valid: false, reason: "license format invalid; expected holder|plan|signature" };
  }
  const expected = signPayload(`${holder}|${plan}`);
  const sigBuf = Buffer.from(signature, "hex");
  const expBuf = Buffer.from(expected, "hex");
  if (sigBuf.length !== expBuf.length || !timingSafeEqual(sigBuf, expBuf)) {
    return { valid: false, reason: "license signature mismatch" };
  }
  return { valid: true, holder, plan };
}

export function loadLicense(licensePath?: string): string | undefined {
  if (process.env.ESTH_LICENSE_KEY) return process.env.ESTH_LICENSE_KEY;
  if (!licensePath) return undefined;
  return readFileSync(licensePath, "utf8").trim();
}

export function licenseHelpExample(holder: string, plan: string): string {
  const payload = `${holder}|${plan}`;
  return `${payload}|${signPayload(payload)}`;
}
