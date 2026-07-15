"use server";

import { Role } from "@/generated/prisma/client";
import { formatZodErrors } from "@/lib/action-utils";
import {
  hashPassword,
  signToken,
  verifyPassword,
} from "@/lib/auth";
import { clearAuthCookie, setAuthCookie } from "@/lib/cookies";
import { db } from "@/lib/db";
import { loginSchema, registerSchema } from "@/lib/validations/auth";
import { ActionState } from "@/types";
import { redirect } from "next/navigation";

export async function register(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return {
      fieldErrors: formatZodErrors(parsed.error.flatten().fieldErrors),
    };
  }

  const { name, email, password } = parsed.data;

  const existingUser = await db.user.findUnique({ where: { email } });
  if (existingUser) {
    return { error: "An account with this email already exists" };
  }

  const hashedPassword = await hashPassword(password);

  const user = await db.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role: Role.USER,
    },
  });

  const token = await signToken({
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  await setAuthCookie(token);
  redirect("/events");
}

export async function login(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return {
      fieldErrors: formatZodErrors(parsed.error.flatten().fieldErrors),
    };
  }

  const { email, password } = parsed.data;

  const user = await db.user.findUnique({ where: { email } });
  if (!user) {
    return { error: "Invalid email or password" };
  }

  const isValid = await verifyPassword(password, user.password);
  if (!isValid) {
    return { error: "Invalid email or password" };
  }

  const token = await signToken({
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  await setAuthCookie(token);

  if (user.role === Role.ADMIN) {
    redirect("/admin");
  }

  redirect("/events");
}

export async function logout() {
  await clearAuthCookie();
  redirect("/login");
}

export async function loginAction(
  prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  return login(prevState, formData);
}

export async function registerAction(
  prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  return register(prevState, formData);
}
