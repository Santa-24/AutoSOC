"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  AlertOctagon,
  ShieldAlert,
  Clock,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Play,
  Terminal,
  Cpu,
  Layers,
  FileText,
  UserCheck,
  Send,
} from "lucide-react";
import { ConsoleNav } from "@/components/layout/console-nav";
import { ConsoleSidebar } from "@/components/layout/console-sidebar";
import { DemoBanner } from "@/components/ui/demo-banner";
import { SeverityBadge, StatusBadge, DemoTag } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmationModal } from "@/components/ui/modal";
import { DEMO_INCIDENTS, DEMO_SECURITY_FINDINGS } from "@/lib/demo/synthetic-data";
import { PlaybookId, DryRunResult, ResponseAction } from "@/types/security";

export default function IncidentDetailPage() {
  const params = useParams();
  const incidentId = (params?.id as string) || "INC-2026-9041";
  const incident = DEMO_INCIDENTS.find((i) => i.id === incidentId) || DEMO_INCIDENTS[0];
  const relatedFindings = DEMO_SECURITY_FINDINGS.filter((f) =>
    incident.findingIds.includes(f.id)
  );

  // Remediation State
  const [selectedPlaybook, setSelectedPlaybook] = useState<PlaybookId>("EC2_QUARANTINE_ISOLATION");
  const [targetResource, setTargetResource] = useState("i-0a81f33b1e");
  const [dryRunResult, setDryRunResult] = useState<DryRunResult | null>(null);
  const [isDryRunning, setIsDryRunning] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executedAction, setExecutedAction] = useState<ResponseAction | null>(null);

  // Notes state
  const [notes, setNotes] = useState(incident.notes);
  const [newNote, setNewNote] = useState("");

  // Dry run simulation call
  const handleRunDryRun = async () => {
    setIsDryRunning(true);
    try {
      const res = await fetch("/api/remediation/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          playbookId: selectedPlaybook,
          targetResource,
        }),
      });
      const data = await res.json();
      setDryRunResult(data);
    } catch {
      // Fallback preview
      setDryRunResult({
        playbookId: selectedPlaybook,
        targetResource,
        simulatedAction: `aws ec2 modify-instance-attribute --instance-id ${targetResource} --groups sg-quarantine-autosoc-isolated`,
        affectedDependencies: ["VPC Elastic Network Interface", "Port 22/443 TCP Sockets"],
        potentialOutageRisk: "HIGH (Workload network connection severed)",
        canExecuteSafely: true,
        generatedCommandProposal: `ec2:ModifyInstanceAttribute(InstanceId='${targetResource}', Groups=['sg-quarantine-autosoc-isolated'])`,
      });
    } finally {
      setIsDryRunning(false);
    }
  };

  // Execution call
  const handleConfirmExecution = async () => {
    setIsExecuting(true);
    try {
      const res = await fetch("/api/remediation/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          incidentId,
          playbookId: selectedPlaybook,
          targetResource,
          confirmedApproval: true,
        }),
      });
      const action = await res.json();
      setExecutedAction(action);
      setIsConfirmModalOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsExecuting(false);
    }
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    setNotes([
      ...notes,
      {
        id: `note-${Date.now()}`,
        author: "Alex Vance (SecOps Principal)",
        timestamp: new Date().toISOString(),
        content: newNote.trim(),
      },
    ]);
    setNewNote("");
  };

  return (
    <div className="min-h-screen bg-charcoal-900 text-ivory-100 flex flex-col font-mono selection:bg-lime-500 selection:text-charcoal-950">
      <DemoBanner isDemoMode={true} awsConnected={false} />
      <ConsoleNav user={null} />

      <div className="flex-1 flex overflow-hidden">
        <ConsoleSidebar />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          {/* Back link & Title */}
          <div className="space-y-3 border-b border-charcoal-700 pb-4">
            <Link
              href="/incidents"
              className="inline-flex items-center gap-1.5 text-xs text-ivory-400 hover:text-lime-400 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Incidents Manager</span>
            </Link>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <SeverityBadge severity={incident.severity} size="md" />
                <h1 className="text-xl sm:text-2xl font-black uppercase text-ivory-100">
                  {incident.id}: {incident.title}
                </h1>
                {incident.isDemo && <DemoTag />}
              </div>

              <div className="flex items-center gap-3">
                <StatusBadge status={incident.status} />
                <span className="text-xs text-ivory-400">
                  Owner: <strong className="text-ivory-200">{incident.owner}</strong>
                </span>
              </div>
            </div>
          </div>

          {/* AI Grounded Synthesis Box */}
          <div className="p-5 bg-charcoal-850 border-l-4 border-lime-500 border-r border-t border-b border-charcoal-700 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-lime-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-lime-400">
                  Synthesized Incident Context & Attack Correlation
                </span>
              </div>
              <span className="text-[10px] px-2 py-0.5 bg-lime-950 text-lime-400 border border-lime-800">
                AI-assisted, verify before action
              </span>
            </div>
            <p className="text-xs text-ivory-200 leading-relaxed">
              {incident.summary}
            </p>
            <div className="text-[11px] text-ivory-400 flex items-center gap-4 pt-1 border-t border-charcoal-750">
              <span>Model: Claude 3 Sonnet (Amazon Bedrock)</span>
              <span>Confidence: 98%</span>
              <span>Evidence Pointers: 2 Findings, 1 Flow Log</span>
            </div>
          </div>

          {/* 2-Column Grid: Left Telemetry & Timeline / Right Remediation Workbench */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left 7 Columns: Findings, Resources, Timeline */}
            <div className="lg:col-span-7 space-y-6">
              {/* Affected Resources Card */}
              <div className="bg-charcoal-850 border border-charcoal-700 p-4 space-y-3 text-xs">
                <h2 className="font-bold text-ivory-100 uppercase tracking-wider">
                  Target Resources in Blast Radius
                </h2>
                <div className="space-y-2">
                  {incident.affectedResources.map((res) => (
                    <div
                      key={res.id}
                      className="p-3 bg-charcoal-900 border border-charcoal-750 flex items-center justify-between"
                    >
                      <div>
                        <span className="text-[10px] text-ivory-400 block uppercase">
                          {res.type}
                        </span>
                        <span className="font-bold text-lime-400 text-sm">
                          {res.id}
                        </span>
                      </div>
                      <span className="text-[11px] text-ivory-500">
                        {res.region || "ap-south-1"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Related Findings */}
              <div className="bg-charcoal-850 border border-charcoal-700 p-4 space-y-3 text-xs">
                <h2 className="font-bold text-ivory-100 uppercase tracking-wider">
                  Correlated Telemetry Findings ({relatedFindings.length})
                </h2>
                <div className="space-y-3">
                  {relatedFindings.map((f) => (
                    <div
                      key={f.id}
                      className="p-3 bg-charcoal-900 border border-charcoal-750 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <SeverityBadge severity={f.severity} size="sm" />
                          <span className="font-bold text-ivory-200">{f.title}</span>
                        </div>
                        <span className="text-[10px] text-ivory-400">{f.source}</span>
                      </div>
                      <p className="text-[11px] text-ivory-300 leading-relaxed">
                        {f.description}
                      </p>
                      {f.evidenceReferences.length > 0 && (
                        <div className="p-2 bg-charcoal-950 border border-charcoal-800 text-[10px] text-ivory-400">
                          <span className="text-lime-400 font-bold block mb-0.5">
                            EVIDENCE SNIPPET:
                          </span>
                          {f.evidenceReferences[0]}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Event Timeline */}
              <div className="bg-charcoal-850 border border-charcoal-700 p-4 space-y-3 text-xs">
                <h2 className="font-bold text-ivory-100 uppercase tracking-wider flex items-center gap-2">
                  <Clock className="w-4 h-4 text-lime-400" />
                  Chronological Event Timeline
                </h2>
                <div className="space-y-4 pl-2 border-l border-charcoal-700 ml-2">
                  {incident.timeline.map((event) => (
                    <div key={event.id} className="relative pl-4 space-y-1">
                      <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-lime-400 border-2 border-charcoal-900" />
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-ivory-200">{event.title}</span>
                        <span className="text-[10px] text-ivory-500">
                          {event.timestamp.slice(11, 19)} UTC
                        </span>
                      </div>
                      <p className="text-[11px] text-ivory-400 leading-relaxed">
                        {event.description}
                      </p>
                      <span className="text-[10px] px-1.5 py-0.2 bg-charcoal-900 border border-charcoal-800 text-ivory-400 inline-block">
                        Source: {event.source}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right 5 Columns: Response Playbook Workbench & Analyst Notes */}
            <div className="lg:col-span-5 space-y-6">
              {/* Playbook Execution Guardrail Workbench */}
              <div className="bg-charcoal-850 border-2 border-charcoal-700 p-5 space-y-4 text-xs">
                <div className="border-b border-charcoal-700 pb-2">
                  <span className="text-[10px] text-lime-400 font-bold uppercase tracking-widest block">
                    Response Safeguard Gate
                  </span>
                  <h2 className="text-base font-bold text-ivory-100 uppercase">
                    Playbook Execution Workbench
                  </h2>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-[11px] text-ivory-400 block mb-1 uppercase">
                      Select Response Playbook:
                    </label>
                    <select
                      value={selectedPlaybook}
                      onChange={(e) => {
                        setSelectedPlaybook(e.target.value as PlaybookId);
                        setDryRunResult(null);
                      }}
                      className="w-full bg-charcoal-900 border border-charcoal-700 px-3 py-2 text-xs text-ivory-100 focus:outline-none focus:border-lime-500"
                    >
                      <option value="EC2_QUARANTINE_ISOLATION">
                        EC2 Hypervisor Quarantine Isolation
                      </option>
                      <option value="S3_BLOCK_PUBLIC_ACCESS">
                        S3 Public Access Block Enforcement
                      </option>
                      <option value="IAM_ACCESS_KEY_DEACTIVATION">
                        IAM Access Key Immediate Deactivation
                      </option>
                      <option value="WAF_IP_REPUTATION_BLOCK">
                        AWS WAF Perimeter IP Blocklist
                      </option>
                      <option value="IAM_EXCESSIVE_PERMS_PROPOSAL">
                        IAM Least-Privilege Change Proposal
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] text-ivory-400 block mb-1 uppercase">
                      Target Resource Identifier:
                    </label>
                    <input
                      type="text"
                      value={targetResource}
                      onChange={(e) => {
                        setTargetResource(e.target.value);
                        setDryRunResult(null);
                      }}
                      placeholder="e.g. i-0a81f33b1e or bucket-name"
                      className="w-full bg-charcoal-900 border border-charcoal-700 px-3 py-2 text-xs text-ivory-100 focus:outline-none focus:border-lime-500 font-mono"
                    />
                  </div>

                  {/* Dry Run Button */}
                  <Button
                    onClick={handleRunDryRun}
                    isLoading={isDryRunning}
                    variant="secondary"
                    size="md"
                    className="w-full gap-2"
                  >
                    <Terminal className="w-4 h-4 text-lime-400" />
                    <span>GENERATE DRY-RUN BLAST RADIUS PREVIEW</span>
                  </Button>
                </div>

                {/* Dry Run Preview Output */}
                {dryRunResult && (
                  <div className="p-4 bg-charcoal-900 border border-charcoal-750 space-y-3">
                    <div className="flex items-center justify-between border-b border-charcoal-800 pb-2">
                      <span className="text-lime-400 font-bold uppercase tracking-wider text-[11px]">
                        Dry-Run Simulation Succeeded
                      </span>
                      <span className="text-[10px] px-1.5 py-0.2 bg-lime-950 text-lime-400 border border-lime-800 font-bold">
                        NON-DESTRUCTIVE PREVIEW
                      </span>
                    </div>

                    <div className="space-y-1.5 text-[11px]">
                      <div>
                        <span className="text-ivory-500 block text-[10px]">PROPOSED CLI MUTATION:</span>
                        <code className="text-lime-300 break-all text-[10px] block p-1.5 bg-charcoal-950 border border-charcoal-800">
                          {dryRunResult.simulatedAction}
                        </code>
                      </div>
                      <div>
                        <span className="text-ivory-500 block text-[10px]">OUTAGE RISK EVALUATION:</span>
                        <span className="text-[#FFA066] font-bold">
                          {dryRunResult.potentialOutageRisk}
                        </span>
                      </div>
                    </div>

                    {/* Authorize button */}
                    <div className="pt-2">
                      <Button
                        onClick={() => setIsConfirmModalOpen(true)}
                        variant="danger"
                        size="md"
                        className="w-full gap-2"
                      >
                        <UserCheck className="w-4 h-4" />
                        <span>PROCEED TO AUTHORIZATION GATE</span>
                      </Button>
                    </div>
                  </div>
                )}

                {/* Executed Action Result Banner */}
                {executedAction && (
                  <div className="p-4 bg-lime-950/60 border border-lime-500 space-y-2">
                    <div className="flex items-center gap-2 text-lime-400 font-bold">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>RESPONSE ACTION EXECUTED & AUDITED</span>
                    </div>
                    <p className="text-[11px] text-ivory-200 leading-relaxed">
                      {executedAction.resultSummary}
                    </p>
                    <div className="text-[10px] text-ivory-400 pt-1 border-t border-lime-900/60 flex justify-between">
                      <span>AWS Req ID: {executedAction.awsRequestId}</span>
                      <span>Corr: {executedAction.correlationId}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Analyst Notes Section */}
              <div className="bg-charcoal-850 border border-charcoal-700 p-4 space-y-3 text-xs">
                <h2 className="font-bold text-ivory-100 uppercase tracking-wider flex items-center gap-2">
                  <FileText className="w-4 h-4 text-lime-400" />
                  Analyst Investigation Notes
                </h2>

                <div className="space-y-2.5 max-h-56 overflow-y-auto">
                  {notes.map((note) => (
                    <div
                      key={note.id}
                      className="p-2.5 bg-charcoal-900 border border-charcoal-750 space-y-1"
                    >
                      <div className="flex justify-between text-[10px] text-ivory-500">
                        <span className="font-bold text-ivory-300">{note.author}</span>
                        <span>{note.timestamp.slice(11, 16)} UTC</span>
                      </div>
                      <p className="text-[11px] text-ivory-300 leading-relaxed">
                        {note.content}
                      </p>
                    </div>
                  ))}
                </div>

                <form onSubmit={handleAddNote} className="pt-2 space-y-2">
                  <textarea
                    rows={2}
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Log investigative notes, IP whois, or memory capture references..."
                    className="w-full bg-charcoal-900 border border-charcoal-700 p-2 text-xs text-ivory-100 placeholder:text-ivory-500 focus:outline-none focus:border-lime-500"
                  />
                  <Button type="submit" size="sm" variant="secondary" className="gap-1.5 w-full">
                    <Send className="w-3.5 h-3.5 text-lime-400" />
                    <span>RECORD ANALYST NOTE</span>
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleConfirmExecution}
        isExecuting={isExecuting}
        title={`Execute ${selectedPlaybook}`}
        impactWarning="CRITICAL SERVICE IMPACT: This action alters live AWS infrastructure attributes. Workload connections will be immediately terminated."
        targetResource={targetResource}
        proposedAction={dryRunResult?.simulatedAction || "Simulated mutation"}
      />
    </div>
  );
}
