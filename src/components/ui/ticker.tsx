"use client";

import React from "react";
import { Radio } from "lucide-react";

interface TickerItem {
  id: string;
  source: string;
  severity: string;
  text: string;
  timestamp: string;
}

const DEFAULT_TICKER_ITEMS: TickerItem[] = [
  {
    id: "t1",
    source: "GUARDDUTY",
    severity: "CRIT",
    text: "UnauthorizedAccess:EC2/MaliciousIPCaller.Custom -> i-0a81f33b1e",
    timestamp: "02:14 UTC",
  },
  {
    id: "t2",
    source: "SECURITYHUB",
    severity: "HIGH",
    text: "S3.2 Public Read Policy Detected -> prod-customer-invoice-vault",
    timestamp: "01:45 UTC",
  },
  {
    id: "t3",
    source: "CLOUDTRAIL",
    severity: "INFO",
    text: "sts:GetCallerIdentity -> Verifying Ingestion Pipeline",
    timestamp: "02:22 UTC",
  },
  {
    id: "t4",
    source: "INSPECTOR",
    severity: "CRIT",
    text: "CVE-2024-38077 RCE Detected -> i-0c9f110a24",
    timestamp: "21:10 UTC",
  },
  {
    id: "t5",
    source: "AUTOSOC-AI",
    severity: "SYNTH",
    text: "Attack correlation graph generated for INC-2026-9041 (Confidence: 98%)",
    timestamp: "02:25 UTC",
  },
];

export function TelemetryTicker({ items = DEFAULT_TICKER_ITEMS }: { items?: TickerItem[] }) {
  // Duplicate list to create a seamless infinite marquee
  const displayItems = [...items, ...items];

  return (
    <div className="w-full bg-charcoal-950 border-y border-charcoal-700/80 overflow-hidden flex items-center select-none py-2 text-xs font-mono">
      <div className="shrink-0 flex items-center gap-2 px-4 bg-charcoal-900 border-r border-charcoal-700 z-10 text-lime-400 font-bold uppercase tracking-widest text-[11px]">
        <Radio className="w-3.5 h-3.5 animate-pulse text-lime-400" />
        <span>AWS SOC FEED</span>
      </div>

      <div className="flex whitespace-nowrap overflow-hidden">
        <div className="flex animate-ticker hover:[animation-play-state:paused] gap-8 pl-4">
          {displayItems.map((item, idx) => (
            <div key={`${item.id}-${idx}`} className="flex items-center gap-2">
              <span className="text-[10px] px-1 py-0.2 bg-charcoal-800 text-ivory-400 border border-charcoal-700">
                {item.source}
              </span>
              <span
                className={`text-[10px] px-1 font-bold ${
                  item.severity === "CRIT"
                    ? "text-[#FF6666] bg-[#2E1111]"
                    : item.severity === "HIGH"
                    ? "text-[#FFA066] bg-[#2E1C11]"
                    : "text-lime-400 bg-lime-950"
                }`}
              >
                {item.severity}
              </span>
              <span className="text-ivory-300 font-medium">{item.text}</span>
              <span className="text-ivory-500 text-[10px]">{item.timestamp}</span>
              <span className="text-charcoal-700 pl-4">/</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
