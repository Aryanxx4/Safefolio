"use client";

import Link from "next/link";
import { useStartPracticing } from "@/hooks/useStartPracticing";
import { API_BASE_URL } from "@/utils/api";

export default function SiteFooter() {
  const { start, loading } = useStartPracticing();
  const googleAuthUrl = `${API_BASE_URL}/auth/google`;

  return (
    <footer className="relative overflow-hidden border-t border-slate-800 bg-gradient-to-b from-slate-950 via-slate-950 to-black">
      {/* CTA Section */}
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="text-center">
          <h3 className="text-3xl font-semibold">Start your trading journey today — risk-free</h3>
          <p className="mt-4 text-zinc-300">
            Join thousands learning to trade safely with virtual cash and real market data.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <button
              type="button"
              onClick={start}
              disabled={loading}
              className="rounded-lg bg-emerald-500/90 px-8 py-3 font-medium text-black shadow-lg shadow-emerald-500/40 transition-all hover:bg-emerald-400 hover:shadow-[0_0_32px_rgba(16,185,129,0.6)] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? "Checking..." : "Start Practicing"}
            </button>
            <Link
              href={googleAuthUrl}
              prefetch={false}
              className="rounded-lg border border-emerald-400/60 bg-slate-900/50 px-8 py-3 font-medium text-emerald-300 transition-all hover:bg-emerald-400/10 hover:border-emerald-400"
            >
              Join for Free
            </Link>
          </div>
        </div>
      </div>

      {/* Footer Links */}
      <div className="border-t border-slate-800/50 bg-slate-950/60">
        <div className="mx-auto max-w-6xl px-6 py-6">
          <div className="flex flex-col items-center justify-between gap-4 text-sm text-zinc-400 md:flex-row">
            <div className="text-center md:text-left">
              <p>Powered by historical market data | Built for learners & strategists</p>
            </div>
            <div className="flex items-center gap-4">
              <Link className="hover:text-zinc-200 transition-colors" href="#">
                About
              </Link>
              <span className="text-zinc-600">|</span>
              <Link
                className="hover:text-zinc-200 transition-colors"
                href="https://github.com/Aryanxx4"
                target="_blank"
                rel="noopener noreferrer"
              >
                Documentation
              </Link>
              <span className="text-zinc-600">|</span>
              <Link
                className="hover:text-zinc-200 transition-colors"
                href="mailto:delhi1.aryan@gmail.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                Contact
              </Link>
              <span className="text-zinc-600">|</span>
              <Link
                className="hover:text-zinc-200 transition-colors"
                href="https://github.com/Aryanxx4"
                target="_blank"
                rel="noopener noreferrer"
              >
                GitHub
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

