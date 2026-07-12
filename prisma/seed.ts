import { PrismaClient } from "../src/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import "dotenv/config";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});
const prisma = new PrismaClient({ adapter });

async function main() {
  // Create admin user
  const hashedPassword = await bcrypt.hash("admin123", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      email: "admin@example.com",
      name: "Admin",
      password: hashedPassword,
      role: "ADMIN",
    },
  });

  console.log("Created admin user:", admin.email);

  // Create demo user
  const demoPassword = await bcrypt.hash("demo1234", 12);

  const demo = await prisma.user.upsert({
    where: { email: "demo@example.com" },
    update: {},
    create: {
      email: "demo@example.com",
      name: "Demo User",
      password: demoPassword,
      role: "USER",
    },
  });

  console.log("Created demo user:", demo.email);

  // Create default prompt templates
  const defaultPrompts = [
    {
      title: "Code Review",
      description: "Review code for bugs, performance, and best practices",
      content:
        "Please review the following code. Look for:\n- Bugs and potential issues\n- Performance improvements\n- Security vulnerabilities\n- Code style and best practices\n\nCode:\n{{code}}",
      category: "coding",
      isPublic: true,
    },
    {
      title: "Explain Like I'm 5",
      description: "Simplify complex topics",
      content:
        "Explain the following concept in simple terms that a 5-year-old could understand. Use analogies and examples:\n\n{{topic}}",
      category: "general",
      isPublic: true,
    },
    {
      title: "Blog Post Writer",
      description: "Generate a structured blog post",
      content:
        "Write a blog post about {{topic}}. Include:\n- An engaging title\n- Introduction that hooks the reader\n- 3-5 main sections with subheadings\n- Practical examples or tips\n- A conclusion with a call to action\n\nTone: {{tone}}",
      category: "writing",
      isPublic: true,
    },
    {
      title: "Debug Helper",
      description: "Help debug code errors",
      content:
        "I'm getting the following error:\n\n```\n{{error}}\n```\n\nHere's my code:\n\n```\n{{code}}\n```\n\nPlease help me understand what's causing this error and how to fix it.",
      category: "coding",
      isPublic: true,
    },
    {
      title: "Meeting Summary",
      description: "Summarize meeting notes into action items",
      content:
        "Summarize the following meeting notes into:\n1. Key decisions made\n2. Action items (with owners if mentioned)\n3. Open questions\n4. Next steps\n\nMeeting notes:\n{{notes}}",
      category: "business",
      isPublic: true,
    },
    {
      title: "API Documentation",
      description: "Generate API documentation from code",
      content:
        "Generate comprehensive API documentation for the following code. Include:\n- Endpoint description\n- Parameters (with types and descriptions)\n- Request/response examples\n- Error codes\n- Usage notes\n\nCode:\n{{code}}",
      category: "coding",
      isPublic: true,
    },
    {
      title: "Email Composer",
      description: "Draft professional emails",
      content:
        "Write a professional email with the following details:\n- Purpose: {{purpose}}\n- Recipient: {{recipient}}\n- Tone: {{tone}}\n- Key points to include: {{points}}\n\nKeep it concise and clear.",
      category: "business",
      isPublic: true,
    },
    {
      title: "Story Writer",
      description: "Creative story generation",
      content:
        "Write a short story with the following parameters:\n- Genre: {{genre}}\n- Setting: {{setting}}\n- Main character: {{character}}\n- Theme: {{theme}}\n\nMake it engaging with vivid descriptions and dialogue.",
      category: "writing",
      isPublic: true,
    },
  ];

  for (const prompt of defaultPrompts) {
    await prisma.promptTemplate.upsert({
      where: {
        id: `default-${prompt.title.toLowerCase().replace(/\s+/g, "-")}`,
      },
      update: {},
      create: {
        id: `default-${prompt.title.toLowerCase().replace(/\s+/g, "-")}`,
        ...prompt,
      },
    });
  }

  console.log(`Created ${defaultPrompts.length} default prompt templates`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
