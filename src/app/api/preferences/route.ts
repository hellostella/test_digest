import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/auth";

const preferencesSchema = z.object({
  enabled: z.boolean().optional(),
  frequency: z.enum(["daily", "weekly", "monthly", "paused"]).optional(),
  timezone: z.string().min(2).optional(),
  aiEnabled: z.boolean().optional(),
  maxItems: z.number().min(1).max(100).optional(),
  maxPerSub: z.number().min(1).max(50).optional(),
  includeSubs: z.array(z.string()).optional(),
  excludeSubs: z.array(z.string()).optional(),
  sendHour: z.number().int().min(0).max(23).optional(),
  dayOfWeek: z.number().int().min(0).max(6).nullable().optional(),
  dayOfMonth: z.number().int().min(1).max(31).nullable().optional(),
  hasOnboarded: z.boolean().optional()
});

export async function POST(request: Request) {
  const session = await getCurrentSession();
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  const data = await request.json().catch(() => ({}));
  const parsed = preferencesSchema.safeParse(data);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const prefs = await prisma.userPreferences.upsert({
    where: { userId: session.user.id },
    update: parsed.data,
    create: {
      userId: session.user.id,
      ...parsed.data
    }
  });

  return NextResponse.json({ preferences: prefs });
}
