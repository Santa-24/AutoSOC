"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Network,
  Shield,
  Activity,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  BookOpen,
} from "lucide-react";
import { ConsoleNav } from "@/components/layout/console-nav";
import { ConsoleSidebar } from "@/components/layout/console-sidebar";
import { DemoBanner } from "@/components/ui/demo-banner";
import { Button } from "@/components/ui/button";
import type { SystemHealthReport } from "@/lib/aws/health";
import { IntegrationStatus } from "@/types/security";

export default function IntegrationsPage() {
  const [health, setHealth] = useState<SystemHealthReport | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const checkHealth = async () => {
    setIsVerifying(true);
    try {
      const res = await fetch("/api/health");
      const data = await res.json();
      setHealth(data);
    } catch {
      // Fallback
    } finally {
      setIsVerifying(false);
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  return (
    <div className="min-h-screen bg-charcoal-900 text-ivory-100 flex flex-col font-mono selection:bg-lime-500 selection:text-charcoal-950">
      <DemoBanner />
      <ConsoleNav user={null} />

      <div className="flex-1 flex overflow-hidden">
        <ConsoleSidebar />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-charcoal-700 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <Network className="w-5 h-5 text-lime-400" />
                <h1 className="text-xl sm:text-2xl font-black uppercase text-ivory-100">
                  AWS Service Integrations & Health Gates
                </h1>
              </div>
              <p className="text-xs text-ivory-400 mt-0.5">
                Real-time server-side STS and API verification for all 15 operational security adapters
              </p>
            </div>

            <Button
              onClick={checkHealth}
              isLoading={isVerifying}
              variant="secondary"
              size="sm"
              className="gap-2"
            >
              <RefreshCw className="w-3.5 h-3.5 text-lime-400" />
              <span>RE-VERIFY SERVER-SIDE INTEGRATIONS</span>
            </Button>
          </div>

          {/* Identity & Precedence Status Banner */}
          <div className="bg-charcoal-850 border border-charcoal-700 p-5 space-y-3 text-xs">
            <div className="flex items-center justify-between border-b border-charcoal-750 pb-2">
              <span className="font-bold text-ivory-200 uppercase tracking-wider">
                Resolved AWS Caller Identity
              </span>
              <span
                className={`text-[10px] px-2 py-0.5 font-bold uppercase border ${
                  health?.awsIdentity.connected
                    ? "bg-lime-950 text-lime-400 border-lime-800"
                    : "bg-[#3D1414] text-[#FF8585] border-[#6E2222]"
                }`}
              >
                {health?.awsIdentity.connected ? "STS HEALTHY" : "CREDENTIALS ABSENT"}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-[11px]">
              <div>
                <span className="text-ivory-500 block text-[10px]">ACCOUNT ID:</span>
                <span className="text-ivory-100 font-bold">
                  {health?.awsIdentity.accountId || "None"}
                </span>
              </div>
              <div>
                <span className="text-ivory-500 block text-[10px]">AUTH METHOD:</span>
                <span className="text-lime-400 font-bold">
                  {health?.awsIdentity.authMethod || "IAM_ROLE_OR_SSO"}
                </span>
              </div>
              <div>
                <span className="text-ivory-500 block text-[10px]">ACTIVE REGION:</span>
                <span className="text-ivory-100 font-bold">
                  {health?.awsIdentity.region || "ap-south-1"}
                </span>
              </div>
            </div>

            {health?.awsIdentity.errorMessage && (
              <div className="p-3 bg-charcoal-900 border border-charcoal-750 text-[#FF9999] text-[11px] leading-relaxed">
                <span className="text-[#FF6666] font-bold block mb-0.5">
                  STATUS DIAGNOSTIC:
                </span>
                {health.awsIdentity.errorMessage}
                <div className="mt-1">
                  Follow <Link href="/docs" className="text-lime-400 underline">AWS_CREDENTIALS_SETUP.txt</Link> to configure IAM Identity Center or AWS CLI profiles.
                </div>
              </div>
            )}
          </div>

          {/* Integrations Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            {health?.integrations.map((svc) => (
              <div
                key={svc.service}
                className="bg-charcoal-850 border border-charcoal-700 p-5 space-y-3 relative flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between border-b border-charcoal-750 pb-2">
                    <span className="font-bold text-sm text-ivory-100">
                      {svc.service === "Bedrock" ? "Bedrock / Groq Cloud AI" : svc.service}
                    </span>
                    {svc.connected ? (
                      <span className="inline-flex items-center gap-1 text-[10px] text-lime-400 font-bold bg-lime-950 px-1.5 py-0.2 border border-lime-800">
                        <CheckCircle2 className="w-3 h-3 text-lime-400" />
                        CONNECTED
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] text-ivory-400 bg-charcoal-900 px-1.5 py-0.2 border border-charcoal-750">
                        <XCircle className="w-3 h-3 text-ivory-500" />
                        STANDBY
                      </span>
                    )}
                  </div>

                  <p className="text-[11px] text-ivory-400 leading-relaxed">
                    {svc.costNote}
                  </p>

                  {svc.missingPermissions && svc.missingPermissions.length > 0 && (
                    <div className="space-y-1 pt-1">
                      <span className="text-[10px] text-ivory-500 block uppercase">
                        Required IAM Permissions:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {svc.missingPermissions.map((perm) => (
                          <span
                            key={perm}
                            className="px-1.5 py-0.2 bg-charcoal-900 border border-charcoal-800 text-[10px] text-lime-400 font-mono"
                          >
                            {perm}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {svc.safeErrorMessage && (
                    <div className="p-2 bg-charcoal-900 border border-charcoal-800 text-[10px] text-ivory-400 mt-2">
                      <span className="text-[#FF8080] font-bold block mb-0.5">Note:</span>
                      {svc.safeErrorMessage}
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-charcoal-750 flex items-center justify-between text-[10px]">
                  <span className="text-ivory-500">
                    Flag: {svc.configured ? "ENABLED" : "DISABLED"}
                  </span>
                  <Link
                    href={svc.setupGuideUrl || "/docs"}
                    className="text-lime-400 hover:underline flex items-center gap-1"
                  >
                    <span>Setup Guide</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
