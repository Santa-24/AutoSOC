import React from "react";
import Link from "next/link";
import {
  ShieldAlert,
  AlertOctagon,
  Activity,
  CheckCircle2,
  Clock,
  ArrowRight,
  Terminal,
  ExternalLink,
  Cpu,
  Layers,
  Database,
  Radio,
} from "lucide-react";
import { ConsoleShell } from "@/components/layout/console-shell";
import { MetricCard } from "@/components/ui/metric-card";
import { SeverityBadge, StatusBadge, DemoTag } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getAllIncidents, getAllSecurityFindings } from "@/lib/store/soc-store";
import { getAggregatedHealthStatus } from "@/lib/aws/health";
import { getAuditEvents } from "@/lib/audit/logger";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const incidents = await getAllIncidents();
  const findings = await getAllSecurityFindings();
  const health = await getAggregatedHealthStatus();
  const recentAudit = getAuditEvents({ limit: 5 });

  const criticalCount = findings.filter((f) => f.severity === "CRITICAL").length;
  const highCount = findings.filter((f) => f.severity === "HIGH").length;
  const mediumCount = findings.filter((f) => f.severity === "MEDIUM").length;

  return (
    <ConsoleShell>
      <div className="space-y-6">
        {/* Page Title & Status */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-charcoal-700 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-lime-400 animate-pulse" />
              <h1 className="text-xl sm:text-2xl font-black font-mono tracking-tight uppercase text-ivory-100">
                SecOps Command Center
              </h1>
            </div>
            <p className="text-xs font-mono text-ivory-400 mt-0.5">
              Unified threat telemetry correlation & response workbench (Region: {health.awsIdentity.region})
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/investigations">
              <Button variant="secondary" size="sm" className="gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-lime-400" />
                <span>AI Investigation</span>
              </Button>
            </Link>
            <Link href="/incidents">
              <Button size="sm" className="gap-1.5">
                <AlertOctagon className="w-3.5 h-3.5" />
                <span>View All Findings</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Top High-Density Metric Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            label="Cloud Security Risk Index"
            value="74 / 100"
            subtitle="Elevated Risk (2 critical vectors)"
            change="+6 pts"
            changeType="negative"
            sparklineData={[45, 52, 48, 62, 59, 71, 74]}
            sparklineColor="alert"
            icon={<ShieldAlert className="w-4 h-4 text-[#FF6666]" />}
          />
          <MetricCard
            label="Active Correlated Incidents"
            value={incidents.length}
            subtitle="1 awaiting approval gate"
            change="1 new"
            changeType="negative"
            sparklineData={[1, 1, 2, 1, 2, 2, 2]}
            sparklineColor="alert"
            icon={<AlertOctagon className="w-4 h-4 text-[#FFA066]" />}
          />
          <MetricCard
            label="Ingested Telemetry Findings"
            value={findings.length}
            subtitle="Across GuardDuty, Hub, Config"
            change="100% correlated"
            changeType="positive"
            sparklineData={[12, 18, 22, 28, 32, 38, 42]}
            sparklineColor="lime"
            icon={<Activity className="w-4 h-4 text-lime-400" />}
          />
          <MetricCard
            label="Mean Time to Triage (MTTT)"
            value="14.2s"
            subtitle="Autonomous correlation loop"
            change="-68% vs manual"
            changeType="positive"
            sparklineData={[48, 42, 35, 29, 21, 16, 14]}
            sparklineColor="lime"
            icon={<Clock className="w-4 h-4 text-lime-400" />}
          />
        </div>

        {/* Severity Distribution & Quick Filters Bar */}
        <div className="bg-charcoal-850 border border-charcoal-700 p-4 flex flex-wrap items-center justify-between gap-4 font-mono text-xs">
          <div className="flex items-center gap-6">
            <span className="text-[11px] font-bold text-ivory-400 uppercase tracking-widest">
              Severity Distribution:
            </span>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 text-[#FF6666] font-bold">
                <span className="w-2 h-2 rounded-full bg-[#FF4747]" />
                {criticalCount} Critical
              </span>
              <span className="flex items-center gap-1.5 text-[#FFA066] font-bold">
                <span className="w-2 h-2 rounded-full bg-[#FF823C]" />
                {highCount} High
              </span>
              <span className="flex items-center gap-1.5 text-[#FFCC66] font-bold">
                <span className="w-2 h-2 rounded-full bg-[#F5B438]" />
                {mediumCount} Medium
              </span>
              <span className="flex items-center gap-1.5 text-lime-400 font-bold">
                <span className="w-2 h-2 rounded-full bg-[#96C252]" />
                0 Low
              </span>
            </div>
          </div>

          <div className="text-[11px] text-ivory-400 flex items-center gap-2">
            <span>Correlation Engine:</span>
            <span className="px-1.5 py-0.5 bg-lime-950 text-lime-400 border border-lime-800 font-bold">
              ACTIVE (Cross-Plane)
            </span>
          </div>
        </div>

        {/* Main Dashboard 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Active Incidents Table */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold font-mono uppercase tracking-wider text-ivory-100 flex items-center gap-2">
                <AlertOctagon className="w-4 h-4 text-lime-400" />
                Active Security Incidents
              </h2>
              <Link
                href="/incidents"
                className="text-xs font-mono text-lime-400 hover:underline flex items-center gap-1"
              >
                <span>All Findings</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="space-y-3 font-mono">
              {incidents.map((incident) => (
                <div
                  key={incident.id}
                  className="bg-charcoal-850 border border-charcoal-700 hover:border-charcoal-600 transition p-4 space-y-3 relative group"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-charcoal-750 pb-2.5">
                    <div className="flex items-center gap-2">
                      <SeverityBadge severity={incident.severity} size="sm" />
                      <span className="text-xs font-bold text-ivory-100">
                        {incident.id}
                      </span>
                      {incident.isDemo && <DemoTag />}
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <StatusBadge status={incident.status} />
                      <span className="text-[10px] text-ivory-500">
                        {incident.createdAt.slice(11, 16)} UTC
                      </span>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-ivory-100">
                      {incident.title}
                    </h3>
                    <p className="text-xs text-ivory-400 mt-1 leading-relaxed line-clamp-2">
                      {incident.summary}
                    </p>
                  </div>

                  {/* Resource Badges */}
                  <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px]">
                    <span className="text-ivory-500 text-[10px] uppercase">
                      Affected:
                    </span>
                    {incident.affectedResources.map((res) => (
                      <span
                        key={res.id}
                        className="px-2 py-0.5 bg-charcoal-900 border border-charcoal-750 text-ivory-300 text-[10px]"
                      >
                        {res.type.replace("AWS::", "")}: {res.id}
                      </span>
                    ))}
                  </div>

                  {/* Footer Actions */}
                  <div className="flex items-center justify-between pt-2 border-t border-charcoal-750 text-xs">
                    <span className="text-[10px] text-ivory-500">
                      Owner: {incident.owner}
                    </span>
                    <Link href={`/incidents/${incident.id}`}>
                      <Button variant="secondary" size="sm" className="gap-1 text-[11px] py-1">
                        <span>Investigate & Respond</span>
                        <ArrowRight className="w-3 h-3" />
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: AWS Integrations & Audit Activity */}
          <div className="space-y-6">
            {/* AWS Service Health Panel */}
            <div className="bg-charcoal-850 border border-charcoal-700 p-4 space-y-4 font-mono text-xs">
              <div className="flex items-center justify-between border-b border-charcoal-700 pb-2">
                <span className="font-bold text-ivory-100 uppercase tracking-wider flex items-center gap-2">
                  <Activity className="w-3.5 h-3.5 text-lime-400" />
                  AWS Ingestion Status
                </span>
                <Link
                  href="/integrations"
                  className="text-[10px] text-lime-400 hover:underline"
                >
                  Manage
                </Link>
              </div>

              <div className="space-y-2.5">
                {health.integrations.slice(0, 6).map((svc) => (
                  <div
                    key={svc.service}
                    className="flex items-center justify-between py-1 border-b border-charcoal-800 text-[11px]"
                  >
                    <span className="text-ivory-300">{svc.service}</span>
                    <div className="flex items-center gap-2">
                      {svc.connected ? (
                        <span className="inline-flex items-center gap-1 text-lime-400 font-bold">
                          <span className="w-1.5 h-1.5 rounded-full bg-lime-400 animate-pulse" />
                          CONNECTED
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-ivory-500">
                          <span className="w-1.5 h-1.5 rounded-full bg-charcoal-600" />
                          DEMO / STANDBY
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-2.5 bg-charcoal-900 border border-charcoal-800 text-[10px] text-ivory-400 leading-relaxed">
                <span className="text-ivory-300 font-bold block mb-0.5">
                  Caller Identity:
                </span>
                {health.awsIdentity.connected
                  ? `AWS Account: ${health.awsIdentity.accountId} (${health.awsIdentity.authMethod})`
                  : "No live AWS credentials detected. Running in Demo Mode."}
              </div>
            </div>

            {/* Recent Analyst Actions */}
            <div className="bg-charcoal-850 border border-charcoal-700 p-4 space-y-4 font-mono text-xs">
              <div className="flex items-center justify-between border-b border-charcoal-700 pb-2">
                <span className="font-bold text-ivory-100 uppercase tracking-wider flex items-center gap-2">
                  <Terminal className="w-3.5 h-3.5 text-lime-400" />
                  Recent Audit Actions
                </span>
                <Link href="/audit-log" className="text-[10px] text-lime-400 hover:underline">
                  Full Log
                </Link>
              </div>

              <div className="space-y-3">
                {recentAudit.map((evt) => (
                  <div key={evt.id} className="text-[11px] space-y-0.5 border-b border-charcoal-800 pb-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-ivory-200">{evt.action}</span>
                      <span
                        className={`text-[9px] px-1 py-0.2 border uppercase ${
                          evt.outcome === "SUCCESS"
                            ? "bg-lime-950 text-lime-400 border-lime-800"
                            : evt.outcome === "DENIED"
                            ? "bg-[#3D1414] text-[#FF8585] border-[#6E2222]"
                            : "bg-charcoal-800 text-ivory-400 border-charcoal-700"
                        }`}
                      >
                        {evt.outcome}
                      </span>
                    </div>
                    <div className="text-[10px] text-ivory-400 truncate">
                      Target: {evt.target}
                    </div>
                    <div className="text-[9px] text-ivory-500 flex items-center justify-between">
                      <span>By: {evt.actor}</span>
                      <span>{evt.timestamp.slice(11, 19)} UTC</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </ConsoleShell>
  );
}
