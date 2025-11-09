"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "@/utils/api";

export type AuthUser = {
  id: number;
  name?: string;
  email?: string;
  picture?: string;
  balance: number;
};

export function useRequireAuth(redirectTo?: string) {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const checkAuth = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/auth/me`, {
          credentials: "include",
          headers: {
            Accept: "application/json",
          },
          cache: "no-store",
        });
        const data = await res.json();
        if (!mounted) return;
        if (data.authenticated) {
          setUser(data.user);
        } else {
          const path = redirectTo || "/dashboard";
          router.replace(`/login?redirect=${encodeURIComponent(path)}`);
        }
      } catch (err) {
        console.error("Auth check failed", err);
        setError("Unable to verify session");
        const path = redirectTo || "/dashboard";
        router.replace(`/login?redirect=${encodeURIComponent(path)}`);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    checkAuth();
    return () => {
      mounted = false;
    };
  }, [redirectTo, router]);

  return { user, loading, error };
}
