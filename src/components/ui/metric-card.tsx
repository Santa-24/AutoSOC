import React from "react";
import { Sparkline } from "./sparkline";

interface MetricCardProps {
  label: string;
  value: string | number;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  subtitle?: string;
  sparklineData?: number[];
  sparklineColor?: "lime" | "alert" | "mineral";
  icon?: React.ReactNode;
}

export function MetricCard({
  label,
  value,
  change,
  changeType = "neutral",
  subtitle,
  sparklineData,
  sparklineColor = "lime",
  icon,
}: MetricCardProps) {
  const changeStyles = {
    positive: "text-lime-400 border-lime-800 bg-lime-950/40",
    negative: "text-[#FF8080] border-[#5E1E1E] bg-[#2E1111]/40",
    neutral: "text-ivory-400 border-charcoal-700 bg-charcoal-800",
  };

  return (
    <div className="bg-charcoal-850 border border-charcoal-700 p-4 relative group hover:border-charcoal-600 transition-colors">
      <div className="flex items-start justify-between mb-2">
        <span className="text-[11px] font-mono tracking-widest text-ivory-400 uppercase">
          {label}
        </span>
        {icon && <div className="text-ivory-400">{icon}</div>}
      </div>

      <div className="flex items-baseline justify-between gap-4">
        <div>
          <div className="text-2xl md:text-3xl font-mono font-bold text-ivory-100 tracking-tight">
            {value}
          </div>
          {subtitle && (
            <div className="text-[11px] font-mono text-ivory-500 mt-0.5">
              {subtitle}
            </div>
          )}
        </div>

        {sparklineData && (
          <div className="shrink-0">
            <Sparkline
              data={sparklineData}
              color={sparklineColor}
              width={80}
              height={28}
            />
          </div>
        )}
      </div>

      {change && (
        <div className="mt-3 pt-2.5 border-t border-charcoal-700/60 flex items-center gap-2">
          <span
            className={`inline-block px-1.5 py-0.5 text-[10px] font-mono font-semibold uppercase border ${changeStyles[changeType]}`}
          >
            {change}
          </span>
          <span className="text-[10px] font-mono text-ivory-400">vs previous 24h</span>
        </div>
      )}
    </div>
  );
}
