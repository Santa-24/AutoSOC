import React from "react";
import { SeverityLevel, FindingStatus, IncidentStatus } from "@/types/security";

interface SeverityBadgeProps {
  severity: SeverityLevel;
  size?: "sm" | "md" | "lg";
}

export function SeverityBadge({ severity, size = "md" }: SeverityBadgeProps) {
  const sizeClasses = {
    sm: "px-1.5 py-0.5 text-[10px] tracking-wider",
    md: "px-2.5 py-1 text-xs tracking-wider",
    lg: "px-3 py-1.5 text-sm tracking-widest",
  };

  const severityStyles: Record<SeverityLevel, { bg: string; text: string; border: string; dot: string }> = {
    CRITICAL: {
      bg: "bg-[#2E1111]",
      text: "text-[#FF6666]",
      border: "border-[#5E1E1E]",
      dot: "bg-[#FF4747]",
    },
    HIGH: {
      bg: "bg-[#2E1C11]",
      text: "text-[#FFA066]",
      border: "border-[#5E321E]",
      dot: "bg-[#FF823C]",
    },
    MEDIUM: {
      bg: "bg-[#2E2411]",
      text: "text-[#FFCC66]",
      border: "border-[#5E471E]",
      dot: "bg-[#F5B438]",
    },
    LOW: {
      bg: "bg-[#1D2B10]",
      text: "text-[#C2E880]",
      border: "border-[#3A5418]",
      dot: "bg-[#96C252]",
    },
    INFORMATIONAL: {
      bg: "bg-[#17202B]",
      text: "text-[#A8BCCC]",
      border: "border-[#2A3B4D]",
      dot: "bg-[#8EA0B5]",
    },
  };

  const style = severityStyles[severity] || severityStyles.INFORMATIONAL;

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-mono font-semibold uppercase border ${style.bg} ${style.text} ${style.border} ${sizeClasses[size]} select-none`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${style.dot} animate-pulse`} />
      {severity}
    </span>
  );
}

interface StatusBadgeProps {
  status: FindingStatus | IncidentStatus | string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  let style = "bg-charcoal-800 text-ivory-300 border-charcoal-700";

  switch (status) {
    case "ACTIVE":
    case "AWAITING_APPROVAL":
      style = "bg-[#2E1611] text-[#FFA570] border-[#662B17]";
      break;
    case "INVESTIGATING":
    case "TRIAGE":
      style = "bg-[#2A2B14] text-[#E8E674] border-[#5E5E24]";
      break;
    case "REMEDIATING":
    case "EXECUTING":
      style = "bg-lime-950 text-lime-400 border-lime-800";
      break;
    case "RESOLVED":
    case "CONTAINED":
    case "CLOSED":
    case "SUCCESS":
      style = "bg-[#142319] text-[#7AE6A2] border-[#204E30]";
      break;
    case "FAILED":
      style = "bg-[#2E1111] text-[#FF7070] border-[#5E1E1E]";
      break;
  }

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 text-[11px] font-mono uppercase tracking-wider border ${style}`}
    >
      {status.replace(/_/g, " ")}
    </span>
  );
}

export function DemoTag() {
  return null;
}

