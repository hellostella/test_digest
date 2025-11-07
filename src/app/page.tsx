import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function HomePage() {
  return (
    <main className="space-y-14">
      <section className="rounded-3xl bg-gradient-to-br from-brand to-brand-dark p-12 text-white shadow-lg">
        <div className="max-w-2xl space-y-6">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            The AI newsletter for your Reddit saved items
          </h1>
          <p className="text-lg text-white/90">
            SavedDigest turns the backlog of posts and comments you saved on Reddit into a polished newsletter delivered on your cadence.
          </p>
          <Link
            href="/api/auth/signin"
            className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 font-semibold text-slate-900 shadow-lg transition hover:scale-[1.02]"
          >
            Sign in with Reddit
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
      <section className="grid gap-6 sm:grid-cols-3">
        {[
          {
            title: "Sync everything",
            body: "Pulls your entire saved history—no 1,000 item limit."
          },
          {
            title: "AI summaries",
            body: "Concise 2–3 sentence recaps for every post or comment."
          },
          {
            title: "Deliverability",
            body: "SendGrid-powered HTML with tracking and unsubscribe."
          }
        ].map((item) => (
          <div key={item.title} className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-sm">
            <h3 className="text-xl font-semibold">{item.title}</h3>
            <p className="mt-3 text-sm text-white/70">{item.body}</p>
          </div>
        ))}
      </section>
    </main>
  );
}
