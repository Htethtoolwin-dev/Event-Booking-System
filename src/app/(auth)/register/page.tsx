import type { Metadata } from "next";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = {
  title: "Register | Event Booking System",
  description: "Create an account to start booking events.",
};

export default function RegisterPage() {
  return <RegisterForm />;
}
