import { NextResponse } from "next/server";
import { env } from "@/lib/env";
import { buildNewsletter } from "@/lib/newsletter/generate";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("u");
  const auth = request.headers.get("authorization") ?? "";
  if (auth !== `Bearer ${env.CRON_SECRET}`) {
    return new NextResponse("Forbidden", { status: 403 });
  }
  if (!userId) {
    return NextResponse.json({ error: "Missing user" }, { status: 400 });
  }
  const result = await buildNewsletter({ userId, send: true });
  return NextResponse.json(result);
}
