import { requireRoleOrRedirect } from "@/lib/firebase/session";
import { DashboardShell, type DashboardNavItem } from "@/components/dashboard/DashboardShell";
import { LayoutDashboard, Package, Fingerprint, LineChart, Settings } from "lucide-react";

const NAV_ITEMS: DashboardNavItem[] = [
  { href: "/weaver", label: "Overview", icon: LayoutDashboard },
  { href: "/weaver/products", label: "Products", icon: Package },
  { href: "/weaver/dpi", label: "Digital Product Identity", icon: Fingerprint },
  { href: "/weaver/analytics", label: "Market Intelligence", icon: LineChart },
  { href: "/weaver/settings", label: "Settings", icon: Settings },
];

export default async function WeaverLayout({ children }: { children: React.ReactNode }) {
  const session = await requireRoleOrRedirect(["weaver"]);

  return (
    <DashboardShell navItems={NAV_ITEMS} roleLabel="Weaver" userName={session.email ?? "Weaver"} userId={session.uid}>
      {children}
    </DashboardShell>
  );
}
