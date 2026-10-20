import React from "react";
import Link from "next/link";
import { Shield, Terminal, ArrowUpRight, Lock } from "lucide-react";

export function PublicNav() {
  return (
    <header className="sticky top-0 z-40 w-full bg-charcoal-950/90 backdrop-blur-md border-b border-charcoal-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-8 h-8 bg-lime-500 text-charcoal-950 flex items-center justify-center font-mono font-black text-sm group-hover:bg-lime-400 transition-colors">
            AS
          </div>
          <div className="flex flex-col">
            <span className="font-mono font-extrabold text-base tracking-tighter text-ivory-100 uppercase flex items-center gap-1.5">
              AutoSOC
              <span className="text-[10px] px-1 py-0.2 bg-lime-950 text-lime-400 border border-lime-800 font-mono tracking-widest font-normal">
                v1.0
              </span>
            </span>
            <span className="text-[9px] font-mono tracking-widest text-ivory-400 uppercase -mt-1">
              Autonomous Cloud SecOps
            </span>
          </div>
        </Link>

        {/* Public Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-mono tracking-wider uppercase text-ivory-300">
          <Link href="/#architecture" className="hover:text-lime-400 transition-colors">
            Architecture
          </Link>
          <Link href="/#capabilities" className="hover:text-lime-400 transition-colors">
            Capabilities
          </Link>
          <Link href="/#workflow" className="hover:text-lime-400 transition-colors">
            7-Stage Loop
          </Link>
          <Link href="/security" className="hover:text-lime-400 transition-colors">
            Security & Trust
          </Link>
          <Link href="/docs" className="hover:text-lime-400 transition-colors">
            Documentation
          </Link>
        </nav>

        {/* Action Button: Launch Console */}
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-mono text-ivory-300 hover:text-ivory-100 px-3 py-2 border border-charcoal-700 hover:border-charcoal-600 transition"
          >
            <Lock className="w-3.5 h-3.5 text-ivory-400" />
            <span>Analyst Login</span>
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-4 py-2 bg-lime-500 hover:bg-lime-400 text-charcoal-950 font-mono font-bold text-xs tracking-wider uppercase border border-lime-500 shadow-[0_0_12px_rgba(199,243,107,0.25)] transition-all"
          >
            <Terminal className="w-4 h-4" />
            <span>Launch Console</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </header>
  );
}
