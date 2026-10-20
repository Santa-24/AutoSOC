"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  Terminal,
  ShieldAlert,
  Send,
  AlertTriangle,
  ExternalLink,
  Cpu,
  Layers,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import { ConsoleNav } from "@/components/layout/console-nav";
import { ConsoleSidebar } from "@/components/layout/console-sidebar";
import { DemoBanner } from "@/components/ui/demo-banner";
import { Button } from "@/components/ui/button";
import { DEMO_SECURITY_FINDINGS } from "@/lib/demo/synthetic-data";
import { AIInvestigationResponse, PlaybookId } from "@/types/security";

export default function InvestigationsPage() {
  const [analystPrompt, setAnalystPrompt] = useState(
    "Correlate the C2 beaconing on payments worker i-0a81f33b1e with recent S3 bucket policy changes. Summarize blast radius and propose immediate containment playbooks."
  );
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiResponse, setAiResponse] = useState<AIInvestigationResponse | null>({
    summary:
      "Automated cross-plane correlation identified active adversary progression: Outbound Cobalt Strike beaconing from EC2 instance i-0a81f33b1e was preceded by an unauthorized PutBucketPolicy call modifying prod-customer-invoice-vault. Threat actor appears to be staging customer invoice PII for egress via an external Tor exit node.",
    suggestedMitigations: [
      "Simulate EC2 Quarantine Security Group isolation (revokes all ingress/egress 0.0.0.0/0).",
      "Enforce S3 Public Access Block immediately on prod-customer-invoice-vault.",
      "Capture instance memory image for offline volatility analysis before terminating hypervisor.",
      "Deactivate active developer access key AKIAIOSFODNN7EXAMPLE.",
    ],
    evidencePointers: [
      {
        id: "DEMO-FND-8801",
        source: "GuardDuty",
        description: "Outbound C2 beaconing to 198.51.100.42:4444 from i-0a81f33b1e.",
      },
      {
        id: "DEMO-FND-8802",
        source: "SecurityHub",
        description: "S3.2 public read permission grant on prod-customer-invoice-vault.",
      },
      {
        id: "DEMO-CT-001",
        source: "CloudTrail",
        description: "PutBucketPolicy API invoked by david.dev via Tor exit node 203.0.113.88.",
      },
    ],
    recommendedPlaybook: "EC2_QUARANTINE_ISOLATION",
    uncertaintyDisclaimer: "AI-assisted, verify before action. AWS Bedrock Claude 3 output.",
    confidenceScore: 0.94,
    modelUsed: "Amazon Bedrock (anthropic.claude-3-sonnet-20240229-v1:0)",
    isFallback: false,
    redactedSensitiveTokensCount: 2,
  });

  const handleRunInvestigation = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAnalyzing(true);

    try {
      const res = await fetch("/api/investigations/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          incidentId: "INC-2026-9041",
          findingContext: DEMO_SECURITY_FINDINGS.slice(0, 3),
          analystPrompt,
        }),
      });

      if (!res.ok) {
        throw new Error("Investigation request failed.");
      }

      const data = await res.json();
      setAiResponse(data);
    } catch {
      // Deterministic fallback if API fails
      setAiResponse({
        summary:
          "Cross-correlation synthesis: Outbound C2 beaconing on EC2 instance i-0a81f33b1e coincides with public exposure of S3 bucket prod-customer-invoice-vault. Recommended action is immediate hypervisor quarantine isolation.",
        suggestedMitigations: [
          "Execute EC2 quarantine isolation dry-run.",
          "Apply S3 Public Access Block.",
          "Rotate developer credentials.",
        ],
        evidencePointers: [
          {
            id: "DEMO-FND-8801",
            source: "GuardDuty",
            description: "C2 Beaconing on i-0a81f33b1e",
          },
        ],
        recommendedPlaybook: "EC2_QUARANTINE_ISOLATION",
        uncertaintyDisclaimer:
          "AI-assisted deterministic synthesis. All actions require analyst confirmation.",
        confidenceScore: 0.92,
        modelUsed: "AutoSOC Deterministic SecOps Rule Engine (Offline Fallback)",
        isFallback: true,
        redactedSensitiveTokensCount: 0,
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-charcoal-900 text-ivory-100 flex flex-col font-mono selection:bg-lime-500 selection:text-charcoal-950">
      <DemoBanner isDemoMode={true} awsConnected={false} />
      <ConsoleNav user={null} />

      <div className="flex-1 flex overflow-hidden">
        <ConsoleSidebar />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-charcoal-700 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-lime-400" />
                <h1 className="text-xl sm:text-2xl font-black uppercase text-ivory-100">
                  AI Investigation Workbench
                </h1>
              </div>
              <p className="text-xs text-ivory-400 mt-0.5">
                Evidence-grounded cloud incident triage with prompt injection safeguards and secret redaction
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-ivory-400">Safeguard Engine:</span>
              <span className="px-2 py-0.5 bg-lime-950 text-lime-400 border border-lime-800 font-bold">
                PROMPT INJECTION DEFENSE ACTIVE
              </span>
            </div>
          </div>

          {/* Investigation Input Form */}
          <form
            onSubmit={handleRunInvestigation}
            className="bg-charcoal-850 border border-charcoal-700 p-5 space-y-4 text-xs"
          >
            <div className="flex items-center justify-between border-b border-charcoal-750 pb-2">
              <span className="font-bold text-ivory-200 uppercase tracking-wider">
                Analyst Investigation Prompt & Telemetry Scope
              </span>
              <span className="text-[10px] text-ivory-500">
                Context: Ingesting active findings from Security Hub & GuardDuty
              </span>
            </div>

            <div>
              <textarea
                rows={3}
                value={analystPrompt}
                onChange={(e) => setAnalystPrompt(e.target.value)}
                placeholder="Ask questions about blast radius, lateral movement, or recommended containment..."
                className="w-full bg-charcoal-900 border border-charcoal-700 p-3 text-xs text-ivory-100 placeholder:text-ivory-500 focus:outline-none focus:border-lime-500 font-mono"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <div className="flex items-center gap-2 text-[11px] text-ivory-400">
                <ShieldCheck className="w-4 h-4 text-lime-400" />
                <span>Secrets & AWS tokens automatically redacted before dispatch.</span>
              </div>

              <Button
                type="submit"
                isLoading={isAnalyzing}
                size="md"
                className="gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>EXECUTE EVIDENCE SYNTHESIS</span>
              </Button>
            </div>
          </form>

          {/* AI Response Display Card */}
          {aiResponse && (
            <div className="bg-charcoal-850 border-2 border-charcoal-700 p-6 space-y-6 text-xs">
              {/* Top Banner with Model & Disclaimer */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-charcoal-700 pb-3">
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-lime-400" />
                  <span className="font-bold text-ivory-100 uppercase">
                    {aiResponse.modelUsed}
                  </span>
                  {aiResponse.isFallback && (
                    <span className="text-[10px] px-1.5 py-0.2 bg-charcoal-800 text-ivory-400 border border-charcoal-700">
                      OFFLINE BASELINE
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-[11px] text-ivory-400">
                    Confidence: <strong className="text-lime-400">{Math.round(aiResponse.confidenceScore * 100)}%</strong>
                  </span>
                  <span className="text-[10px] px-2 py-0.5 bg-[#2E2010] text-[#FFB366] border border-[#5E381A] font-bold uppercase">
                    {aiResponse.uncertaintyDisclaimer}
                  </span>
                </div>
              </div>

              {/* Synthesized Attack Path Summary */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-lime-400 uppercase tracking-widest block">
                  SYNTHESIZED THREAT ASSESSMENT
                </span>
                <p className="text-sm text-ivory-200 leading-relaxed font-sans">
                  {aiResponse.summary}
                </p>
              </div>

              {/* Supporting Evidence Links (Grounded Requirement) */}
              <div className="space-y-3 pt-2">
                <span className="text-[10px] font-bold text-ivory-400 uppercase tracking-widest block">
                  GROUNDED EVIDENCE CITATIONS ({aiResponse.evidencePointers.length})
                </span>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {aiResponse.evidencePointers.map((ev) => (
                    <div
                      key={ev.id}
                      className="p-3 bg-charcoal-900 border border-charcoal-750 space-y-1"
                    >
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="font-bold text-lime-400">{ev.id}</span>
                        <span className="text-ivory-500 uppercase">{ev.source}</span>
                      </div>
                      <p className="text-[11px] text-ivory-300 leading-relaxed">
                        {ev.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommended Containment Mitigations */}
              <div className="space-y-3 pt-2">
                <span className="text-[10px] font-bold text-ivory-400 uppercase tracking-widest block">
                  PROPOSED CONTAINMENT PLAYBOOKS (REQUIRES ANALYST APPROVAL)
                </span>
                <div className="space-y-2">
                  {aiResponse.suggestedMitigations.map((step, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 bg-charcoal-900 border border-charcoal-750 flex items-center justify-between text-xs"
                    >
                      <span className="text-ivory-200">{step}</span>
                      {idx === 0 && (
                        <Link href="/response-playbooks">
                          <Button size="sm" variant="secondary" className="gap-1 py-1 text-[11px]">
                            <span>Stage Playbook</span>
                            <ArrowRight className="w-3 h-3" />
                          </Button>
                        </Link>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer Guardrail Notice */}
              <div className="p-3 bg-charcoal-900 border border-charcoal-800 text-[10px] text-ivory-400 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-[#FF823C] shrink-0" />
                <span>
                  <strong>CRITICAL NON-NEGOTIABLE:</strong> AutoSOC AI is strictly an advisory engine. Model outputs are completely isolated from privileged AWS mutation APIs. No cloud resource is ever altered without signed human analyst confirmation.
                </span>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
