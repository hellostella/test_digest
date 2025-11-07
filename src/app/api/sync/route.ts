import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/auth";
import { syncRedditSaves } from "@/lib/providers/reddit/sync";

export async function POST() {
  const session = await getCurrentSession();
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { accounts: true }
  });
  if (!user) {
    return new NextResponse("User not found", { status: 404 });
  }
  try {
    const result = await syncRedditSaves(user);
    return NextResponse.json({ status: "ok", result });
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? "Failed" }, { status: 500 });
  }
}
