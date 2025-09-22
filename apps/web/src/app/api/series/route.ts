import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@mangatracker/db";
import { getServerSupabase } from "@/lib/supabase/server";
import { getSyncQueue } from "@/lib/queue";

const BodySchema = z.object({
  url: z.string().url().optional(),
  sourceId: z.string().optional(),
}).refine((d)=> !!d.url || !!d.sourceId, { message: "url or sourceId required" });

function parseMangaDexIdFromUrl(url: string): string | null {
  try {
    const u = new URL(url);
    // Accept mangadex.org/title/{id}
    const parts = u.pathname.split("/").filter(Boolean);
    const idx = parts.indexOf("title");
    if (idx >= 0 && parts[idx+1]) return parts[idx+1];
    return null;
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  const supabase = getServerSupabase();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.message }, { status: 400 });
  const input = parsed.data;
  const sourceId = input.sourceId ?? parseMangaDexIdFromUrl(input.url!) ?? undefined;
  if (!sourceId) return NextResponse.json({ error: "Invalid MangaDex URL" }, { status: 400 });

  const series = await prisma.series.upsert({
    where: { source_sourceId: { source: "MANGADEX", sourceId } } as any,
    create: { source: "MANGADEX", sourceId, title: "Unknown" },
    update: {}
  });

  await prisma.userSeries.upsert({
    where: { userId_seriesId: { userId: session.user.id, seriesId: series.id } } as any,
    create: { userId: session.user.id, seriesId: series.id },
    update: {}
  });

  const queue = getSyncQueue();
  await queue.add("sync", { seriesId: series.id }, { jobId: `sync:${series.id}:now`, removeOnComplete: true, removeOnFail: 50 });

  return NextResponse.json({ id: series.id });
}
