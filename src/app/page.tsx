import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import LandingPage from "@/components/landing/landing-page";

export default async function Home() {
  const session = await auth();

  // If user is already authenticated, take them directly to the chat interface
  if (session) {
    redirect("/chat");
  }

  // Otherwise, present the modern Landing Page
  return <LandingPage />;
}
