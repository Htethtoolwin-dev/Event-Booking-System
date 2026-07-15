import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getProfileUser } from "@/actions/profile";
import { ProfileForm } from "@/components/profile/profile-form";
import { getSession } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Profile",
  description: "Manage your account settings.",
};

export default async function ProfilePage() {
  const session = await getSession();
  if (!session) {
    redirect("/login?callbackUrl=/profile");
  }

  const user = await getProfileUser(session.userId);
  if (!user) {
    redirect("/login");
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
        <p className="mt-2 text-muted-foreground">
          Manage your personal information and security settings.
        </p>
      </div>
      <ProfileForm user={user} />
    </div>
  );
}
