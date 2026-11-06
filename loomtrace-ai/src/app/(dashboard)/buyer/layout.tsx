import { requireRoleOrRedirect } from "@/lib/firebase/session";
import { DashboardShell, type DashboardNavItem } from "@/components/dashboard/DashboardShell";
import { LayoutDashboard, Heart, ShoppingBag, Star, Settings } from "lucide-react";

const NAV_ITEMS: DashboardNavItem[] = [
  { href: "/buyer", label: "Overview", icon: LayoutDashboard },
  { href: "/buyer/wishlist", label: "Wishlist", icon: Heart },
  { href: "/buyer/orders", label: "Orders", icon: ShoppingBag },
  { href: "/buyer/reviews", label: "My reviews", icon: Star },
  { href: "/buyer/settings", label: "Settings", icon: Settings },
];

export default async function BuyerLayout({ children }: { children: React.ReactNode }) {
  const session = await requireRoleOrRedirect(["buyer"]);

  return (
    <DashboardShell navItems={NAV_ITEMS} roleLabel="Buyer" userName={session.email ?? "Buyer"} userId={session.uid}>
      {children}
    </DashboardShell>
  );
}
