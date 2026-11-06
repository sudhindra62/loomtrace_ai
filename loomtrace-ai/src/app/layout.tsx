import type { Metadata, Viewport } from "next";
import { Inter, Manrope } from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const manrope = Manrope({ subsets: ["latin"], variable: "--font-display", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL("https://loomtrace.gov.in"),
  title: {
    default: "LoomTrace AI — Digital Identity & Market Access for Indian Handlooms",
    template: "%s · LoomTrace AI",
  },
  description:
    "A national digital infrastructure platform verifying authentic Indian handloom products, connecting weavers directly to buyers and export markets, and giving policymakers real-time visibility into the handloom economy.",
  keywords: ["handloom", "Indian handicrafts", "weaver marketplace", "Ministry of Textiles", "product authentication"],
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: "LoomTrace AI",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${manrope.variable}`} suppressHydrationWarning>
      <body className="font-sans">
        <Providers>
          {/* Skip link — first focusable element, required for keyboard
              users per the accessibility architecture; visually hidden
              until focused. */}
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-neutral-900 focus:px-4 focus:py-2 focus:text-sm focus:text-white"
          >
            Skip to main content
          </a>
          {children}
        </Providers>
      </body>
    </html>
  );
}
