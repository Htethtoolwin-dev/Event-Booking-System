import { z } from "zod";

export const profileSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters").max(100),
    email: z.string().email("Please enter a valid email address"),
    currentPassword: z.string().optional(),
    newPassword: z.string().optional(),
    confirmPassword: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    const wantsPasswordChange = Boolean(data.newPassword || data.confirmPassword);

    if (wantsPasswordChange) {
      if (!data.currentPassword) {
        ctx.addIssue({
          code: "custom",
          message: "Current password is required to set a new password",
          path: ["currentPassword"],
        });
      }
      if (!data.newPassword || data.newPassword.length < 8) {
        ctx.addIssue({
          code: "custom",
          message: "New password must be at least 8 characters",
          path: ["newPassword"],
        });
      }
      if (data.newPassword !== data.confirmPassword) {
        ctx.addIssue({
          code: "custom",
          message: "Passwords do not match",
          path: ["confirmPassword"],
        });
      }
    }
  });

export type ProfileInput = z.infer<typeof profileSchema>;
