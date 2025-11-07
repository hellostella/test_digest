import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/security/ratelimit-db";

const pixel = Buffer.from(
  "R0lGODlhAQABAIABAP///wAAACwAAAAAAQABAAACAkQBADs=",
  "base64"
);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const newsletterId = searchParams.get("nl");
  if (newsletterId) {
    const limiter = await checkRateLimit({ id: `open:${newsletterId}`, limit: 2000, windowMinutes: 10 });
    if (limiter.allowed) {
      await prisma.newsletter.updateMany({
        where: { id: newsletterId },
        data: { opens: { increment: 1 } }
      });
    }
  }
  return new NextResponse(pixel, {
    headers: {
      "Content-Type": "image/gif",
      "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0"
    }
  });
}
