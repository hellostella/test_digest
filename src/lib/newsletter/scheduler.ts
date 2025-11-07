import { prisma } from "@/lib/prisma";
import { env } from "@/lib/env";
import { differenceInHours } from "date-fns";
import { utcToZonedTime, zonedTimeToUtc } from "date-fns-tz";
import { buildNewsletter } from "@/lib/newsletter/generate";
import { enqueueSend } from "@/lib/queue/qstash";

function shouldSendNow(prefs: {
  enabled: boolean;
  frequency: string;
  sendHour: number;
  timezone: string;
  lastSentAt: Date | null;
  dayOfWeek: number | null;
  dayOfMonth: number | null;
}) {
  if (!prefs.enabled || prefs.frequency === "paused") return false;
  const now = new Date();
  const zonedNow = utcToZonedTime(now, prefs.timezone);
  const target = zonedTimeToUtc(
    `${zonedNow.getFullYear()}-${String(zonedNow.getMonth() + 1).padStart(2, "0")}-${String(zonedNow.getDate()).padStart(2, "0")}T${
      String(prefs.sendHour).padStart(2, "0")
    }:00:00`,
    prefs.timezone
  );
  if (prefs.lastSentAt && differenceInHours(now, prefs.lastSentAt) < 20) return false;
  if (prefs.frequency === "daily") {
    return now >= target;
  }
  if (prefs.frequency === "weekly") {
    const dow = zonedNow.getDay();
    if (dow !== (prefs.dayOfWeek ?? 1)) return false;
    return now >= target;
  }
  if (prefs.frequency === "monthly") {
    const dom = zonedNow.getDate();
    if (dom !== (prefs.dayOfMonth ?? 1)) return false;
    return now >= target;
  }
  return false;
}

export async function runScheduler() {
  const guardKey = "scheduler:last-run";
  const lastRun = await prisma.systemKV.findUnique({ where: { key: guardKey } });
  if (lastRun) {
    const last = new Date(lastRun.value);
    const diff = (Date.now() - last.getTime()) / 60000;
    if (diff < env.SCHEDULER_MIN_INTERVAL_MINUTES) {
      return { skipped: true, reason: "rate_limited" };
    }
  }

  await prisma.systemKV.upsert({
    where: { key: guardKey },
    update: { value: new Date().toISOString() },
    create: { key: guardKey, value: new Date().toISOString() }
  });

  const users = await prisma.user.findMany({
    include: { preferences: true }
  });

  const due: string[] = [];
  for (const user of users) {
    const prefs = user.preferences;
    if (!prefs) continue;
    if (
      shouldSendNow({
        enabled: prefs.enabled,
        frequency: prefs.frequency,
        sendHour: prefs.sendHour,
        timezone: prefs.timezone,
        lastSentAt: prefs.lastSentAt,
        dayOfWeek: prefs.dayOfWeek ?? null,
        dayOfMonth: prefs.dayOfMonth ?? null
      })
    ) {
      due.push(user.id);
    }
  }

  for (const userId of due) {
    const enqueued = await enqueueSend(userId);
    if (!enqueued) {
      await buildNewsletter({ userId, send: true });
    }
  }

  return { skipped: false, processed: due.length };
}
