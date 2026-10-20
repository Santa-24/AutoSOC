import React from "react";
import Link from "next/link";
import {
  CheckSquare,
  ShieldCheck,
  AlertTriangle,
  FileCheck,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Clock,
  ArrowRight,
} from "lucide-react";
import { ConsoleShell } from "@/components/layout/console-shell";
import { getComplianceControls } from "@/lib/store/soc-store";
import { ComplianceControl } from "@/types/security";

export const dynamic = "force-dynamic";

export default function ComplianceMappingPage() {
  const controls = getComplianceControls();

  const passCount = controls.filter((c) => c.status === "PASS").length;
  const failCount = controls.filter((c) => c.status === "FAIL").length;
  const notEvalCount = controls.filter((c) => c.status === "NOT_EVALUATED").length;

  const getStatusBadge = (status: ComplianceControl["status"]) => {
    switch (status) {
      case "PASS":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#142618] text-[#78E896] border border-[#235C2E] text-[10px] font-bold">
            <CheckCircle2 className="w-3 h-3 text-[#78E896]" />
            PASS
          </span>
        );
      case "FAIL":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#2E1212] text-[#FF8585] border border-[#5E1E1E] text-[10px] font-bold">
            <XCircle className="w-3 h-3 text-[#FF4747]" />
            FAIL
          </span>
        );
      case "NOT_EVALUATED":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-charcoal-800 text-ivory-400 border border-charcoal-700 text-[10px]">
            <Clock className="w-3 h-3" />
            NOT EVALUATED
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#262414] text-[#E8D978] border border-[#5C5523] text-[10px]">
            <HelpCircle className="w-3 h-3" />
            UNKNOWN
          </span>
        );
    }
  };

  return (
    <ConsoleShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-charcoal-700 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-lime-400" />
              <h1 className="text-xl sm:text-2xl font-black uppercase text-ivory-100">
                Framework Mapping & Control Engine
              </h1>
            </div>
            <p className="text-xs text-ivory-400 mt-0.5">
              Technical configuration checklist mapped against CIS AWS Foundations Benchmark, NIST CSF 2.0, and ISO 27001:2022
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-2 px-3 py-1 bg-charcoal-850 border border-charcoal-700">
              <span className="text-[#78E896] font-bold">{passCount} Pass</span>
              <span className="text-charcoal-600">/</span>
              <span className="text-[#FF8585] font-bold">{failCount} Fail</span>
            </div>
          </div>
        </div>

        {/* Legal / Non-Certification Disclaimer Banner (Non-Negotiable requirement #10) */}
        <div className="p-4 bg-[#212411] border-l-4 border-lime-500 border-r border-t border-b border-[#525C20] text-xs space-y-1">
          <div className="flex items-center gap-2 font-bold uppercase tracking-wider text-lime-400">
            <ShieldCheck className="w-4 h-4" />
            INFORMATIVE FRAMEWORK MAPPING NOTICE
          </div>
          <p className="text-[#E8F086] text-[11px] leading-relaxed">
            The evaluations presented below represent technical automated configuration checks against benchmark rules. They are informative technical controls designed to guide security operations and do not constitute an official regulatory audit, certified accreditation, or statutory attestation.
          </p>
        </div>

        {/* Controls Table */}
        <div className="bg-charcoal-850 border border-charcoal-700 overflow-hidden text-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-charcoal-900 border-b border-charcoal-700 text-[11px] text-ivory-400 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Framework / Control ID</th>
                  <th className="py-3 px-4">Title & Rationale</th>
                  <th className="py-3 px-4">Evaluated Resource</th>
                  <th className="py-3 px-4">Recommended Remediation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-charcoal-750">
                {controls.map((ctrl) => (
                  <tr key={ctrl.id} className="hover:bg-charcoal-800/60 transition">
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {getStatusBadge(ctrl.status)}
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="font-bold text-ivory-100">{ctrl.controlId}</div>
                      <div className="text-[10px] text-ivory-500">{ctrl.framework}</div>
                      <div className="text-[9px] text-lime-400 mt-0.5">{ctrl.domain}</div>
                    </td>

                    <td className="py-3.5 px-4 max-w-sm">
                      <div className="font-bold text-ivory-200">{ctrl.title}</div>
                      <div className="text-[11px] text-ivory-400 mt-0.5 leading-relaxed">
                        {ctrl.rationale}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {ctrl.resourceId ? (
                        <code className="text-lime-400 font-bold text-[11px]">
                          {ctrl.resourceId}
                        </code>
                      ) : (
                        <span className="text-ivory-500">Account Wide</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 max-w-xs text-[11px] text-ivory-300">
                      {ctrl.remediationGuidance}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </ConsoleShell>
  );
}
