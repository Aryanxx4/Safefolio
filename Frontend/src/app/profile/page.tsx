"use client";

import { useState } from "react";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { API_BASE_URL } from "@/utils/api";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const { user, loading } = useRequireAuth("/profile");
  const [resetting, setResetting] = useState(false);
  const [resetMessage, setResetMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const router = useRouter();

  const handleReset = async () => {
    if (!confirm("Are you sure you want to reset your profile? This will:\n- Reset balance to ₹100,000\n- Delete all positions\n- Delete all transactions\n- Reset simulation dates\n\nThis action cannot be undone.")) {
      return;
    }

    setResetting(true);
    setResetMessage(null);
    try {
      const res = await fetch(`${API_BASE_URL}/portfolio/reset`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to reset profile");
      }

      setResetMessage({ type: "success", text: data.message || "Profile reset successfully!" });
      // Reload page after 2 seconds
      setTimeout(() => {
        router.refresh();
        window.location.reload();
      }, 2000);
    } catch (err: any) {
      setResetMessage({ type: "error", text: err.message || "Failed to reset profile" });
    } finally {
      setResetting(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-8">
        <div className="text-zinc-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <h1 className="text-2xl font-semibold">Profile</h1>
      <div className="mt-6 rounded-lg border border-slate-800 bg-slate-900/60 p-6">
        <div className="space-y-4">
          <div>
            <label className="text-sm text-zinc-400">Name</label>
            <div className="mt-1 text-lg font-medium text-white">{user?.name || "Not set"}</div>
          </div>
          <div>
            <label className="text-sm text-zinc-400">Email</label>
            <div className="mt-1 text-lg font-medium text-white">{user?.email || "Not set"}</div>
          </div>
          <div>
            <label className="text-sm text-zinc-400">Balance</label>
            <div className="mt-1 text-lg font-medium text-emerald-400">
              ₹{user?.balance?.toLocaleString("en-IN") || "0.00"}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-lg border border-red-500/40 bg-red-500/10 p-6">
        <h2 className="text-lg font-semibold text-red-300">Reset Profile</h2>
        <p className="mt-2 text-sm text-zinc-400">
          Reset your profile to start fresh. This will restore your balance to ₹100,000 and clear all positions and transactions.
        </p>
        {resetMessage && (
          <div className={`mt-4 rounded-lg border px-3 py-2 text-sm ${
            resetMessage.type === "success" 
              ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300" 
              : "border-red-500/40 bg-red-500/10 text-red-300"
          }`}>
            {resetMessage.text}
          </div>
        )}
        <button
          onClick={handleReset}
          disabled={resetting}
          className="mt-4 rounded bg-red-500/90 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {resetting ? "Resetting..." : "Reset Profile"}
        </button>
      </div>
    </div>
  );
}

