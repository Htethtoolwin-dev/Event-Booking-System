import { cookies } from "next/headers";
import { Role } from "@/generated/prisma/client";
import { db } from "@/lib/db";
import { AUTH_COOKIE_NAME, verifyToken } from "@/lib/jwt";
import { SessionUser } from "@/types";

export { AUTH_COOKIE_NAME, hashPassword, signToken, verifyPassword, verifyToken } from "@/lib/jwt";
export type { JwtPayload } from "@/lib/jwt";

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  const payload = await verifyToken(token);
  if (!payload) {
    return null;
  }

  const user = await db.user.findUnique({
    where: { id: payload.userId },
    select: { id: true, email: true, role: true, name: true },
  });

  if (!user) {
    return null;
  }

  return {
    userId: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
  };
}

export async function requireSession(): Promise<SessionUser> {
  const session = await getSession();
  if (!session) {
    throw new Error("Unauthorized");
  }
  return session;
}

export async function requireAdmin(): Promise<SessionUser> {
  const session = await requireSession();
  if (session.role !== Role.ADMIN) {
    throw new Error("Forbidden");
  }
  return session;
}
