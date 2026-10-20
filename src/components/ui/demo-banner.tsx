"use client";

import React, { useState } from "react";
import { AlertCircle, ShieldCheck, ToggleLeft, ToggleRight, ArrowRight } from "lucide-react";
import Link from "next/link";

interface DemoBannerProps {
  isDemoMode: boolean;
  awsConnected: boolean;
  onToggleDemoMode?: (enabled: boolean) => void;
}

export function DemoBanner({
  isDemoMode,
  awsConnected,
  onToggleDemoMode,
}: DemoBannerProps) {
  const [active, setActive] = useState(isDemoMode);

  const handleToggle = () => {
    const next = !active;
    setActive(next);
    if (onToggleDemoMode) {
      onToggleDemoMode(next);
    }
  };

  return (
    <div
      role="status"
      aria-label="Security Operations Mode Status"
      className={`w-full py-1.5 px-4 text-xs font-mono select-none flex flex-wrap items-center justify-between gap-3 border-b ${
        active
          ? "bg-[#212411] border-[#535C20] text-[#E8F086]"
          : awsConnected
          ? "bg-[#112418] border-[#225732] text-[#86F0AA]"
          : "bg-[#291414] border-[#662323] text-[#FFA8A8]"
      }`}
    >
      <div className="flex items-center gap-2.5">
        {active ? (
          <span className="flex items-center gap-1.5 font-bold uppercase tracking-widest text-[11px] px-1.5 py-0.5 bg-[#3B4219] border border-[#7A8728] text-lime-300">
            <AlertCircle className="w-3.5 h-3.5 text-lime-400" />
            SYNTHETIC DEMO DATA ACTIVE
          </span>
        ) : awsConnected ? (
          <span className="flex items-center gap-1.5 font-bold uppercase tracking-widest text-[11px] px-1.5 py-0.5 bg-[#183B24] border border-[#2B7344] text-[#A6FFC5]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#63E894]" />
            LIVE AWS SECURITY OPERATIONS CONNECTED
          </span>
        ) : (
          <span className="flex items-center gap-1.5 font-bold uppercase tracking-widest text-[11px] px-1.5 py-0.5 bg-[#421919] border border-[#872828] text-[#FFA8A8]">
            <AlertCircle className="w-3.5 h-3.5 text-[#FF6666]" />
            NO AWS CREDENTIALS DETECTED (FALLBACK REQUIRED)
          </span>
        )}

        <span className="hidden sm:inline text-ivory-300">
          {active
            ? "Displaying isolated synthetic attack scenarios. Real AWS API mutations remain strictly gated."
            : awsConnected
            ? "Server-side STS identity verified. Live findings stream enabled."
            : "Live telemetry disabled. Configure AWS credentials in AWS_CREDENTIALS_SETUP.txt or toggle Demo Data."}
        </span>
      </div>

      <div className="flex items-center gap-3">
        <Link
          href="/integrations"
          className="hover:underline flex items-center gap-1 text-[11px] font-bold tracking-wider uppercase text-ivory-200"
        >
          Check AWS Status <ArrowRight className="w-3 h-3" />
        </Link>

        {onToggleDemoMode && (
          <button
            onClick={handleToggle}
            className="flex items-center gap-1.5 px-2 py-0.5 bg-charcoal-900 border border-charcoal-700 hover:border-charcoal-600 transition"
          >
            {active ? (
              <ToggleRight className="w-4 h-4 text-lime-400" />
            ) : (
              <ToggleLeft className="w-4 h-4 text-ivory-500" />
            )}
            <span className="text-[10px] text-ivory-300 uppercase">
              Demo Data: {active ? "ON" : "OFF"}
            </span>
          </button>
        )}
      </div>
    </div>
  );
}
