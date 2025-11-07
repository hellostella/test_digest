import { getCurrentSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function NewsletterPage({ params }: { params: { id: string } }) {
  const session = await getCurrentSession();
  if (!session?.user?.id) {
    redirect("/");
  }
  const newsletter = await prisma.newsletter.findFirst({
    where: { id: params.id, userId: session.user.id }
  });
  if (!newsletter) {
    redirect("/dashboard");
  }
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">{newsletter.subject}</h1>
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-white">
        <iframe title={newsletter.subject} srcDoc={newsletter.html} className="h-[80vh] w-full border-0" />
      </div>
    </div>
  );
}
