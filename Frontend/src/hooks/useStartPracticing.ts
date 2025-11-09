"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "@/utils/api";

type SessionResponse = {
  authenticated: boolean;
  user: unknown;
};

export function useStartPracticing() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const start = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/me`, {
        method: "GET",
        credentials: "include",
        headers: {
          Accept: "application/json",
        },
        cache: "no-store",
      });

      if (!res.ok) {
        throw new Error(`Session check failed (${res.status})`);
      }

      const data = (await res.json()) as SessionResponse;
      if (data.authenticated) {
        router.push("/dashboard");
      } else {
        router.push("/login?redirect=%2Fdashboard");
      }
    } catch (err) {
      console.error("startPracticing error", err);
      setError("Unable to verify session. Redirecting to login.");
      router.push("/login?redirect=%2Fdashboard");
    } finally {
      setLoading(false);
    }
  }, [router]);

  return { start, loading, error };
}
