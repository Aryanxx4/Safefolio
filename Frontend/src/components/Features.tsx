"use client";

const primaryCards = [
  { title: "Learn Trading Concepts", desc: "Understand orders, PnL, portfolio allocation, and more." },
  { title: "Practice Risk-Free", desc: "Trade with virtual cash using real market data." },
];

const secondaryCards = [
  { title: "Get Strategy Feedback", desc: "See your equity curve and performance instantly." },
  { title: "Time Machine Mode", desc: "Relive 2008 crash, 2020 recovery & more." },
];

function IconChart() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-emerald-400">
      <path d="M3 3v18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M7 12l4-4 4 4 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconShield() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-emerald-400">
      <path d="M12 2L4 5v7c0 5.5 3.8 10.7 8 12 4.2-1.3 8-6.5 8-12V5l-8-3z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconTrending() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-emerald-400">
      <path d="M23 6l-9.5 9.5-5-5L1 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M17 6h6v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconClock() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-emerald-400">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
      <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

const icons = [IconChart, IconShield, IconTrending, IconClock];

export default function Features() {
  return (
    <section className="relative mx-auto max-w-6xl px-6 py-20">
      {/* Section transition divider */}
      <div className="absolute -top-px left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent" />
      
      <div>
        <h2 className="text-3xl font-semibold">What you'll learn</h2>
        <p className="mt-2 text-zinc-400">
          Learn by Doing — Explore the Core Skills That Make You a Smarter Trader
        </p>
      </div>

      {/* Primary Cards */}
      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
        {primaryCards.map((card, idx) => {
          const Icon = icons[idx];
          return (
            <div
              key={card.title}
              className="group relative overflow-hidden rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-slate-900/90 via-slate-900/80 to-emerald-950/20 p-6 shadow-lg shadow-emerald-500/10 transition-all duration-300 hover:-translate-y-1 hover:border-emerald-400/60 hover:shadow-[0_0_32px_rgba(16,185,129,0.3)]"
            >
              {/* Animated glow on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/0 via-emerald-500/0 to-emerald-500/0 transition-opacity duration-300 group-hover:from-emerald-500/10 group-hover:via-emerald-500/5 group-hover:to-emerald-500/0" />
              <div className="relative">
                <div className="flex items-start gap-4">
                  <div className="rounded-lg bg-emerald-500/10 p-3 group-hover:bg-emerald-500/20 transition-colors">
                    <Icon />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold">{card.title}</h3>
                    <p className="mt-2 text-zinc-300">{card.desc}</p>
                    {/* Progress indicator */}
                    <div className="mt-4 flex items-center gap-2 text-xs text-emerald-400">
                      <span>Beginner</span>
                      <div className="h-1 flex-1 rounded-full bg-slate-800">
                        <div className="h-full w-1/3 rounded-full bg-emerald-500 transition-all group-hover:w-2/3" />
                      </div>
                      <span>Pro</span>
                    </div>
                  </div>
                </div>
                {/* Mini chart animation on hover */}
                <div className="mt-4 h-12 w-full opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <svg viewBox="0 0 100 40" className="h-full w-full text-emerald-400/60">
                    <polyline
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      points="0,30 10,25 20,20 30,15 40,18 50,12 60,10 70,8 80,5 90,3 100,2"
                    />
                  </svg>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Secondary Cards */}
      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        {secondaryCards.map((card, idx) => {
          const Icon = icons[idx + 2];
          return (
            <div
              key={card.title}
              className="group relative overflow-hidden rounded-xl border border-slate-800 bg-slate-900/60 p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-500/40 hover:shadow-[0_0_20px_rgba(16,185,129,0.15)]"
            >
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-slate-800 p-2.5 group-hover:bg-emerald-500/10 transition-colors">
                  <Icon />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-medium">{card.title}</h3>
                  <p className="mt-1 text-sm text-zinc-300">{card.desc}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

