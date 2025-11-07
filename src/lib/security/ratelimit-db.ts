import { addMinutes, isBefore } from "date-fns";
import { prisma } from "@/lib/prisma";

const WINDOW_KEY_PREFIX = "ratelimit:";

export async function checkRateLimit({
  id,
  windowMinutes,
  limit
}: {
  id: string;
  windowMinutes: number;
  limit: number;
}) {
  const key = `${WINDOW_KEY_PREFIX}${id}`;
  const now = new Date();
  const existing = await prisma.systemKV.findUnique({ where: { key } });
  if (!existing) {
    await prisma.systemKV.create({
      data: { key, value: JSON.stringify({ count: 1, reset: addMinutes(now, windowMinutes).toISOString() }) }
    });
    return { allowed: true, remaining: limit - 1 };
  }
  const payload = JSON.parse(existing.value) as { count: number; reset: string };
  const reset = new Date(payload.reset);
  if (isBefore(reset, now)) {
    await prisma.systemKV.update({
      where: { key },
      data: { value: JSON.stringify({ count: 1, reset: addMinutes(now, windowMinutes).toISOString() }) }
    });
    return { allowed: true, remaining: limit - 1 };
  }
  if (payload.count >= limit) {
    return { allowed: false, remaining: 0, retryAfter: Math.ceil((reset.getTime() - now.getTime()) / 1000) };
  }
  await prisma.systemKV.update({
    where: { key },
    data: { value: JSON.stringify({ count: payload.count + 1, reset: reset.toISOString() }) }
  });
  return { allowed: true, remaining: limit - payload.count - 1, retryAfter: Math.ceil((reset.getTime() - now.getTime()) / 1000) };
}
