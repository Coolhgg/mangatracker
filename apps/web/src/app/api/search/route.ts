import { NextRequest, NextResponse } from "next/server";

const BASE = process.env.MANGADEX_BASE_URL ?? "https://api.mangadex.org";

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 30;
const requestLog = new Map<string, number[]>();

function rateLimited(key: string): boolean {
  const now = Date.now();
  const arr = (requestLog.get(key) ?? []).filter((t)=> now - t < RATE_LIMIT_WINDOW_MS);
  arr.push(now);
  requestLog.set(key, arr);
  return arr.length > RATE_LIMIT_MAX;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim();
  if (!q) return NextResponse.json({ items: [] });
  const ip = req.headers.get("x-forwarded-for") ?? "anon";
  if (rateLimited(ip)) return NextResponse.json({ error: "Rate limit" }, { status: 429 });

  const url = new URL(`${BASE}/manga`);
  url.searchParams.set("title", q);
  url.searchParams.set("limit", "10");
  url.searchParams.append("includes[]", "cover_art");

  const res = await fetch(url.toString(), { cache: "no-store" });
  if (!res.ok) return NextResponse.json({ items: [] });
  const data = await res.json();
  const items = (data.data ?? []).map((d: any)=>{
    const id = d.id as string;
    const attrs = d.attributes ?? {};
    const title = attrs.title?.en || Object.values(attrs.title ?? {})[0] || "Untitled";
    const description = attrs.description?.en || Object.values(attrs.description ?? {})[0];
    let coverUrl: string | undefined;
    const rel = (d.relationships ?? []).find((r: any)=> r.type === "cover_art");
    if (rel?.attributes?.fileName) {
      coverUrl = `https://uploads.mangadex.org/covers/${id}/${rel.attributes.fileName}.256.jpg`;
    }
    return { sourceId: id, title, description, coverUrl };
  });
  return NextResponse.json({ items });
}
