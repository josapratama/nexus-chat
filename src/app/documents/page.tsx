import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { DocumentsManager } from "@/components/documents/documents-manager";

export default async function DocumentsPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  return <DocumentsManager />;
}
