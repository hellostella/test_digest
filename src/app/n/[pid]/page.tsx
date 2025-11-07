import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export default async function PublicNewsletterPage({ params }: { params: { pid: string } }) {
  const newsletter = await prisma.newsletter.findFirst({
    where: { publicId: params.pid, publicEnabled: true }
  });
  if (!newsletter) {
    notFound();
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
