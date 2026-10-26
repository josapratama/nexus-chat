"use client";

import { useState, useEffect } from "react";
import {
  Users,
  MessageSquare,
  Activity,
  ArrowLeft,
  Coins,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Layers,
  Database,
  UserCheck,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface Stats {
  overview: {
    totalUsers: number;
    totalConversations: number;
    totalMessages: number;
    totalTokens: number;
    totalCost: number;
  };
  recentUsers: Array<{
    id: string;
    name: string | null;
    email: string;
    role: string;
    createdAt: string;
    _count: { conversations: number };
  }>;
  usageByProvider: Array<{
    provider: string;
    _sum: { totalTokens: number | null; cost: number | null };
    _count: number;
  }>;
}

interface UserEntry {
  id: string;
  name: string | null;
  email: string;
  role: string;
  createdAt: string;
  _count: { conversations: number; usage: number };
}

export function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<UserEntry[]>([]);
  const [activeTab, setActiveTab] = useState<"overview" | "users">("overview");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    fetchUsers();
  }, []);

  async function fetchStats() {
    try {
      const res = await fetch("/api/admin/stats");
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchUsers() {
    try {
      const res = await fetch("/api/admin/users");
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
    }
  }

  async function toggleRole(userId: string, currentRole: string) {
    const newRole = currentRole === "ADMIN" ? "USER" : "ADMIN";
    if (!confirm(`Ubah role pengguna ini menjadi ${newRole}?`)) return;

    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role: newRole }),
      });
      if (res.ok) {
        fetchUsers();
      }
    } catch (error) {
      console.error("Failed to update role:", error);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
          <p className="text-xs text-slate-400">Memuat data analitik sistem...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Top Navbar */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <Link
          href="/chat"
          className="inline-flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/80 px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Chat</span>
        </Link>

        <span className="inline-flex items-center gap-1.5 rounded-full border border-purple-500/20 bg-purple-500/10 px-3 py-1 text-xs font-semibold text-purple-400">
          <ShieldAlert className="h-3.5 w-3.5" />
          <span>NexusChat Admin Console</span>
        </span>
      </div>

      {/* Hero Header */}
      <div className="rounded-3xl border border-slate-800/80 bg-slate-900/60 p-6 backdrop-blur-xl">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-purple-400 mb-2">
          <Shield className="h-4 w-4" />
          <span>System Observability & Governance</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
          Admin Dashboard & Analitik
        </h1>
        <p className="mt-2 text-sm text-slate-400 leading-relaxed max-w-2xl">
          Pantau metrik penggunaan server, volume pesan, token terproses antar provider, serta kelola hak akses dan peran pengguna.
        </p>

        {/* Tab Switcher */}
        <div className="mt-6 flex items-center gap-2 pt-4 border-t border-slate-800/80">
          <button
            onClick={() => setActiveTab("overview")}
            className={cn(
              "flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition active:scale-95",
              activeTab === "overview"
                ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-indigo-500/20"
                : "border border-slate-800 bg-slate-900/60 text-slate-400 hover:bg-slate-900 hover:text-white",
            )}
          >
            <TrendingUp className="h-3.5 w-3.5" />
            <span>Overview & Metrik</span>
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={cn(
              "flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition active:scale-95",
              activeTab === "users"
                ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-indigo-500/20"
                : "border border-slate-800 bg-slate-900/60 text-slate-400 hover:bg-slate-900 hover:text-white",
            )}
          >
            <Users className="h-3.5 w-3.5" />
            <span>Manajemen Pengguna ({users.length})</span>
          </button>
        </div>
      </div>

      {activeTab === "overview" && (
        <>
          {/* 4 Stat Metric Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-3xl border border-slate-800/80 bg-slate-900/70 p-5 backdrop-blur-xl">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 mb-3">
                <Users className="h-5 w-5" />
              </div>
              <p className="text-xs font-medium text-slate-400">Total Pengguna</p>
              <p className="mt-1 text-2xl font-bold text-white">
                {stats?.overview.totalUsers || 0}
              </p>
            </div>

            <div className="rounded-3xl border border-slate-800/80 bg-slate-900/70 p-5 backdrop-blur-xl">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-3">
                <MessageSquare className="h-5 w-5" />
              </div>
              <p className="text-xs font-medium text-slate-400">Total Percakapan</p>
              <p className="mt-1 text-2xl font-bold text-white">
                {stats?.overview.totalConversations || 0}
              </p>
            </div>

            <div className="rounded-3xl border border-slate-800/80 bg-slate-900/70 p-5 backdrop-blur-xl">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 mb-3">
                <Activity className="h-5 w-5" />
              </div>
              <p className="text-xs font-medium text-slate-400">Total Pesan</p>
              <p className="mt-1 text-2xl font-bold text-white">
                {stats?.overview.totalMessages || 0}
              </p>
            </div>

            <div className="rounded-3xl border border-slate-800/80 bg-slate-900/70 p-5 backdrop-blur-xl">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-3">
                <Coins className="h-5 w-5" />
              </div>
              <p className="text-xs font-medium text-slate-400">Token Terproses</p>
              <p className="mt-1 text-2xl font-bold text-white">
                {stats?.overview.totalTokens ? stats.overview.totalTokens.toLocaleString() : "0"}
              </p>
            </div>
          </div>

          {/* Usage by Provider */}
          <div className="rounded-3xl border border-slate-800/80 bg-slate-900/70 p-6 backdrop-blur-xl">
            <h2 className="text-base font-bold text-white mb-1">Distribusi Penggunaan Provider</h2>
            <p className="text-xs text-slate-400 mb-5">Frekuensi pemanggilan dan konsumsi token per provider AI</p>

            {(!stats?.usageByProvider || stats.usageByProvider.length === 0) ? (
              <div className="text-center py-8 rounded-2xl border border-dashed border-slate-800 bg-slate-950/40">
                <Layers className="h-8 w-8 mx-auto text-slate-600 mb-2" />
                <p className="text-xs text-slate-400">Belum ada rekaman statistik token provider</p>
              </div>
            ) : (
              <div className="space-y-3">
                {stats.usageByProvider.map((item) => (
                  <div
                    key={item.provider}
                    className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-800/90 bg-slate-950/70"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-2.5 w-2.5 rounded-full bg-blue-500 shadow-xs" />
                      <span className="font-semibold text-sm text-white uppercase">
                        {item.provider}
                      </span>
                    </div>

                    <div className="flex items-center gap-6 text-xs text-slate-400 font-mono">
                      <span>{item._count} panggilan</span>
                      <span className="text-indigo-400 font-medium">
                        {(item._sum?.totalTokens || 0).toLocaleString()} tokens
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {activeTab === "users" && (
        <div className="rounded-3xl border border-slate-800/80 bg-slate-900/70 p-6 backdrop-blur-xl">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-bold text-white">Daftar Pengguna Terdaftar</h2>
              <p className="text-xs text-slate-400 mt-0.5">Kelola akun dan hak akses pengguna</p>
            </div>
            <span className="rounded-xl border border-slate-800 bg-slate-950 px-3 py-1 text-xs font-mono text-slate-400">
              {users.length} Akun
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-800 text-slate-400 uppercase text-[11px]">
                <tr>
                  <th className="pb-3 pl-2">Pengguna</th>
                  <th className="pb-3">Role</th>
                  <th className="pb-3">Percakapan</th>
                  <th className="pb-3">Terdaftar</th>
                  <th className="pb-3 pr-2 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {users.map((u) => {
                  const isAdmin = u.role === "ADMIN";
                  return (
                    <tr key={u.id} className="hover:bg-slate-900/50 transition">
                      <td className="py-3.5 pl-2">
                        <div className="font-medium text-white">{u.name || "Unnamed"}</div>
                        <div className="text-slate-400 font-mono text-[11px]">{u.email}</div>
                      </td>
                      <td className="py-3.5">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold border",
                            isAdmin
                              ? "bg-purple-500/10 text-purple-400 border-purple-500/30"
                              : "bg-slate-800 text-slate-300 border-slate-700",
                          )}
                        >
                          {isAdmin ? <ShieldCheck className="h-3 w-3" /> : <UserCheck className="h-3 w-3" />}
                          <span>{u.role}</span>
                        </span>
                      </td>
                      <td className="py-3.5 font-mono text-slate-300">
                        {u._count.conversations} chat
                      </td>
                      <td className="py-3.5 text-slate-400">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 pr-2 text-right">
                        <button
                          onClick={() => toggleRole(u.id, u.role)}
                          className={cn(
                            "rounded-xl border px-3 py-1 text-[11px] font-medium transition active:scale-95",
                            isAdmin
                              ? "border-slate-800 text-slate-400 hover:border-amber-500/30 hover:bg-amber-500/10 hover:text-amber-400"
                              : "border-purple-500/30 text-purple-400 hover:bg-purple-500/10 hover:border-purple-500/50",
                          )}
                        >
                          {isAdmin ? "Ubah ke USER" : "Jadikan ADMIN"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
