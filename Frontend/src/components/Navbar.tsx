"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { API_BASE_URL } from "@/utils/api";

function IconHamburger() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="text-zinc-300">
      <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function IconSearch() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="text-zinc-300">
      <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function IconProfile() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="text-zinc-300">
      <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2" />
      <path d="M4 20c1.8-3.5 5-5 8-5s6.2 1.5 8 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [user, setUser] = useState<{ name?: string; email?: string } | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const profileRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();

  // Fetch user data
  useEffect(() => {
    fetch(`${API_BASE_URL}/auth/me`, {
      credentials: "include",
      headers: { Accept: "application/json" },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated && data.user) {
          setUser(data.user);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    }
    if (open || profileOpen) {
      document.addEventListener("mousedown", onClickOutside);
    }
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open, profileOpen]);

  const handleLogout = async () => {
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
      // Clear user state
      setUser(null);
      setProfileOpen(false);
      // Force a full page reload to clear all state
      window.location.href = "/";
    } catch (err) {
      console.error("Logout failed", err);
      // Even on error, redirect to home
      window.location.href = "/";
    }
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-800 bg-slate-900/90 backdrop-blur">
      <div className="mx-auto flex h-12 max-w-7xl items-center justify-between px-4">
        <div className="relative flex items-center gap-3" ref={menuRef}>
          <button
            aria-label="Menu"
            aria-expanded={open}
            aria-haspopup="menu"
            onClick={() => setOpen((v) => !v)}
            className="rounded p-1 hover:bg-zinc-900"
          >
            <IconHamburger />
          </button>
          {open && (
            <div
              role="menu"
              className="absolute left-0 top-11 w-64 overflow-hidden rounded-md border border-slate-800 bg-slate-900 shadow-xl"
            >
              <Link
                href="/dashboard"
                onClick={() => setOpen(false)}
                className="block px-4 py-3 text-sm text-zinc-200 hover:bg-slate-800"
                role="menuitem"
              >
                Dashboard
              </Link>
              <Link
                href="/trading"
                onClick={() => setOpen(false)}
                className="block px-4 py-3 text-sm text-zinc-200 hover:bg-slate-800"
                role="menuitem"
              >
                Trading Simulation
              </Link>
              <Link
                href="/investment"
                onClick={() => setOpen(false)}
                className="block px-4 py-3 text-sm text-zinc-200 hover:bg-slate-800"
                role="menuitem"
              >
                Investment Simulation
              </Link>
              <Link
                href="/economy"
                onClick={() => setOpen(false)}
                className="block px-4 py-3 text-sm text-zinc-200 hover:bg-slate-800"
                role="menuitem"
              >
                Economy
              </Link>
            </div>
          )}
          <Link href="/" className="text-lg font-semibold text-emerald-400">
            Safe Folio
          </Link>
        </div>

        <div className="hidden items-center gap-6 md:flex">
          <Link href="/dashboard" className="text-zinc-300 hover:text-white">
            Dashboard
          </Link>
          <Link href="/trading" className="text-zinc-300 hover:text-white">
            Trading
          </Link>
          <Link href="/investment" className="text-zinc-300 hover:text-white">
            Investment
          </Link>
          <Link href="/economy" className="text-zinc-300 hover:text-white">
            Economy
          </Link>
          <Link href="/watchlist" className="text-zinc-300 hover:text-white">
            Watchlist
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <button aria-label="Search" className="rounded p-1 hover:bg-zinc-900">
            <IconSearch />
          </button>
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="rounded p-1 hover:bg-zinc-900"
              aria-label="Profile"
            >
              <IconProfile />
            </button>
            {profileOpen && (
              <div className="absolute right-0 top-11 w-56 overflow-hidden rounded-md border border-slate-800 bg-slate-900 shadow-xl">
                <div className="border-b border-slate-800 px-4 py-3">
                  <div className="text-sm font-medium text-white">{user?.name || "User"}</div>
                  <div className="text-xs text-zinc-400">{user?.email || ""}</div>
                </div>
                <Link
                  href="/profile"
                  onClick={() => setProfileOpen(false)}
                  className="block px-4 py-3 text-sm text-zinc-200 hover:bg-slate-800"
                >
                  Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-3 text-sm text-zinc-200 hover:bg-slate-800"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

