import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { PromptsLibrary } from "@/components/prompts/prompts-library";

export default async function PromptsPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  return <PromptsLibrary />;
}
