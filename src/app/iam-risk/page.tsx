import React from "react";
import Link from "next/link";
import {
  KeyRound,
  ShieldAlert,
  AlertTriangle,
  Lock,
  ArrowRight,
  FileCode,
  CheckCircle2,
} from "lucide-react";
import { ConsoleShell } from "@/components/layout/console-shell";
import { getIAMRisks } from "@/lib/store/soc-store";
import { SeverityBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function IAMRiskPage() {
  const risks = await getIAMRisks();

  return (
    <ConsoleShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-charcoal-700 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-lime-400" />
              <h1 className="text-xl sm:text-2xl font-black uppercase text-ivory-100">
                IAM Risk & Least-Privilege Engine
              </h1>
            </div>
            <p className="text-xs text-ivory-400 mt-0.5">
              Identifies overbroad policies, unrotated access keys, and lateral movement privilege escalation paths
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-ivory-400">Safety Policy:</span>
            <span className="px-2 py-0.5 bg-lime-950 text-lime-400 border border-lime-800 font-bold uppercase">
              Advisory Recommendations Only
            </span>
          </div>
        </div>

        {/* Safeguard Notice */}
        <div className="p-4 bg-charcoal-850 border-l-4 border-lime-500 border-r border-t border-b border-charcoal-700 text-xs space-y-1">
          <span className="font-bold uppercase tracking-wider text-lime-400 flex items-center gap-1.5">
            <Lock className="w-4 h-4" />
            STRICT POLICY CHANGE SAFEGUARD
          </span>
          <p className="text-ivory-300 text-[11px] leading-relaxed">
            AutoSOC does not automatically reduce or delete IAM role permissions. Policy modifications carry high risk of disrupting microservice dependencies. AutoSOC creates scoped, narrowed GitOps proposals for SecOps review.
          </p>
        </div>

        {/* IAM Risk Cards */}
        <div className="space-y-4">
          {risks.length === 0 ? (
            <div className="bg-charcoal-850 border border-charcoal-700 p-8 text-center space-y-3">
              <div className="flex justify-center">
                <CheckCircle2 className="w-10 h-10 text-lime-400" />
              </div>
              <h3 className="text-sm font-bold text-ivory-100 uppercase tracking-wider">
                Zero High-Risk IAM Vulnerabilities Detected
              </h3>
              <p className="text-xs text-ivory-400 max-w-md mx-auto leading-relaxed">
                All scanned IAM credentials and policies comply with least-privilege benchmarks. No unrotated keys or lateral movement pathways identified.
              </p>
            </div>
          ) : (
            risks.map((risk) => (
            <div
              key={risk.id}
              className="bg-charcoal-850 border border-charcoal-700 p-6 space-y-4 text-xs font-mono"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-charcoal-750 pb-3">
                <div className="flex items-center gap-3">
                  <SeverityBadge severity={risk.riskLevel} size="sm" />
                  <span className="font-bold text-sm text-ivory-100">
                    {risk.entityName}
                  </span>
                  <span className="px-1.5 py-0.2 bg-charcoal-800 text-ivory-400 border border-charcoal-700 text-[10px] uppercase">
                    {risk.entityType}
                  </span>
                </div>

                <div className="text-[11px] text-ivory-400">
                  Finding Type: <strong className="text-lime-400">{risk.findingType}</strong>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <p className="text-ivory-200 leading-relaxed text-xs">
                    {risk.description}
                  </p>

                  <div className="p-3 bg-charcoal-900 border border-charcoal-750 space-y-1">
                    <span className="text-[10px] text-lime-400 font-bold uppercase block">
                      REMEDIATION RECOMMENDATION:
                    </span>
                    <p className="text-ivory-300 text-[11px] leading-relaxed">
                      {risk.remediationRecommendation}
                    </p>
                  </div>
                </div>

                {/* Policy Snippet */}
                <div className="space-y-1">
                  <span className="text-[10px] text-ivory-500 uppercase font-bold block">
                    Flagged Policy Statement / Credential Metadata:
                  </span>
                  <pre className="p-3 bg-charcoal-950 border border-charcoal-800 text-[#FF8585] text-[10px] overflow-x-auto max-h-40">
                    {risk.policySnippet}
                  </pre>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-charcoal-750 text-[11px]">
                <span className="text-ivory-500">
                  Target ARN: <code className="text-ivory-300">{risk.arn}</code>
                </span>
                <Link href="/response-playbooks">
                  <Button variant="secondary" size="sm" className="gap-1 text-[11px] py-1">
                    <span>Generate Scoped Proposal</span>
                    <ArrowRight className="w-3 h-3" />
                  </Button>
                </Link>
              </div>
            </div>
          )))}
        </div>
      </div>
    </ConsoleShell>
  );
}
