import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import type { UserRole } from "@/lib/constants";

const SESSION_COOKIE = "eduhub_session";
const secret = new TextEncoder().encode(
  process.env.AUTH_SECRET ?? "eduhub-dev-secret-change-in-production"
);

export interface SessionUser {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  schoolId: string | null;
}

export async function createSessionToken(userId: string) {
  return new SignJWT({ userId })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .setIssuedAt()
    .sign(secret);
}

export async function verifySessionToken(token: string) {
  const { payload } = await jwtVerify(token, secret);
  return payload.userId as string;
}

export async function setSessionCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  try {
    const userId = await verifySessionToken(token);
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, fullName: true, role: true, schoolId: true },
    });
    if (!user) return null;
    return { ...user, role: user.role as SessionUser["role"] };
  } catch {
    return null;
  }
}

export async function requireSession(allowedRoles?: UserRole[]) {
  const user = await getSessionUser();
  if (!user) throw new Error("UNAUTHORIZED");
  if (allowedRoles && !allowedRoles.includes(user.role)) throw new Error("FORBIDDEN");
  return user;
}

export { SESSION_COOKIE };
