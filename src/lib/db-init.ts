import { Pool } from "pg";
import bcrypt from "bcryptjs";

let isInitialized = false;

export async function ensureDatabaseInitialized() {
  if (isInitialized) return;

  const connectionString =
    process.env.DATABASE_URL ||
    "postgresql://postgres:postgres@localhost:5432/nexuschat";

  const pool = new Pool({ connectionString });

  try {
    // 1. Run idempotent DDL schema
    await pool.query(`
      CREATE SCHEMA IF NOT EXISTS "public";

      DO $$ BEGIN
          CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');
      EXCEPTION
          WHEN duplicate_object THEN null;
      END $$;

      DO $$ BEGIN
          CREATE TYPE "MessageRole" AS ENUM ('user', 'assistant', 'system');
      EXCEPTION
          WHEN duplicate_object THEN null;
      END $$;

      CREATE TABLE IF NOT EXISTS "User" (
          "id" TEXT NOT NULL,
          "name" TEXT,
          "email" TEXT NOT NULL,
          "emailVerified" TIMESTAMP(3),
          "image" TEXT,
          "password" TEXT,
          "role" "Role" NOT NULL DEFAULT 'USER',
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL,
          CONSTRAINT "User_pkey" PRIMARY KEY ("id")
      );

      CREATE TABLE IF NOT EXISTS "Account" (
          "userId" TEXT NOT NULL,
          "type" TEXT NOT NULL,
          "provider" TEXT NOT NULL,
          "providerAccountId" TEXT NOT NULL,
          "refresh_token" TEXT,
          "access_token" TEXT,
          "expires_at" INTEGER,
          "token_type" TEXT,
          "scope" TEXT,
          "id_token" TEXT,
          "session_state" TEXT,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL,
          CONSTRAINT "Account_pkey" PRIMARY KEY ("provider","providerAccountId")
      );

      CREATE TABLE IF NOT EXISTS "Session" (
          "sessionToken" TEXT NOT NULL,
          "userId" TEXT NOT NULL,
          "expires" TIMESTAMP(3) NOT NULL,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL
      );

      CREATE TABLE IF NOT EXISTS "VerificationToken" (
          "identifier" TEXT NOT NULL,
          "token" TEXT NOT NULL,
          "expires" TIMESTAMP(3) NOT NULL,
          CONSTRAINT "VerificationToken_pkey" PRIMARY KEY ("identifier","token")
      );

      CREATE TABLE IF NOT EXISTS "Conversation" (
          "id" TEXT NOT NULL,
          "title" TEXT NOT NULL DEFAULT 'New Chat',
          "userId" TEXT NOT NULL,
          "model" TEXT NOT NULL DEFAULT 'gpt-4o',
          "provider" TEXT NOT NULL DEFAULT 'openai',
          "systemPrompt" TEXT,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL,
          CONSTRAINT "Conversation_pkey" PRIMARY KEY ("id")
      );

      CREATE TABLE IF NOT EXISTS "Message" (
          "id" TEXT NOT NULL,
          "conversationId" TEXT NOT NULL,
          "role" "MessageRole" NOT NULL,
          "content" TEXT NOT NULL,
          "tokenCount" INTEGER,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
      );

      CREATE TABLE IF NOT EXISTS "MessageAttachment" (
          "id" TEXT NOT NULL,
          "messageId" TEXT NOT NULL,
          "fileName" TEXT NOT NULL,
          "fileType" TEXT NOT NULL,
          "fileSize" INTEGER NOT NULL,
          "url" TEXT NOT NULL,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "MessageAttachment_pkey" PRIMARY KEY ("id")
      );

      CREATE TABLE IF NOT EXISTS "UserApiKey" (
          "id" TEXT NOT NULL,
          "userId" TEXT NOT NULL,
          "provider" TEXT NOT NULL,
          "apiKey" TEXT NOT NULL,
          "label" TEXT,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL,
          CONSTRAINT "UserApiKey_pkey" PRIMARY KEY ("id")
      );

      CREATE TABLE IF NOT EXISTS "UsageRecord" (
          "id" TEXT NOT NULL,
          "userId" TEXT NOT NULL,
          "conversationId" TEXT,
          "provider" TEXT NOT NULL,
          "model" TEXT NOT NULL,
          "promptTokens" INTEGER NOT NULL DEFAULT 0,
          "completionTokens" INTEGER NOT NULL DEFAULT 0,
          "totalTokens" INTEGER NOT NULL DEFAULT 0,
          "cost" DOUBLE PRECISION NOT NULL DEFAULT 0,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "UsageRecord_pkey" PRIMARY KEY ("id")
      );

      CREATE TABLE IF NOT EXISTS "Document" (
          "id" TEXT NOT NULL,
          "userId" TEXT NOT NULL,
          "name" TEXT NOT NULL,
          "fileName" TEXT NOT NULL,
          "fileType" TEXT NOT NULL,
          "fileSize" INTEGER NOT NULL,
          "content" TEXT NOT NULL,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL,
          CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
      );

      CREATE TABLE IF NOT EXISTS "DocumentChunk" (
          "id" TEXT NOT NULL,
          "documentId" TEXT NOT NULL,
          "content" TEXT NOT NULL,
          "embedding" TEXT,
          "chunkIndex" INTEGER NOT NULL,
          CONSTRAINT "DocumentChunk_pkey" PRIMARY KEY ("id")
      );

      CREATE TABLE IF NOT EXISTS "PromptTemplate" (
          "id" TEXT NOT NULL,
          "userId" TEXT,
          "title" TEXT NOT NULL,
          "description" TEXT,
          "content" TEXT NOT NULL,
          "category" TEXT NOT NULL DEFAULT 'general',
          "isPublic" BOOLEAN NOT NULL DEFAULT false,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL,
          CONSTRAINT "PromptTemplate_pkey" PRIMARY KEY ("id")
      );

      CREATE TABLE IF NOT EXISTS "SystemConfig" (
          "id" TEXT NOT NULL,
          "key" TEXT NOT NULL,
          "value" TEXT NOT NULL,
          CONSTRAINT "SystemConfig_pkey" PRIMARY KEY ("id")
      );

      CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");
      CREATE UNIQUE INDEX IF NOT EXISTS "Session_sessionToken_key" ON "Session"("sessionToken");
      CREATE INDEX IF NOT EXISTS "Conversation_userId_idx" ON "Conversation"("userId");
      CREATE INDEX IF NOT EXISTS "Message_conversationId_idx" ON "Message"("conversationId");
      CREATE INDEX IF NOT EXISTS "MessageAttachment_messageId_idx" ON "MessageAttachment"("messageId");
      CREATE UNIQUE INDEX IF NOT EXISTS "UserApiKey_userId_provider_key" ON "UserApiKey"("userId", "provider");
      CREATE INDEX IF NOT EXISTS "UsageRecord_userId_idx" ON "UsageRecord"("userId");
      CREATE INDEX IF NOT EXISTS "UsageRecord_createdAt_idx" ON "UsageRecord"("createdAt");
      CREATE INDEX IF NOT EXISTS "Document_userId_idx" ON "Document"("userId");
      CREATE INDEX IF NOT EXISTS "DocumentChunk_documentId_idx" ON "DocumentChunk"("documentId");
      CREATE INDEX IF NOT EXISTS "PromptTemplate_userId_idx" ON "PromptTemplate"("userId");
      CREATE INDEX IF NOT EXISTS "PromptTemplate_category_idx" ON "PromptTemplate"("category");
      CREATE UNIQUE INDEX IF NOT EXISTS "SystemConfig_key_key" ON "SystemConfig"("key");

      DO $$ BEGIN
        ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;

      DO $$ BEGIN
        ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;

      DO $$ BEGIN
        ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;

      DO $$ BEGIN
        ALTER TABLE "Message" ADD CONSTRAINT "Message_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;

      DO $$ BEGIN
        ALTER TABLE "MessageAttachment" ADD CONSTRAINT "MessageAttachment_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "Message"("id") ON DELETE CASCADE ON UPDATE CASCADE;
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;

      DO $$ BEGIN
        ALTER TABLE "UserApiKey" ADD CONSTRAINT "UserApiKey_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;

      DO $$ BEGIN
        ALTER TABLE "UsageRecord" ADD CONSTRAINT "UsageRecord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;

      DO $$ BEGIN
        ALTER TABLE "Document" ADD CONSTRAINT "Document_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;

      DO $$ BEGIN
        ALTER TABLE "DocumentChunk" ADD CONSTRAINT "DocumentChunk_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE CASCADE ON UPDATE CASCADE;
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;

      DO $$ BEGIN
        ALTER TABLE "PromptTemplate" ADD CONSTRAINT "PromptTemplate_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    // 2. Seed default admin and demo user if no admin exists
    const adminCheck = await pool.query(
      `SELECT id FROM "User" WHERE email = $1`,
      ["admin@example.com"],
    );

    if (adminCheck.rowCount === 0) {
      const adminPass = await bcrypt.hash("admin123", 12);
      await pool.query(
        `INSERT INTO "User" ("id", "name", "email", "password", "role", "updatedAt")
         VALUES (gen_random_uuid()::text, 'Admin', 'admin@example.com', $1, 'ADMIN', NOW())
         ON CONFLICT ("email") DO NOTHING`,
        [adminPass],
      );
    }

    const demoCheck = await pool.query(
      `SELECT id FROM "User" WHERE email = $1`,
      ["demo@example.com"],
    );

    if (demoCheck.rowCount === 0) {
      const demoPass = await bcrypt.hash("demo1234", 12);
      await pool.query(
        `INSERT INTO "User" ("id", "name", "email", "password", "role", "updatedAt")
         VALUES (gen_random_uuid()::text, 'Demo User', 'demo@example.com', $1, 'USER', NOW())
         ON CONFLICT ("email") DO NOTHING`,
        [demoPass],
      );
    }

    isInitialized = true;
    console.log("[Database] Schema verified and initial seed ready.");
  } catch (error) {
    console.error("[Database] Initialization failed:", error);
  } finally {
    await pool.end();
  }
}
