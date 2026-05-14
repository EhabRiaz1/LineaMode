import { createHmac, randomBytes } from "crypto";

const BASE32_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

function base32Encode(buffer: Buffer): string {
  let bits = 0;
  let value = 0;
  let encoded = "";

  for (const byte of buffer) {
    value = (value << 8) | byte;
    bits += 8;

    while (bits >= 5) {
      encoded += BASE32_CHARS[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }

  if (bits > 0) {
    encoded += BASE32_CHARS[(value << (5 - bits)) & 31];
  }

  return encoded;
}

export function generateSecret(byteLength = 20): string {
  return base32Encode(randomBytes(byteLength));
}

function base32Decode(encoded: string): Buffer {
  let bits = "";
  const normalized = encoded.toUpperCase().replace(/[\s=-]/g, "");

  for (const char of normalized) {
    const val = BASE32_CHARS.indexOf(char);
    if (val === -1) {
      throw new Error("Invalid Base32 secret");
    }
    bits += val.toString(2).padStart(5, "0");
  }

  const bytes: number[] = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) {
    bytes.push(parseInt(bits.substr(i, 8), 2));
  }
  return Buffer.from(bytes);
}

function generateHOTP(secret: string, counter: number): string {
  const decodedSecret = base32Decode(secret);
  const buffer = Buffer.alloc(8);
  for (let i = 7; i >= 0; i--) {
    buffer[i] = counter % 256;
    counter = Math.floor(counter / 256);
  }

  const hmac = createHmac("sha1", decodedSecret);
  hmac.update(buffer);
  const hmacResult = hmac.digest();

  const offset = hmacResult[hmacResult.length - 1] & 0xf;
  const code =
    ((hmacResult[offset] & 0x7f) << 24) |
    ((hmacResult[offset + 1] & 0xff) << 16) |
    ((hmacResult[offset + 2] & 0xff) << 8) |
    (hmacResult[offset + 3] & 0xff);

  return (code % 1000000).toString().padStart(6, "0");
}

export function generateTOTP(secret: string): string {
  const counter = Math.floor(Date.now() / 1000 / 30);
  return generateHOTP(secret, counter);
}

export function verifyTOTP(secret: string, token: string, window = 1): boolean {
  const counter = Math.floor(Date.now() / 1000 / 30);
  const normalizedToken = token.trim();

  if (!/^\d{6}$/.test(normalizedToken)) {
    return false;
  }
  
  try {
    for (let i = -window; i <= window; i++) {
      const expectedToken = generateHOTP(secret, counter + i);
      if (expectedToken === normalizedToken) {
        return true;
      }
    }
  } catch {
    return false;
  }
  
  return false;
}

export function generateOtpAuthUrl(secret: string, email: string, issuer = "Lineamode"): string {
  const encodedIssuer = encodeURIComponent(issuer);
  const encodedEmail = encodeURIComponent(email);
  return `otpauth://totp/${encodedIssuer}:${encodedEmail}?secret=${secret}&issuer=${encodedIssuer}&algorithm=SHA1&digits=6&period=30`;
}
