import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/security/ratelimit-db";

export async function GET(request: NextRequest) {
  const newsletterId = request.nextUrl.searchParams.get("nl");
  const savedId = request.nextUrl.searchParams.get("sid");
  const target = request.nextUrl.searchParams.get("u");
  if (!target) {
    return new NextResponse("Missing target", { status: 400 });
  }
  if (newsletterId) {
    const limiter = await checkRateLimit({ id: `click:${newsletterId}`, limit: 4000, windowMinutes: 10 });
    if (limiter.allowed) {
      await prisma.newsletter.updateMany({
        where: { id: newsletterId },
        data: { clicks: { increment: 1 } }
      });
      if (savedId) {
        await prisma.newsletterItem.updateMany({
          where: { newsletterId, savedContentId: savedId },
          data: { clicks: { increment: 1 } }
        });
        await prisma.savedContent.updateMany({
          where: { id: savedId },
          data: { clicks: { increment: 1 } }
        });
      }
    }
  }
  return NextResponse.redirect(target, 302);
}
