"use client";
import { useState } from "react";
import { getBrowserSupabase } from "@/lib/supabase/client";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const supabase = getBrowserSupabase();

  const signInMagic = async () => {
    setMessage(null);
    const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: `${window.location.origin}/` } });
    if (error) setMessage(error.message); else setMessage("Check your email for the magic link.");
  };

  const signInGitHub = async () => {
    setMessage(null);
    const { error } = await supabase.auth.signInWithOAuth({ provider: "github", options: { redirectTo: `${window.location.origin}/` } });
    if (error) setMessage(error.message);
  };

  return (
    <main className="mx-auto max-w-md p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Sign in</h1>
      <div className="space-y-2">
        <label className="block text-sm font-medium">Email</label>
        <input value={email} onChange={(e)=>setEmail(e.target.value)} type="email" placeholder="you@example.com" className="w-full rounded border px-3 py-2 dark:bg-gray-900" />
        <button onClick={signInMagic} className="rounded bg-blue-600 px-3 py-2 text-white hover:bg-blue-700">Send magic link</button>
      </div>
      <div className="text-center text-sm text-gray-500">or</div>
      <button onClick={signInGitHub} className="rounded bg-gray-900 px-3 py-2 text-white hover:opacity-90">Sign in with GitHub</button>
      {message && <p className="text-sm text-red-600">{message}</p>}
    </main>
  );
}
