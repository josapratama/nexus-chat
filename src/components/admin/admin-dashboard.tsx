"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Users,
  MessageSquare,
  Activity,
  ArrowLeft,
  Coins,
  Shield,
} from "lucide-react";
import Link from "next/link";

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
        setUsers(data.users);
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
    }
  }

  async function toggleRole(userId: string, currentRole: string) {
    const newRole = currentRole === "ADMIN" ? "USER" : "ADMIN";
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
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="mx-auto max-w-6xl px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link
              href="/chat"
              className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 mb-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Chat
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Admin Dashboard
            </h1>
          </div>
          <div className="flex gap-2">
            <Button
              variant={activeTab === "overview" ? "default" : "outline"}
              onClick={() => setActiveTab("overview")}
            >
              <Activity className="h-4 w-4 mr-1" />
              Overview
            </Button>
            <Button
              variant={activeTab === "users" ? "default" : "outline"}
              onClick={() => setActiveTab("users")}
            >
              <Users className="h-4 w-4 mr-1" />
              Users
            </Button>
          </div>
        </div>

        {activeTab === "overview" && stats && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                icon={<Users className="h-5 w-5" />}
                label="Total Users"
                value={stats.overview.totalUsers}
              />
              <StatCard
                icon={<MessageSquare className="h-5 w-5" />}
                label="Conversations"
                value={stats.overview.totalConversations}
              />
              <StatCard
                icon={<Activity className="h-5 w-5" />}
                label="Messages"
                value={stats.overview.totalMessages}
              />
              <StatCard
                icon={<Coins className="h-5 w-5" />}
                label="Total Tokens"
                value={formatNumber(stats.overview.totalTokens)}
              />
            </div>

            {/* Usage by Provider */}
            <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Usage by Provider
              </h2>
              {stats.usageByProvider.length === 0 ? (
                <p className="text-gray-500 text-sm">No usage data yet</p>
              ) : (
                <div className="space-y-3">
                  {stats.usageByProvider.map((item) => (
                    <div
                      key={item.provider}
                      className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800"
                    >
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white capitalize">
                          {item.provider}
                        </p>
                        <p className="text-sm text-gray-500">
                          {item._count} requests
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-mono text-sm text-gray-900 dark:text-white">
                          {formatNumber(item._sum.totalTokens || 0)} tokens
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Users */}
            <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Recent Users
              </h2>
              <div className="space-y-2">
                {stats.recentUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800"
                  >
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {user.name || "Unnamed"}
                      </p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                    <div className="text-right">
                      <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                        {user._count.conversations} chats
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "users" && (
          <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              All Users
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-2 font-medium text-gray-500">
                      Name
                    </th>
                    <th className="text-left py-3 px-2 font-medium text-gray-500">
                      Email
                    </th>
                    <th className="text-left py-3 px-2 font-medium text-gray-500">
                      Role
                    </th>
                    <th className="text-left py-3 px-2 font-medium text-gray-500">
                      Chats
                    </th>
                    <th className="text-left py-3 px-2 font-medium text-gray-500">
                      Joined
                    </th>
                    <th className="text-left py-3 px-2 font-medium text-gray-500">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr
                      key={user.id}
                      className="border-b border-gray-100 dark:border-gray-800"
                    >
                      <td className="py-3 px-2 text-gray-900 dark:text-white">
                        {user.name || "—"}
                      </td>
                      <td className="py-3 px-2 text-gray-600 dark:text-gray-400">
                        {user.email}
                      </td>
                      <td className="py-3 px-2">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                            user.role === "ADMIN"
                              ? "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300"
                              : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-gray-600 dark:text-gray-400">
                        {user._count.conversations}
                      </td>
                      <td className="py-3 px-2 text-gray-600 dark:text-gray-400">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleRole(user.id, user.role)}
                        >
                          <Shield className="h-3 w-3 mr-1" />
                          {user.role === "ADMIN" ? "Demote" : "Promote"}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-900">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
          {icon}
        </div>
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

function formatNumber(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
  if (num >= 1000) return (num / 1000).toFixed(1) + "K";
  return num.toString();
}
