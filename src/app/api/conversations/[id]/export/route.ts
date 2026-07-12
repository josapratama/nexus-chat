import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const format = searchParams.get("format") || "markdown";

  const conversation = await prisma.conversation.findFirst({
    where: { id, userId: session.user.id },
    include: {
      messages: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!conversation) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (format === "json") {
    return new Response(
      JSON.stringify(
        {
          title: conversation.title,
          model: conversation.model,
          provider: conversation.provider,
          createdAt: conversation.createdAt,
          messages: conversation.messages.map((m) => ({
            role: m.role,
            content: m.content,
            createdAt: m.createdAt,
          })),
        },
        null,
        2,
      ),
      {
        headers: {
          "Content-Type": "application/json",
          "Content-Disposition": `attachment; filename="${conversation.title.replace(/[^a-z0-9]/gi, "_")}.json"`,
        },
      },
    );
  }

  // Markdown format
  let markdown = `# ${conversation.title}\n\n`;
  markdown += `**Model:** ${conversation.model} (${conversation.provider})\n`;
  markdown += `**Date:** ${conversation.createdAt.toISOString().split("T")[0]}\n\n`;
  markdown += `---\n\n`;

  for (const message of conversation.messages) {
    const roleLabel = message.role === "user" ? "**You**" : "**Assistant**";
    markdown += `${roleLabel}:\n\n${message.content}\n\n---\n\n`;
  }

  return new Response(markdown, {
    headers: {
      "Content-Type": "text/markdown",
      "Content-Disposition": `attachment; filename="${conversation.title.replace(/[^a-z0-9]/gi, "_")}.md"`,
    },
  });
}
