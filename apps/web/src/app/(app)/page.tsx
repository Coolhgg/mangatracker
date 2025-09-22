import Link from "next/link";
import { prisma } from "@mangatracker/db";
import { getServerSupabase } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = getServerSupabase();
  const { data: { session } } = await supabase.auth.getSession();
  const userId = session!.user.id;
  const tracked = await prisma.userSeries.findMany({
    where: { userId },
    include: { series: true },
    orderBy: { createdAt: "desc" }
  });
  return (
    <main className="mx-auto max-w-3xl p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Your tracked series</h1>
        <Link href="/add" className="rounded bg-blue-600 px-3 py-2 text-white hover:bg-blue-700">Add series</Link>
      </div>
      {tracked.length === 0 ? (
        <p className="text-gray-500">No series yet. Click "Add series" to start tracking.</p>
      ) : (
        <ul className="divide-y divide-gray-200 dark:divide-gray-800">
          {tracked.map((t) => (
            <li key={t.seriesId} className="py-4">
              <Link href={`/series/${t.seriesId}`} className="flex items-center gap-4">
                {t.series.coverUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={t.series.coverUrl} alt="cover" className="h-16 w-12 object-cover rounded" />
                ) : (
                  <div className="h-16 w-12 bg-gray-200 dark:bg-gray-800 rounded" />
                )}
                <div>
                  <div className="font-medium">{t.series.title}</div>
                  <div className="text-sm text-gray-500">Last synced: {t.series.lastSyncedAt ? new Date(t.series.lastSyncedAt).toLocaleString() : "Never"}</div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
