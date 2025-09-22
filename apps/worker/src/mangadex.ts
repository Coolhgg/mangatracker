import { request } from "undici";

const BASE = process.env.MANGADEX_BASE_URL ?? "https://api.mangadex.org";

export type MangaDexSeries = {
  id: string;
  title: string;
  description?: string;
  coverUrl?: string;
};

export type MangaDexChapter = {
  id: string;
  number: string;
  title?: string;
  publishedAt?: Date;
};

export async function fetchSeries(id: string): Promise<MangaDexSeries> {
  const url = new URL(`${BASE}/manga/${id}`);
  url.searchParams.append("includes[]", "cover_art");
  const res = await request(url.toString());
  if (res.statusCode !== 200) throw new Error(`MangaDex series ${id} status ${res.statusCode}`);
  const data: any = await res.body.json();
  const d = data.data;
  const attrs = d.attributes ?? {};
  const title: string = attrs.title?.en || Object.values(attrs.title ?? {})[0] || "Untitled";
  const description: string | undefined = attrs.description?.en || Object.values(attrs.description ?? {})[0];
  let coverUrl: string | undefined;
  const rel = (d.relationships ?? []).find((r: any)=> r.type === "cover_art");
  if (rel?.attributes?.fileName) {
    coverUrl = `https://uploads.mangadex.org/covers/${id}/${rel.attributes.fileName}.512.jpg`;
  }
  return { id, title, description, coverUrl };
}

export async function fetchChaptersAll(id: string): Promise<MangaDexChapter[]> {
  const items: MangaDexChapter[] = [];
  let limit = 100;
  let offset = 0;
  // English feed by default
  while (true) {
    const url = new URL(`${BASE}/manga/${id}/feed`);
    url.searchParams.set("limit", String(limit));
    url.searchParams.set("offset", String(offset));
    url.searchParams.append("translatedLanguage[]", "en");
    url.searchParams.append("order[publishAt]", "desc");
    const res = await request(url.toString());
    if (res.statusCode !== 200) throw new Error(`MangaDex chapters ${id} status ${res.statusCode}`);
    const data: any = await res.body.json();
    const list = data.data ?? [];
    for (const d of list) {
      const attrs = d.attributes ?? {};
      const ch: MangaDexChapter = {
        id: d.id,
        number: attrs.chapter ?? "?",
        title: attrs.title ?? undefined,
        publishedAt: attrs.publishAt ? new Date(attrs.publishAt) : undefined,
      };
      items.push(ch);
    }
    if (!data.total) break;
    offset += list.length;
    if (offset >= data.total) break;
  }
  return items;
}
