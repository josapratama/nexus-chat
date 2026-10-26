import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AdminDashboard } from "@/components/admin/admin-dashboard";

export default async function AdminPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  if (user?.role !== "ADMIN") {
    redirect("/chat");
  }

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100 selection:bg-blue-600 selection:text-white">
      {/* Background Ambient Glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-gradient-to-tr from-purple-600/15 via-indigo-600/15 to-blue-600/10 blur-[130px] rounded-full" />
        <div className="absolute top-1/2 -right-40 w-[450px] h-[450px] bg-blue-500/10 blur-[130px] rounded-full" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <AdminDashboard />
      </div>
    </div>
  );
}
