import { NextResponse } from "next/server";
import { env } from "@/lib/env";
import { checkRateLimit } from "@/lib/security/ratelimit-db";
import { runScheduler } from "@/lib/newsletter/scheduler";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");
  if (secret !== env.CRON_SECRET) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const limiter = await checkRateLimit({ id: "scheduler", limit: 20, windowMinutes: 1 });
  if (!limiter.allowed) {
    return new NextResponse("Too Many Requests", {
      status: 429,
      headers: {
        "Retry-After": String(limiter.retryAfter ?? 60)
      }
    });
  }

  const result = await runScheduler();
  return NextResponse.json(result);
}
