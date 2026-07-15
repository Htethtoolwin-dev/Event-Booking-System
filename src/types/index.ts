import { Role } from "@/generated/prisma/client";

export type SessionUser = {
  userId: string;
  email: string;
  role: Role;
  name: string;
};

export type ActionState = {
  error?: string;
  success?: boolean;
  fieldErrors?: Record<string, string[]>;
};

export const emptyActionState: ActionState = {};
