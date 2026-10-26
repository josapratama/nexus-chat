import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { SettingsForm } from "@/components/settings/settings-form";

export default async function SettingsPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100 selection:bg-blue-600 selection:text-white">
      {/* Background Ambient Glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-tr from-blue-600/15 via-indigo-600/15 to-purple-600/10 blur-[130px] rounded-full" />
        <div className="absolute top-1/2 -right-40 w-[450px] h-[450px] bg-indigo-500/10 blur-[130px] rounded-full" />
      </div>

      <div className="relative mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <SettingsForm user={session.user} />
      </div>
    </div>
  );
}
