import { getCurrentSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import OnboardingClient from "@/components/onboarding-client";

export default async function OnboardingPage() {
  const session = await getCurrentSession();
  if (!session?.user?.id) {
    redirect("/");
  }
  return <OnboardingClient />;
}
