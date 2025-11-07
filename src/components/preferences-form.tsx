"use client";

import { useState } from "react";

type Preferences = {
  enabled: boolean;
  frequency: string;
  timezone: string;
  sendHour: number;
  dayOfWeek?: number | null;
  dayOfMonth?: number | null;
  aiEnabled: boolean;
  maxItems: number;
  maxPerSub: number;
  includeSubs: string[];
  excludeSubs: string[];
};

type Props = {
  initial: Preferences;
};

export default function PreferencesForm({ initial }: Props) {
  const [prefs, setPrefs] = useState(initial);
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function update<K extends keyof Preferences>(key: K, value: Preferences[K]) {
    setPrefs((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setStatus(null);
    await fetch("/api/preferences", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(prefs)
    });
    setStatus("Preferences saved");
    setLoading(false);
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-1 text-sm text-white/70">
          <span>Status</span>
          <select
            className="w-full rounded-lg border border-white/10 bg-slate-900/60 px-3 py-2"
            value={prefs.enabled ? "enabled" : "disabled"}
            onChange={(e) => update("enabled", e.target.value === "enabled")}
          >
            <option value="enabled">Automation enabled</option>
            <option value="disabled">Paused</option>
          </select>
        </label>
        <label className="space-y-1 text-sm text-white/70">
          <span>Frequency</span>
          <select
            className="w-full rounded-lg border border-white/10 bg-slate-900/60 px-3 py-2"
            value={prefs.frequency}
            onChange={(e) => update("frequency", e.target.value)}
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="paused">Paused</option>
          </select>
        </label>
        <label className="space-y-1 text-sm text-white/70">
          <span>Send hour</span>
          <input
            type="number"
            min={0}
            max={23}
            className="w-full rounded-lg border border-white/10 bg-slate-900/60 px-3 py-2"
            value={prefs.sendHour}
            onChange={(e) => update("sendHour", Number(e.target.value))}
          />
        </label>
        <label className="space-y-1 text-sm text-white/70">
          <span>Timezone</span>
          <input
            type="text"
            className="w-full rounded-lg border border-white/10 bg-slate-900/60 px-3 py-2"
            value={prefs.timezone}
            onChange={(e) => update("timezone", e.target.value)}
          />
        </label>
        <label className="space-y-1 text-sm text-white/70">
          <span>Day of week (0-6)</span>
          <input
            type="number"
            min={0}
            max={6}
            className="w-full rounded-lg border border-white/10 bg-slate-900/60 px-3 py-2"
            value={prefs.dayOfWeek ?? ""}
            onChange={(e) => update("dayOfWeek", e.target.value ? Number(e.target.value) : null)}
          />
        </label>
        <label className="space-y-1 text-sm text-white/70">
          <span>Day of month (1-31)</span>
          <input
            type="number"
            min={1}
            max={31}
            className="w-full rounded-lg border border-white/10 bg-slate-900/60 px-3 py-2"
            value={prefs.dayOfMonth ?? ""}
            onChange={(e) => update("dayOfMonth", e.target.value ? Number(e.target.value) : null)}
          />
        </label>
        <label className="space-y-1 text-sm text-white/70">
          <span>Max items</span>
          <input
            type="number"
            min={1}
            max={100}
            className="w-full rounded-lg border border-white/10 bg-slate-900/60 px-3 py-2"
            value={prefs.maxItems}
            onChange={(e) => update("maxItems", Number(e.target.value))}
          />
        </label>
        <label className="space-y-1 text-sm text-white/70">
          <span>Max per subreddit</span>
          <input
            type="number"
            min={1}
            max={50}
            className="w-full rounded-lg border border-white/10 bg-slate-900/60 px-3 py-2"
            value={prefs.maxPerSub}
            onChange={(e) => update("maxPerSub", Number(e.target.value))}
          />
        </label>
        <label className="space-y-1 text-sm text-white/70">
          <span>Include subreddits (comma separated)</span>
          <input
            type="text"
            className="w-full rounded-lg border border-white/10 bg-slate-900/60 px-3 py-2"
            value={prefs.includeSubs.join(", ")}
            onChange={(e) => update("includeSubs", e.target.value.split(",").map((s) => s.trim()).filter(Boolean))}
          />
        </label>
        <label className="space-y-1 text-sm text-white/70">
          <span>Exclude subreddits (comma separated)</span>
          <input
            type="text"
            className="w-full rounded-lg border border-white/10 bg-slate-900/60 px-3 py-2"
            value={prefs.excludeSubs.join(", ")}
            onChange={(e) => update("excludeSubs", e.target.value.split(",").map((s) => s.trim()).filter(Boolean))}
          />
        </label>
        <label className="flex items-center gap-2 text-sm text-white/70">
          <input
            type="checkbox"
            checked={prefs.aiEnabled}
            onChange={(e) => update("aiEnabled", e.target.checked)}
          />
          AI summaries
        </label>
      </div>
      <button
        type="submit"
        disabled={loading}
        className="rounded-full bg-brand px-5 py-2 text-sm font-semibold text-white shadow-lg transition hover:bg-brand-dark disabled:opacity-50"
      >
        Save changes
      </button>
      {status && <p className="text-sm text-emerald-400">{status}</p>}
    </form>
  );
}
