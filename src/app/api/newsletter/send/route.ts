import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { env } from "@/lib/env";
import { buildNewsletter } from "@/lib/newsletter/generate";
import { runScheduler } from "@/lib/newsletter/scheduler";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const preview = searchParams.get("preview") === "1";
  const secret = searchParams.get("secret");

  if (secret && secret === env.CRON_SECRET) {
    const result = await runScheduler();
    return NextResponse.json(result);
  }

  const session = await getCurrentSession();
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const result = await buildNewsletter({ userId: session.user.id, preview, send: !preview });
  return NextResponse.json(result);
}
