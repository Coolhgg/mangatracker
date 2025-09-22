import { prisma } from "@mangatracker/db";
import { notFound } from "next/navigation";
import { getServerSupabase } from "@/lib/supabase/server";

export default async function SeriesDetail({ params }: { params: { id: string } }) {
  const series = await prisma.series.findUnique({ where: { id: params.id } });
  if (!series) notFound();
  const chapters = await prisma.chapter.findMany({ where: { seriesId: series.id }, orderBy: [{ publishedAt: "desc" }] });
  const supabase = getServerSupabase();
  const { data: { session } } = await supabase.auth.getSession();
  const userId = session!.user.id;
  const read = await prisma.readingProgress.findMany({ where: { userId, seriesId: series.id } });
  const readSet = new Set(read.map(r=>r.chapterId));
  return (
    <main className="mx-auto max-w-3xl p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{series.title}</h1>
          <div className="text-sm text-gray-500">Last synced: {series.lastSyncedAt ? new Date(series.lastSyncedAt).toLocaleString() : "Never"}</div>
        </div>
        <form action={`/api/series/${series.id}/sync`} method="post">
          <button className="rounded bg-blue-600 px-3 py-2 text-white hover:bg-blue-700">Sync now</button>
        </form>
      </div>
      <ul className="divide-y divide-gray-200 dark:divide-gray-800">
        {chapters.map((c)=> (
          <li key={c.id} className="py-3 flex items-center justify-between">
            <div>
              <div className="font-medium">Ch. {c.number}{c.title ? ` - ${c.title}`: ''}</div>
              {c.publishedAt && <div className="text-sm text-gray-500">{new Date(c.publishedAt).toLocaleDateString()}</div>}
            </div>
            <form action={`/api/chapters/${c.id}/toggle-read`} method="post">
              <button className={`rounded px-3 py-1 text-sm ${readSet.has(c.id) ? 'bg-green-600 text-white' : 'bg-gray-200 dark:bg-gray-800'}`}>{readSet.has(c.id) ? 'Read' : 'Mark read'}</button>
            </form>
          </li>
        ))}
      </ul>
    </main>
  );
}
