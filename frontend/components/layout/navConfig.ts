import { Home, MessageCircle, CheckCircle2, BarChart3, User } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/coach", label: "Coach", icon: MessageCircle },
  { href: "/check-in", label: "Check-in", icon: CheckCircle2 },
  { href: "/insights", label: "Insights", icon: BarChart3 },
  { href: "/profile", label: "Profile", icon: User },
];

export const SHELL_ROUTES = [...NAV_ITEMS.map((i) => i.href), "/emergency", "/relapse"];
