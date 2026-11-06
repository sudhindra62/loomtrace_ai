import { requireRoleOrRedirect } from "@/lib/firebase/session";
import { DashboardShell, type DashboardNavItem } from "@/components/dashboard/DashboardShell";
import { LayoutDashboard, LandPlot, TriangleAlert, Users, FileBarChart } from "lucide-react";

const NAV_ITEMS: DashboardNavItem[] = [
  { href: "/government", label: "NHIC Overview", icon: LayoutDashboard },
  { href: "/government/clusters", label: "Clusters", icon: LandPlot },
  { href: "/government/alerts", label: "Early Warning Alerts", icon: TriangleAlert },
  { href: "/government/weavers", label: "Weavers", icon: Users },
  { href: "/government/reports", label: "Impact Reports", icon: FileBarChart },
];

export default async function GovernmentLayout({ children }: { children: React.ReactNode }) {
  const session = await requireRoleOrRedirect(["government", "admin"]);

  return (
    <DashboardShell
      navItems={NAV_ITEMS}
      roleLabel="National Handloom Intelligence Center"
      userName={session.email ?? "Official"}
      userId={session.uid}
    >
      {children}
    </DashboardShell>
  );
}
