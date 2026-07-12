import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { nanoid } from "nanoid";

const UPLOAD_DIR = join(process.cwd(), "public", "uploads");
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
];
const ALLOWED_DOC_TYPES = [
  "application/pdf",
  "text/plain",
  "text/markdown",
  "application/json",
  "text/csv",
];
const ALLOWED_TYPES = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_DOC_TYPES];

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 10MB." },
        { status: 400 },
      );
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: `File type ${file.type} is not supported.` },
        { status: 400 },
      );
    }

    // Create upload directory if it doesn't exist
    await mkdir(UPLOAD_DIR, { recursive: true });

    // Generate unique filename
    const ext = file.name.split(".").pop() || "bin";
    const uniqueName = `${nanoid()}.${ext}`;
    const filePath = join(UPLOAD_DIR, uniqueName);

    // Write file
    const bytes = await file.arrayBuffer();
    await writeFile(filePath, Buffer.from(bytes));

    const url = `/uploads/${uniqueName}`;

    return NextResponse.json({
      url,
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      isImage: ALLOWED_IMAGE_TYPES.includes(file.type),
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 },
    );
  }
}
