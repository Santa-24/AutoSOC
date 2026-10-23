"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  AlertOctagon,
  Sparkles,
  ShieldCheck,
  FileSearch,
  KeyRound,
  CheckSquare,
  Network,
  History,
  Sliders,
  Home,
} from "lucide-react";

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

const BASE_NAV_ITEMS: NavItem[] = [
  { name: "Command Center", href: "/dashboard", icon: LayoutDashboard },
  { name: "Incidents & Findings", href: "/incidents", icon: AlertOctagon },
  { name: "AI Investigation", href: "/investigations", icon: Sparkles },
  { name: "Response Playbooks", href: "/response-playbooks", icon: ShieldCheck, badge: "Gated" },
  { name: "Forensics Timeline", href: "/forensics", icon: FileSearch },
  { name: "IAM Risk Engine", href: "/iam-risk", icon: KeyRound },
  { name: "Compliance Mapping", href: "/compliance", icon: CheckSquare },
  { name: "AWS Integrations", href: "/integrations", icon: Network },
  { name: "Audit Trail", href: "/audit-log", icon: History },
  { name: "Settings & Flags", href: "/settings", icon: Sliders },
];

export function ConsoleSidebar() {
  const pathname = usePathname();
  const [activeCount, setActiveCount] = React.useState<number | null>(null);

  React.useEffect(() => {
    let mounted = true;
    fetch("/api/incidents")
      .then((res) => res.json())
      .then((data) => {
        if (mounted && typeof data?.count === "number") {
          setActiveCount(data.count);
        }
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <aside className="w-64 bg-charcoal-900 border-r border-charcoal-700 flex flex-col shrink-0 min-h-[calc(100vh-3.5rem)] select-none">
      {/* Brand Header */}
      <div className="p-4 border-b border-charcoal-700 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-6 h-6 bg-lime-500 text-charcoal-950 font-bold font-mono text-xs flex items-center justify-center">
            AS
          </div>
          <div>
            <span className="font-mono font-bold text-xs tracking-tight text-ivory-100 uppercase group-hover:text-lime-400 transition-colors">
              AutoSOC Console
            </span>
          </div>
        </Link>
        <span className="text-[9px] font-mono px-1 py-0.2 bg-charcoal-800 text-lime-400 border border-charcoal-700 uppercase">
          SEC-OPS
        </span>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 p-3 space-y-1 font-mono text-xs overflow-y-auto">
        {BASE_NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;

          const badgeText =
            item.href === "/incidents"
              ? activeCount !== null
                ? activeCount > 0
                  ? `${activeCount} Active`
                  : "Secured"
                : null
              : item.badge;

          const isSecuredBadge = badgeText === "Secured";

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between px-3 py-2 transition-colors ${
                isActive
                  ? "bg-lime-950 text-lime-400 font-bold border-l-2 border-lime-400"
                  : "text-ivory-300 hover:text-ivory-100 hover:bg-charcoal-800"
              }`}
            >
              <div className="flex items-center gap-2.5 truncate">
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-lime-400" : "text-ivory-400"}`} />
                <span className="truncate">{item.name}</span>
              </div>

              {badgeText && (
                <span
                  className={`text-[9px] px-1.5 py-0.2 border uppercase tracking-wider ${
                    isSecuredBadge
                      ? "bg-[#122416] border-[#22572E] text-[#63E894]"
                      : isActive
                      ? "bg-lime-900/60 border-lime-700 text-lime-300"
                      : "bg-charcoal-800 border-charcoal-700 text-ivory-400"
                  }`}
                >
                  {badgeText}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Quick Return to Public Site */}
      <div className="p-3 border-t border-charcoal-700">
        <Link
          href="/"
          className="flex items-center gap-2 px-3 py-2 text-xs font-mono text-ivory-400 hover:text-ivory-100 hover:bg-charcoal-850 transition"
        >
          <Home className="w-4 h-4 text-ivory-500" />
          <span>Return to Landing Page</span>
        </Link>
      </div>
    </aside>
  );
}
