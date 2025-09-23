"use client";
import React, { useState } from "react";
import Link from "next/link";

type SearchResult = {
  sourceId: string;
  title: string;
  description?: string;
  coverUrl?: string;
};

export default function AddPage() {
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  const onSearch = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setResults(data.items ?? []);
    } catch (e) {
      setMessage("Failed to search");
    } finally {
      setLoading(false);
    }
  };

  const onTrack = async (sourceIdOrUrl: string) => {
    setLoading(true);
    setMessage(null);
    try {
      const body: any = {};
      if (sourceIdOrUrl.startsWith("http")) body.url = sourceIdOrUrl; else body.sourceId = sourceIdOrUrl;
      const res = await fetch("/api/series", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (!res.ok) throw new Error("Failed to track");
      const { id } = await res.json();
      window.location.href = `/series/${id}`;
    } catch (e) {
      setMessage("Failed to track series");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto max-w-3xl p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Add series</h1>
        <Link href="/" className="text-blue-600 hover:underline">Back</Link>
      </div>
      <div className="space-y-2">
        <label className="block text-sm font-medium">MangaDex URL or search query</label>
        <input value={q} onChange={(e)=>setQ(e.target.value)} placeholder="https://mangadex.org/title/... or One Piece" className="w-full rounded border px-3 py-2 dark:bg-gray-900" />
        <div className="flex gap-2">
          <button onClick={onSearch} disabled={loading} className="rounded bg-blue-600 px-3 py-2 text-white hover:bg-blue-700 disabled:opacity-50">Search</button>
          <button onClick={()=>onTrack(q)} disabled={loading} className="rounded bg-green-600 px-3 py-2 text-white hover:bg-green-700 disabled:opacity-50">Track by URL/ID</button>
        </div>
        {message && <p className="text-red-600">{message}</p>}
      </div>
      <ul className="divide-y divide-gray-200 dark:divide-gray-800">
        {results.map((r)=> (
          <li key={r.sourceId} className="py-4 flex items-center gap-4">
            {r.coverUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={r.coverUrl} alt="cover" className="h-16 w-12 object-cover rounded" />
            ) : (<div className="h-16 w-12 bg-gray-200 dark:bg-gray-800 rounded" />)}
            <div className="flex-1">
              <div className="font-medium">{r.title}</div>
              {r.description && <div className="text-sm text-gray-500 line-clamp-2">{r.description}</div>}
            </div>
            <button onClick={()=>onTrack(r.sourceId)} className="rounded bg-blue-600 px-3 py-2 text-white hover:bg-blue-700">Track</button>
          </li>
        ))}
      </ul>
    </main>
  );
}
