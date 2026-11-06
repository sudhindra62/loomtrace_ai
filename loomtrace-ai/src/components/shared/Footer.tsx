import Link from "next/link";

const FOOTER_SECTIONS: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: "Platform",
    links: [
      { label: "Marketplace", href: "/marketplace" },
      { label: "Digital Product Identity", href: "/dpi" },
      { label: "LoomLens Verification Engine", href: "/loomlens" },
      { label: "Verify a product", href: "/verify" },
    ],
  },
  {
    title: "For",
    links: [
      { label: "Weavers", href: "/for-weavers" },
      { label: "Buyers", href: "/for-buyers" },
      { label: "Exporters", href: "/for-exporters" },
      { label: "Government officials", href: "/government" },
      { label: "NGOs & cooperatives", href: "/cooperatives" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Heritage archive", href: "/heritage" },
      { label: "How verification works", href: "/how-it-works" },
      { label: "Responsible AI policy", href: "/responsible-ai" },
      { label: "Accessibility statement", href: "/accessibility" },
    ],
  },
  {
    title: "Government",
    links: [
      { label: "National Handloom Intelligence Center", href: "/government/nhic" },
      { label: "Data & privacy policy", href: "/privacy" },
      { label: "Grievance redressal", href: "/grievance" },
      { label: "RTI", href: "/rti" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5">
          <div className="col-span-2 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-900 font-display text-sm font-bold text-white dark:bg-white dark:text-neutral-900">
                L
              </span>
              <span className="font-display text-base font-semibold tracking-tight">LoomTrace AI</span>
            </Link>
            <p className="mt-4 max-w-xs text-sm text-neutral-500">
              National digital infrastructure for verifying and promoting authentic Indian handloom products.
            </p>
            <p className="mt-6 text-xs uppercase tracking-wide text-neutral-400">
              Built in service of<br />Ministry of Textiles, Government of India
            </p>
          </div>

          {FOOTER_SECTIONS.map((section) => (
            <div key={section.title}>
              <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-50">{section.title}</h3>
              <ul className="mt-4 space-y-3">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href as never}
                      className="text-sm text-neutral-500 transition-colors hover:text-neutral-900 dark:hover:text-neutral-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 flex flex-col items-start justify-between gap-4 border-t border-neutral-200 pt-8 text-sm text-neutral-400 dark:border-neutral-800 sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} LoomTrace AI. A digital public infrastructure initiative.</p>
          <div className="flex gap-6">
            <Link href="/terms" className="hover:text-neutral-700 dark:hover:text-neutral-300">
              Terms
            </Link>
            <Link href="/privacy" className="hover:text-neutral-700 dark:hover:text-neutral-300">
              Privacy
            </Link>
            <Link href="/accessibility" className="hover:text-neutral-700 dark:hover:text-neutral-300">
              Accessibility
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
