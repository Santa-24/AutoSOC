"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Bell,
  Search,
  Globe,
  User,
  Shield,
  ChevronDown,
  LogOut,
  Sliders,
} from "lucide-react";
import { SessionUser } from "@/types/security";

export function ConsoleNav({ user }: { user: SessionUser | null }) {
  const [timeUtc, setTimeUtc] = useState<string>("");
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeUtc(now.toISOString().slice(11, 19) + " UTC");
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-30 w-full bg-charcoal-900 border-b border-charcoal-700 h-14 flex items-center justify-between px-4 sm:px-6">
      {/* Left: Search Bar / Quick Action */}
      <div className="flex items-center gap-4 flex-1 max-w-lg">
        <div className="relative w-full max-w-xs sm:max-w-sm hidden sm:block">
          <Search className="w-4 h-4 text-ivory-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search findings, CVEs, ARNs, IPs... (Press '/' to focus)"
            className="w-full bg-charcoal-850 border border-charcoal-700 pl-9 pr-3 py-1.5 text-xs font-mono text-ivory-100 placeholder:text-ivory-500 focus:outline-none focus:border-lime-500 transition-colors"
          />
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3 sm:gap-5 text-xs font-mono">
        {/* Real-time UTC Clock */}
        <div className="hidden md:flex items-center gap-2 px-2.5 py-1 bg-charcoal-850 border border-charcoal-750 text-ivory-300">
          <span className="w-1.5 h-1.5 rounded-full bg-lime-400 animate-pulse" />
          <span className="text-[11px] font-mono tracking-wider">{timeUtc || "00:00:00 UTC"}</span>
        </div>

        {/* AWS Region Badge */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-charcoal-850 border border-charcoal-750 text-ivory-300">
          <Globe className="w-3.5 h-3.5 text-lime-400" />
          <span className="text-[11px] font-mono font-bold text-ivory-200">ap-south-1</span>
        </div>

        {/* User Role / Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 px-2.5 py-1 bg-charcoal-850 hover:bg-charcoal-800 border border-charcoal-750 text-ivory-200 transition-colors"
            aria-expanded={showUserMenu}
          >
            <div className="w-5 h-5 bg-lime-500 text-charcoal-950 font-bold text-[10px] flex items-center justify-center">
              {user?.name ? user.name[0] : "A"}
            </div>
            <div className="text-left hidden lg:block">
              <span className="block text-[11px] font-bold text-ivory-100 leading-tight">
                {user?.name || "Alex Vance"}
              </span>
              <span className="block text-[9px] text-lime-400 tracking-wider uppercase">
                {user?.role.replace(/_/g, " ") || "SECOPS PRINCIPAL"}
              </span>
            </div>
            <ChevronDown className="w-3 h-3 text-ivory-400" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-64 bg-charcoal-900 border border-charcoal-700 shadow-2xl py-2 z-50 text-xs font-mono">
              <div className="px-3 py-2 border-b border-charcoal-700">
                <span className="block text-ivory-400 text-[10px]">ACTIVE ANALYST SESSION</span>
                <span className="block font-bold text-ivory-100">{user?.email || "alex.vance@autosoc.corp"}</span>
                <span className="inline-block mt-1 px-1.5 py-0.5 text-[9px] bg-lime-950 text-lime-400 border border-lime-800 uppercase font-bold">
                  Role: {user?.role || "secops_admin"}
                </span>
              </div>

              <div className="py-1">
                <Link
                  href="/settings"
                  onClick={() => setShowUserMenu(false)}
                  className="flex items-center gap-2 px-3 py-2 text-ivory-300 hover:text-ivory-100 hover:bg-charcoal-800 transition"
                >
                  <Sliders className="w-4 h-4 text-ivory-400" />
                  <span>Preferences & Feature Flags</span>
                </Link>
                <Link
                  href="/audit-log"
                  onClick={() => setShowUserMenu(false)}
                  className="flex items-center gap-2 px-3 py-2 text-ivory-300 hover:text-ivory-100 hover:bg-charcoal-800 transition"
                >
                  <Shield className="w-4 h-4 text-ivory-400" />
                  <span>View Analyst Audit Log</span>
                </Link>
                <Link
                  href="/login"
                  onClick={() => setShowUserMenu(false)}
                  className="flex items-center gap-2 px-3 py-2 text-[#FF8585] hover:bg-[#3D1414] transition"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Switch Analyst Profile</span>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
