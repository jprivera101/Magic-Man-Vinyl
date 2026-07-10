import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE_NAME = "mmv_admin_session";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 días

function getSecret() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error("Falta SESSION_SECRET en las variables de entorno");
  }
  return new TextEncoder().encode(secret);
}

export async function signSessionToken(): Promise<string> {
  return new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE_SECONDS}s`)
    .sign(getSecret());
}

export async function isValidSessionToken(
  token: string | undefined,
): Promise<boolean> {
  if (!token) return false;
  try {
    await jwtVerify(token, getSecret());
    return true;
  } catch {
    return false;
  }
}
