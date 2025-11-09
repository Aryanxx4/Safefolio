"use client";

const testimonials = [
  {
    quote: "Helped me finally understand how markets work.",
    author: "Sarah Chen",
    role: "Finance Student",
    avatar: "SC",
    verified: true,
  },
  {
    quote: "Feels like a real stock platform — minus the risk.",
    author: "Michael Torres",
    role: "Beginner Trader",
    avatar: "MT",
    verified: true,
  },
  {
    quote: "The Time Machine mode blew my mind!",
    author: "Alex Kim",
    role: "Hackathon Judge",
    avatar: "AK",
    verified: false,
  },
  {
    quote: "Perfect for beginners learning to trade safely.",
    author: "Emma Wilson",
    role: "Investment Newbie",
    avatar: "EW",
    verified: true,
  },
];

function StarIcon({ filled = false }: { filled?: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="2"
      className={filled ? "text-yellow-400" : "text-zinc-600"}
    >
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}

function VerifiedIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-emerald-400">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
      <path d="M8 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function Testimonials() {
  return (
    <section className="relative mx-auto max-w-6xl px-6 py-20">
      <div className="mb-8">
        <h2 className="text-3xl font-semibold">Why users love it</h2>
        <p className="mt-2 text-zinc-400">Join thousands learning to trade safely</p>
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {testimonials.map((testimonial, idx) => (
          <blockquote
            key={idx}
            className="group relative overflow-hidden rounded-xl border border-slate-800/50 bg-gradient-to-br from-slate-900/80 via-slate-900/60 to-emerald-950/20 p-6 text-zinc-300 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500/40 hover:shadow-[0_0_24px_rgba(16,185,129,0.2)]"
          >
            {/* Gradient border effect */}
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-emerald-500/0 via-emerald-500/0 to-emerald-500/0 opacity-0 transition-opacity duration-300 group-hover:from-emerald-500/10 group-hover:via-emerald-500/5 group-hover:to-emerald-500/0 group-hover:opacity-100" />
            
            <div className="relative">
              {/* Stars */}
              <div className="mb-4 flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <StarIcon key={star} filled={star <= 5} />
                ))}
              </div>

              {/* Quote */}
              <p className="mb-4 text-sm leading-relaxed">"{testimonial.quote}"</p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500/20 to-teal-500/20 text-sm font-semibold text-emerald-300">
                  {testimonial.avatar}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <div className="text-sm font-medium text-white">{testimonial.author}</div>
                    {testimonial.verified && (
                      <div className="flex items-center" title="Verified User">
                        <VerifiedIcon />
                      </div>
                    )}
                  </div>
                  <div className="text-xs text-zinc-400">{testimonial.role}</div>
                </div>
              </div>
            </div>
          </blockquote>
        ))}
      </div>
    </section>
  );
}

