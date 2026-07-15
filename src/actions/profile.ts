"use server";

import { formatZodErrors } from "@/lib/action-utils";
import {
  hashPassword,
  requireSession,
  signToken,
  verifyPassword,
} from "@/lib/auth";
import { setAuthCookie } from "@/lib/cookies";
import { db } from "@/lib/db";
import { profileSchema } from "@/lib/validations/profile";
import { ActionState } from "@/types";
import { revalidatePath } from "next/cache";

export async function updateProfile(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  let session;
  try {
    session = await requireSession();
  } catch {
    return { error: "Unauthorized" };
  }

  const parsed = profileSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    currentPassword: formData.get("currentPassword") || undefined,
    newPassword: formData.get("newPassword") || undefined,
    confirmPassword: formData.get("confirmPassword") || undefined,
  });

  if (!parsed.success) {
    return { fieldErrors: formatZodErrors(parsed.error.flatten().fieldErrors) };
  }

  const { name, email, currentPassword, newPassword } = parsed.data;

  const user = await db.user.findUnique({ where: { id: session.userId } });
  if (!user) {
    return { error: "User not found" };
  }

  if (email !== user.email) {
    const existing = await db.user.findUnique({ where: { email } });
    if (existing) {
      return { error: "Email is already in use" };
    }
  }

  const updateData: { name: string; email: string; password?: string } = {
    name,
    email,
  };

  if (newPassword) {
    const isValid = await verifyPassword(currentPassword ?? "", user.password);
    if (!isValid) {
      return { error: "Current password is incorrect" };
    }
    updateData.password = await hashPassword(newPassword);
  }

  const updatedUser = await db.user.update({
    where: { id: session.userId },
    data: updateData,
    select: { id: true, email: true, role: true, name: true },
  });

  const token = await signToken({
    userId: updatedUser.id,
    email: updatedUser.email,
    role: updatedUser.role,
  });
  await setAuthCookie(token);

  revalidatePath("/profile");

  return { success: true };
}

export async function getProfileUser(userId: string) {
  return db.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });
}
