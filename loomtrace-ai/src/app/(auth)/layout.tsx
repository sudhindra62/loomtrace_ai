export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Brand panel — hidden on mobile, this is where the "premium
          enterprise SaaS" first impression actually lives for anyone
          landing on auth pages directly. */}
      <div className="relative hidden overflow-hidden bg-neutral-950 lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div
          aria-hidden
          className="absolute inset-0 opacity-60"
          style={{
            background:
              "radial-gradient(60% 50% at 20% 20%, rgba(238,123,53,0.25) 0%, transparent 60%), radial-gradient(50% 40% at 90% 80%, rgba(238,123,53,0.15) 0%, transparent 60%)",
          }}
        />
        {/* Subtle woven-grid motif — nods to the actual craft without
            resorting to a literal stock photo of a loom. */}
        <svg aria-hidden className="absolute inset-0 h-full w-full opacity-[0.07]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="weave" width="24" height="24" patternUnits="userSpaceOnUse">
              <path d="M0 12h24M12 0v24" stroke="white" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#weave)" />
        </svg>

        <a href="/" className="relative z-10 flex items-center gap-2 text-white">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-500 font-display text-sm font-bold">
            L
          </span>
          <span className="font-display text-lg font-semibold tracking-tight">LoomTrace AI</span>
        </a>

        <blockquote className="relative z-10 max-w-md">
          <p className="font-display text-2xl font-medium leading-snug text-white">
            &ldquo;Every authentic handloom product deserves an identity as enduring as the craft itself.&rdquo;
          </p>
          <footer className="mt-4 text-sm text-neutral-400">
            Digital Product Identity · National verification infrastructure for Indian handlooms
          </footer>
        </blockquote>
      </div>

      {/* Auth form panel */}
      <div className="flex items-center justify-center px-6 py-12">
        <main id="main-content" className="w-full max-w-md">
          {children}
        </main>
      </div>
    </div>
  );
}
