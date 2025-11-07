import { getCurrentSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function ArchivePage() {
  const session = await getCurrentSession();
  if (!session?.user?.id) {
    redirect("/");
  }
  const newsletters = await prisma.newsletter.findMany({
    where: { userId: session.user.id },
    orderBy: { sentAt: "desc" }
  });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Archive</h1>
      <div className="space-y-3">
        {newsletters.map((nl) => (
          <div key={nl.id} className="rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-medium">{nl.subject}</p>
                <p className="text-xs text-white/50">Sent {nl.sentAt.toLocaleString()}</p>
              </div>
              <div className="flex items-center gap-3 text-xs text-white/60">
                <span>{nl.opens} opens</span>
                <span>{nl.clicks} clicks</span>
                <Link href={`/newsletter/${nl.id}`} className="text-brand">
                  View
                </Link>
                {nl.publicEnabled && nl.publicId && (
                  <Link href={`/n/${nl.publicId}`} className="text-brand">
                    Public link
                  </Link>
                )}
              </div>
            </div>
          </div>
        ))}
        {newsletters.length === 0 && <p className="text-sm text-white/60">No newsletters sent yet.</p>}
      </div>
    </div>
  );
}
