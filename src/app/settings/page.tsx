import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { SettingsForm } from "@/components/settings/settings-form";

export default async function SettingsPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="mx-auto max-w-2xl px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Settings
        </h1>
        <SettingsForm />
      </div>
    </div>
  );
}
