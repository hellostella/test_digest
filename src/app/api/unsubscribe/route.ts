import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function reverse(str: string) {
  return str.split("").reverse().join("");
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const uid = searchParams.get("u");
  const token = searchParams.get("t");
  if (!uid || !token || reverse(uid) !== token) {
    return new NextResponse("Invalid token", { status: 400 });
  }
  await prisma.userPreferences.updateMany({
    where: { userId: uid },
    data: { enabled: false, frequency: "paused" }
  });
  return NextResponse.json({ status: "unsubscribed" });
}
