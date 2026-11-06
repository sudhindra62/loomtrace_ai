import { requireRoleOrRedirect } from "@/lib/firebase/session";
import { DashboardShell, type DashboardNavItem } from "@/components/dashboard/DashboardShell";
import { LayoutDashboard, Users, ScrollText, Settings } from "lucide-react";

const NAV_ITEMS: DashboardNavItem[] = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/audit-logs", label: "Audit Logs", icon: ScrollText },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireRoleOrRedirect(["admin"]);

  return (
    <DashboardShell navItems={NAV_ITEMS} roleLabel="Admin" userName={session.email ?? "Admin"} userId={session.uid}>
      {children}
    </DashboardShell>
  );
}
