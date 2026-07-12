import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check if user is admin
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  if (user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Get stats
  const [
    totalUsers,
    totalConversations,
    totalMessages,
    totalUsage,
    recentUsers,
    usageByProvider,
    usageByDay,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.conversation.count(),
    prisma.message.count(),
    prisma.usageRecord.aggregate({
      _sum: { totalTokens: true, cost: true },
    }),
    prisma.user.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        _count: { select: { conversations: true } },
      },
    }),
    prisma.usageRecord.groupBy({
      by: ["provider"],
      _sum: { totalTokens: true, cost: true },
      _count: true,
    }),
    prisma.usageRecord.groupBy({
      by: ["createdAt"],
      _sum: { totalTokens: true },
      _count: true,
      orderBy: { createdAt: "desc" },
      take: 30,
    }),
  ]);

  return NextResponse.json({
    overview: {
      totalUsers,
      totalConversations,
      totalMessages,
      totalTokens: totalUsage._sum.totalTokens || 0,
      totalCost: totalUsage._sum.cost || 0,
    },
    recentUsers,
    usageByProvider,
    usageByDay,
  });
}
