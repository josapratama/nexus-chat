import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const apiKeys = await prisma.userApiKey.findMany({
    where: { userId: session.user.id },
    select: {
      id: true,
      provider: true,
      label: true,
      createdAt: true,
      // Don't return the actual key, just a masked version
      apiKey: true,
    },
  });

  // Mask API keys
  const maskedKeys = apiKeys.map((key) => ({
    ...key,
    apiKey: key.apiKey.slice(0, 8) + "..." + key.apiKey.slice(-4),
  }));

  return NextResponse.json(maskedKeys);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { provider, apiKey, label } = await request.json();

  if (!provider || !apiKey) {
    return NextResponse.json(
      { error: "Provider and API key are required" },
      { status: 400 },
    );
  }

  const userApiKey = await prisma.userApiKey.upsert({
    where: {
      userId_provider: {
        userId: session.user.id,
        provider,
      },
    },
    update: { apiKey, label },
    create: {
      userId: session.user.id,
      provider,
      apiKey,
      label,
    },
  });

  return NextResponse.json(
    {
      id: userApiKey.id,
      provider: userApiKey.provider,
      label: userApiKey.label,
    },
    { status: 201 },
  );
}

export async function DELETE(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const provider = searchParams.get("provider");

  if (!provider) {
    return NextResponse.json(
      { error: "Provider is required" },
      { status: 400 },
    );
  }

  await prisma.userApiKey.deleteMany({
    where: {
      userId: session.user.id,
      provider,
    },
  });

  return NextResponse.json({ success: true });
}
