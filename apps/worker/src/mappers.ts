export function mapSeries(d: any) {
  const id = d.id as string;
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

export function mapChapter(d: any) {
  const attrs = d.attributes ?? {};
  return {
    id: d.id as string,
    number: (attrs.chapter ?? "?") as string,
    title: (attrs.title ?? undefined) as string | undefined,
    publishedAt: attrs.publishAt ? new Date(attrs.publishAt) : undefined,
  };
}
