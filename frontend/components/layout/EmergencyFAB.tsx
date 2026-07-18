"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LifeBuoy } from "lucide-react";

export function EmergencyFAB() {
  const pathname = usePathname();
  if (pathname === "/emergency") return null;

  return (
    <Link
      href="/emergency"
      className="lg:hidden fixed right-4 bottom-20 z-40 flex items-center gap-2 rounded-full bg-danger px-4 py-3 text-sm font-semibold text-white shadow-[0_10px_30px_-8px_rgba(242,84,91,0.6)] animate-pulse-ring"
      aria-label="Emergency support"
    >
      <LifeBuoy size={18} />
      SOS
    </Link>
  );
}
