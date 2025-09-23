import { NextRequest, NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabase/server";
import { getSyncQueue } from "@/lib/queue";

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = getServerSupabase();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const queue = getSyncQueue();
  await queue.add("sync", { seriesId: params.id }, { jobId: `sync:${params.id}:now`, removeOnComplete: true, removeOnFail: 50 });
  return NextResponse.json({ ok: true });
}
