import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import PreferencesForm from "@/components/preferences-form";

export default async function DashboardPage() {
  const session = await getCurrentSession();
  if (!session?.user?.id) {
    redirect("/");
  }
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      preferences: true,
      newsletters: {
        orderBy: { sentAt: "desc" },
        take: 5
      }
    }
  });
  if (!user) {
    redirect("/");
  }
  const prefs =
    user.preferences ??
    (await prisma.userPreferences.create({
      data: {
        userId: user.id
      }
    }));
  const totalOpens = await prisma.newsletter.aggregate({
    where: { userId: user.id },
    _sum: { opens: true, clicks: true }
  });

  return (
    <div className="space-y-10">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-white/60">Automation status, recent sends and quick actions.</p>
        </div>
        <div className="flex gap-3">
          <form action="/api/sync" method="post">
            <button className="rounded-full border border-white/20 px-4 py-2 text-sm text-white/80 hover:border-white/40">
              Sync now
            </button>
          </form>
          <Link
            href="/api/newsletter/send?preview=1"
            className="rounded-full border border-white/20 px-4 py-2 text-sm text-white/80 hover:border-white/40"
          >
            Build preview
          </Link>
          <Link
            href="/api/newsletter/send"
            className="rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white shadow hover:bg-brand-dark"
          >
            Send now
          </Link>
        </div>
      </header>
      <section className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <p className="text-sm text-white/60">Automation</p>
          <p className="mt-2 text-xl font-semibold">{prefs.enabled ? "Running" : "Paused"}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <p className="text-sm text-white/60">Total opens</p>
          <p className="mt-2 text-xl font-semibold">{totalOpens._sum.opens ?? 0}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <p className="text-sm text-white/60">Total clicks</p>
          <p className="mt-2 text-xl font-semibold">{totalOpens._sum.clicks ?? 0}</p>
        </div>
      </section>
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Recent newsletters</h2>
        <div className="space-y-2">
          {user.newsletters.map((nl) => (
            <div key={nl.id} className="rounded-xl border border-white/10 bg-white/5 p-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-medium">{nl.subject}</p>
                  <p className="text-xs text-white/50">Sent {nl.sentAt.toLocaleString()}</p>
                </div>
                <div className="flex gap-3 text-xs text-white/60">
                  <span>{nl.opens} opens</span>
                  <span>{nl.clicks} clicks</span>
                  <Link href={`/newsletter/${nl.id}`} className="text-brand">
                    View
                  </Link>
                </div>
              </div>
            </div>
          ))}
          {user.newsletters.length === 0 && (
            <p className="text-sm text-white/50">No newsletters yet. Run a preview to get started.</p>
          )}
        </div>
      </section>
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Preferences</h2>
        <PreferencesForm
          initial={{
            enabled: prefs.enabled,
            frequency: prefs.frequency,
            timezone: prefs.timezone,
            sendHour: prefs.sendHour,
            dayOfWeek: prefs.dayOfWeek,
            dayOfMonth: prefs.dayOfMonth,
            aiEnabled: prefs.aiEnabled,
            maxItems: prefs.maxItems,
            maxPerSub: prefs.maxPerSub,
            includeSubs: prefs.includeSubs,
            excludeSubs: prefs.excludeSubs
          }}
        />
      </section>
      <footer className="flex gap-6 text-sm text-white/60">
        <Link href="/archive">Archive</Link>
        <form action="/api/auth/signout" method="post">
          <button>Sign out</button>
        </form>
      </footer>
    </div>
  );
}
