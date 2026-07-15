import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Sign In | Event Booking System",
  description: "Sign in to your account to book events.",
};

export default function LoginPage() {
  return <LoginForm />;
}
