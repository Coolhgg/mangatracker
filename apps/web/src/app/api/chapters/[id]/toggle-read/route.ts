import { NextRequest, NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabase/server";
import { prisma } from "@mangatracker/db";
import { randomUUID } from "crypto";

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = getServerSupabase();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const chapter = await prisma.chapter.findUnique({ where: { id: params.id } });
  if (!chapter) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const existing = await prisma.readingProgress.findUnique({ where: { userId_chapterId: { userId: session.user.id, chapterId: chapter.id } } as any });
  if (existing) {
    await prisma.readingProgress.delete({ where: { id: existing.id } });
    return NextResponse.json({ read: false });
  } else {
    await prisma.readingProgress.create({ data: { id: randomUUID(), userId: session.user.id, seriesId: chapter.seriesId, chapterId: chapter.id } });
    return NextResponse.json({ read: true });
  }
}
