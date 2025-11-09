"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { API_BASE_URL } from "@/utils/api";

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const googleUrl = `${API_BASE_URL}/auth/google`;

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("error")) {
      setError("Authentication failed. Please try again.");
    }
  }, []);

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col justify-center px-6 py-12">
      <h1 className="text-3xl font-semibold">Sign in to continue</h1>
      <p className="mt-2 text-zinc-300">Use your Google account to start practicing.</p>
      {error && <p className="mt-4 rounded border border-red-500/40 bg-red-500/10 px-4 py-2 text-sm text-red-300">{error}</p>}

      <div className="mt-8 space-y-3">
        <Link
          href={googleUrl}
          prefetch={false}
          className="block rounded-lg bg-emerald-500/90 px-4 py-3 text-center font-medium text-black transition hover:bg-emerald-400"
        >
          Continue with Google
        </Link>
        <p className="text-sm text-zinc-400">We’ll redirect you back once you’re authenticated.</p>
      </div>
    </div>
  );
}
