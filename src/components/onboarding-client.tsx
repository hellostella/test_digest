"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const defaultPrefs = {
  frequency: "weekly",
  sendHour: 9,
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone ?? "America/New_York"
};

export default function OnboardingClient() {
  const [frequency, setFrequency] = useState(defaultPrefs.frequency);
  const [sendHour, setSendHour] = useState(defaultPrefs.sendHour);
  const [timezone, setTimezone] = useState(defaultPrefs.timezone);
  const [status, setStatus] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (tz) setTimezone(tz);
  }, []);

  async function savePreferences(preview: boolean) {
    setIsLoading(true);
    setStatus(null);
    await fetch("/api/preferences", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ frequency, sendHour, timezone, hasOnboarded: true })
    });
    await fetch("/api/sync", { method: "POST" });
    const res = await fetch(`/api/newsletter/send?${preview ? "preview=1" : ""}`);
    const data = await res.json();
    setStatus(preview ? "Preview generated" : "Newsletter sent");
    if (!preview) {
      router.push("/dashboard");
    }
    setIsLoading(false);
    return data;
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold">Let&apos;s set up your digest</h1>
        <p className="text-white/70">Choose when to receive your newsletter. You can tweak these any time.</p>
      </header>
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-6">
        <label className="block space-y-2">
          <span className="text-sm text-white/70">Frequency</span>
          <select
            className="w-full rounded-lg border border-white/10 bg-slate-900/60 px-3 py-2"
            value={frequency}
            onChange={(e) => setFrequency(e.target.value)}
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="paused">Paused</option>
          </select>
        </label>
        <label className="block space-y-2">
          <span className="text-sm text-white/70">Send hour</span>
          <input
            type="number"
            min={0}
            max={23}
            className="w-full rounded-lg border border-white/10 bg-slate-900/60 px-3 py-2"
            value={sendHour}
            onChange={(e) => setSendHour(Number(e.target.value))}
          />
        </label>
        <label className="block space-y-2">
          <span className="text-sm text-white/70">Timezone</span>
          <input
            type="text"
            className="w-full rounded-lg border border-white/10 bg-slate-900/60 px-3 py-2"
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
          />
        </label>
      </div>
      <div className="flex flex-wrap gap-3">
        <button
          className="rounded-full bg-brand px-5 py-2 text-sm font-semibold text-white shadow-lg transition hover:bg-brand-dark disabled:opacity-50"
          disabled={isLoading}
          onClick={() => savePreferences(false)}
        >
          Send this to my email
        </button>
        <button
          className="rounded-full border border-white/20 px-5 py-2 text-sm font-semibold text-white/80 transition hover:border-white/40"
          disabled={isLoading}
          onClick={() => savePreferences(true)}
        >
          Build preview
        </button>
      </div>
      {status && <p className="text-sm text-emerald-400">{status}</p>}
    </div>
  );
}
