"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  AlertTriangle,
  Play,
  Terminal,
  CheckCircle2,
  Lock,
  Server,
  Database,
  Radio,
  FileCheck2,
  Sliders,
} from "lucide-react";
import { ConsoleNav } from "@/components/layout/console-nav";
import { ConsoleSidebar } from "@/components/layout/console-sidebar";
import { DemoBanner } from "@/components/ui/demo-banner";
import { Button } from "@/components/ui/button";
import { ConfirmationModal } from "@/components/ui/modal";
import { PLAYBOOK_DEFINITIONS } from "@/lib/playbooks/definitions";
import { PlaybookId, DryRunResult, ResponseAction } from "@/types/security";

export default function PlaybooksCatalogPage() {
  const [selectedPlaybookId, setSelectedPlaybookId] = useState<PlaybookId>("S3_BLOCK_PUBLIC_ACCESS");
  const [targetResource, setTargetResource] = useState("autosoc-audit-941905484053");
  const [dryRunResult, setDryRunResult] = useState<DryRunResult | null>(null);
  const [isDryRunning, setIsDryRunning] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executedAction, setExecutedAction] = useState<ResponseAction | null>(null);

  const selectedPlaybook = PLAYBOOK_DEFINITIONS[selectedPlaybookId];

  const handleSimulate = async () => {
    setIsDryRunning(true);
    try {
      const res = await fetch("/api/remediation/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          playbookId: selectedPlaybookId,
          targetResource,
        }),
      });
      const data = await res.json();
      setDryRunResult(data);
    } catch {
      // Fallback
      setDryRunResult({
        playbookId: selectedPlaybookId,
        targetResource,
        simulatedAction: `Simulated dry-run command proposal for ${targetResource}`,
        affectedDependencies: ["Workload Network Ingress/Egress", "Active TCP connections"],
        potentialOutageRisk: "HIGH",
        canExecuteSafely: true,
        generatedCommandProposal: `Proposed dry-run simulation for ${selectedPlaybookId}`,
      });
    } finally {
      setIsDryRunning(false);
    }
  };

  const handleExecute = async () => {
    setIsExecuting(true);
    try {
      const res = await fetch("/api/remediation/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          incidentId: "INC-MANUAL-PLAYBOOK",
          playbookId: selectedPlaybookId,
          targetResource,
          confirmedApproval: true,
        }),
      });
      const data = await res.json();
      setExecutedAction(data);
      setIsConfirmModalOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsExecuting(false);
    }
  };

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
                <ShieldCheck className="w-5 h-5 text-lime-400" />
                <h1 className="text-xl sm:text-2xl font-black uppercase text-ivory-100">
                  Response Playbook Catalog & Safeguards
                </h1>
              </div>
              <p className="text-xs text-ivory-400 mt-0.5">
                Pre-approved AWS containment workflows with dry-run simulations and authorized human gates
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-ivory-400">Remediation Policy:</span>
              <span className="px-2 py-0.5 bg-lime-950 text-lime-400 border border-lime-800 font-bold uppercase">
                Approval Required
              </span>
            </div>
          </div>

          {/* 2-Column Catalog Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left 5 Cols: Playbook List */}
            <div className="lg:col-span-5 space-y-3">
              <span className="text-[11px] font-bold text-ivory-400 uppercase tracking-widest block">
                Available Playbooks ({Object.keys(PLAYBOOK_DEFINITIONS).length})
              </span>

              {Object.values(PLAYBOOK_DEFINITIONS).map((pb) => {
                const isSelected = selectedPlaybookId === pb.id;
                return (
                  <div
                    key={pb.id}
                    onClick={() => {
                      setSelectedPlaybookId(pb.id);
                      setDryRunResult(null);
                      setExecutedAction(null);
                      if (pb.targetService === "EC2") setTargetResource("i-0123456789abcdef0");
                      else if (pb.targetService === "S3") setTargetResource("autosoc-audit-941905484053");
                      else if (pb.targetService === "IAM") setTargetResource("AKIA5WTPRDEKVNPQMDYX");
                      else if (pb.targetService === "WAFv2") setTargetResource("203.0.113.88");
                    }}
                    className={`p-4 border cursor-pointer transition-all ${
                      isSelected
                        ? "bg-lime-950/50 border-lime-500 shadow-[0_0_15px_rgba(199,243,107,0.15)]"
                        : "bg-charcoal-850 border-charcoal-700 hover:border-charcoal-600"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-ivory-100">
                        {pb.name}
                      </span>
                      <span
                        className={`text-[9px] px-1.5 py-0.2 border uppercase font-bold ${
                          pb.riskImpact === "HIGH"
                            ? "bg-[#3D1414] text-[#FF8585] border-[#6E2222]"
                            : pb.riskImpact === "MEDIUM"
                            ? "bg-[#3D2814] text-[#FFA566] border-[#6E4222]"
                            : "bg-lime-950 text-lime-400 border-lime-800"
                        }`}
                      >
                        {pb.riskImpact} IMPACT
                      </span>
                    </div>

                    <p className="text-[11px] text-ivory-400 mt-1 line-clamp-2 leading-relaxed">
                      {pb.description}
                    </p>

                    <div className="flex items-center gap-3 mt-2 text-[10px] text-ivory-500">
                      <span>Service: {pb.targetService}</span>
                      <span>•</span>
                      <span>Gate: {pb.requiresApproval ? "Analyst Confirmation" : "Advisory"}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right 7 Cols: Detailed Playbook Workbench */}
            <div className="lg:col-span-7 space-y-6">
              <div className="bg-charcoal-850 border-2 border-charcoal-700 p-6 space-y-5 text-xs">
                {/* Header */}
                <div className="border-b border-charcoal-700 pb-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-lime-400 uppercase tracking-widest">
                      Playbook Definition: {selectedPlaybook.id}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 bg-charcoal-800 text-ivory-300 border border-charcoal-700 uppercase">
                      Target: AWS {selectedPlaybook.targetService}
                    </span>
                  </div>
                  <h2 className="text-lg font-bold text-ivory-100">
                    {selectedPlaybook.name}
                  </h2>
                  <p className="text-xs text-ivory-300 leading-relaxed">
                    {selectedPlaybook.description}
                  </p>
                </div>

                {/* Impact Warning */}
                <div className="p-3 bg-[#2E1212] border-l-4 border-[#FF4747] text-[#FFB3B3] space-y-1">
                  <span className="font-bold uppercase tracking-wider text-[11px] flex items-center gap-1.5 text-[#FF6666]">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    IMPACT WARNING
                  </span>
                  <p className="text-[11px] leading-relaxed">
                    {selectedPlaybook.impactWarning}
                  </p>
                </div>

                {/* Prerequisites & Required Permissions */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[11px]">
                  <div className="p-3 bg-charcoal-900 border border-charcoal-750 space-y-1.5">
                    <span className="font-bold text-ivory-300 uppercase block text-[10px]">
                      PREREQUISITES:
                    </span>
                    <ul className="space-y-1 text-ivory-400 list-disc list-inside">
                      {selectedPlaybook.prerequisites.map((p, i) => (
                        <li key={i}>{p}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-3 bg-charcoal-900 border border-charcoal-750 space-y-1.5">
                    <span className="font-bold text-ivory-300 uppercase block text-[10px]">
                      REQUIRED IAM PERMISSIONS:
                    </span>
                    <ul className="space-y-1 text-lime-400 font-mono text-[10px]">
                      {selectedPlaybook.requiredPermissions.map((perm, i) => (
                        <li key={i}>✓ {perm}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Rollback Notes */}
                <div className="p-3 bg-charcoal-900 border border-charcoal-750 space-y-1 text-[11px]">
                  <span className="font-bold text-ivory-300 uppercase block text-[10px]">
                    ROLLBACK & COMPENSATION PROCEDURE:
                  </span>
                  <p className="text-ivory-400 leading-relaxed">
                    {selectedPlaybook.rollbackNotes}
                  </p>
                </div>

                {/* Target Resource Input & Dry-run execution */}
                <div className="pt-2 border-t border-charcoal-700 space-y-3">
                  <div>
                    <label className="text-[11px] text-ivory-300 block mb-1 uppercase font-bold">
                      Target Resource for Staging:
                    </label>
                    <input
                      type="text"
                      value={targetResource}
                      onChange={(e) => {
                        setTargetResource(e.target.value);
                        setDryRunResult(null);
                      }}
                      className="w-full bg-charcoal-900 border border-charcoal-700 px-3 py-2 text-xs text-ivory-100 font-mono focus:outline-none focus:border-lime-500"
                    />
                  </div>

                  <Button
                    onClick={handleSimulate}
                    isLoading={isDryRunning}
                    variant="primary"
                    size="md"
                    className="w-full gap-2"
                  >
                    <Terminal className="w-4 h-4" />
                    <span>RUN DRY-RUN SIMULATION</span>
                  </Button>
                </div>

                {/* Dry Run Result Box */}
                {dryRunResult && (
                  <div className="p-4 bg-charcoal-900 border border-charcoal-750 space-y-3">
                    <div className="flex items-center justify-between border-b border-charcoal-800 pb-2">
                      <span className="text-lime-400 font-bold uppercase tracking-wider text-[11px]">
                        Dry-Run Simulation Output
                      </span>
                      <span className="text-[10px] text-ivory-400">
                        Target Validated
                      </span>
                    </div>

                    <div className="space-y-1 text-[11px]">
                      <span className="text-ivory-500 block text-[10px]">AWS CLI PROPOSAL:</span>
                      <code className="text-lime-300 block p-2 bg-charcoal-950 border border-charcoal-800 break-all text-[10px]">
                        {dryRunResult.simulatedAction}
                      </code>
                    </div>

                    <div className="pt-2">
                      <Button
                        onClick={() => setIsConfirmModalOpen(true)}
                        variant="danger"
                        size="md"
                        className="w-full gap-2"
                      >
                        <ShieldCheck className="w-4 h-4" />
                        <span>AUTHORIZE & EXECUTE REMEDIATION</span>
                      </Button>
                    </div>
                  </div>
                )}

                {/* Execution Success Banner */}
                {executedAction && (
                  <div className="p-4 bg-lime-950 border border-lime-500 space-y-2">
                    <div className="flex items-center gap-2 text-lime-400 font-bold">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>REMEDIATION AUDITED & APPLIED</span>
                    </div>
                    <p className="text-[11px] text-ivory-200">
                      {executedAction.resultSummary}
                    </p>
                    <div className="text-[10px] text-ivory-400 flex justify-between pt-1 border-t border-lime-900">
                      <span>AWS Req ID: {executedAction.awsRequestId}</span>
                      <span>Outcome: {executedAction.executionStatus}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>

      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleExecute}
        isExecuting={isExecuting}
        title={`Execute ${selectedPlaybook.name}`}
        impactWarning={selectedPlaybook.impactWarning}
        targetResource={targetResource}
        proposedAction={dryRunResult?.simulatedAction || "Simulated mutation"}
      />
    </div>
  );
}
