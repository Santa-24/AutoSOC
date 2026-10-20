"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  Filter,
  AlertOctagon,
  ArrowRight,
  ExternalLink,
  Shield,
  Layers,
} from "lucide-react";
import { ConsoleNav } from "@/components/layout/console-nav";
import { ConsoleSidebar } from "@/components/layout/console-sidebar";
import { DemoBanner } from "@/components/ui/demo-banner";
import { SeverityBadge, StatusBadge, DemoTag } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SecurityFinding, SeverityLevel, FindingStatus } from "@/types/security";
import { DEMO_SECURITY_FINDINGS } from "@/lib/demo/synthetic-data";

export default function IncidentsPage() {
  const [findings, setFindings] = useState<SecurityFinding[]>(DEMO_SECURITY_FINDINGS);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSeverity, setSelectedSeverity] = useState<string>("ALL");
  const [selectedSource, setSelectedSource] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");

  const filteredFindings = findings.filter((f) => {
    const matchesSearch =
      searchQuery === "" ||
      f.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.resources.some((r) => r.id.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesSeverity =
      selectedSeverity === "ALL" || f.severity === selectedSeverity;

    const matchesSource =
      selectedSource === "ALL" || f.source === selectedSource;

    const matchesStatus =
      selectedStatus === "ALL" || f.status === selectedStatus;

    return matchesSearch && matchesSeverity && matchesSource && matchesStatus;
  });

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
              <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-ivory-100 flex items-center gap-2">
                <AlertOctagon className="w-5 h-5 text-lime-400" />
                Security Findings & Incident Telemetry
              </h1>
              <p className="text-xs text-ivory-400 mt-0.5">
                Multi-source aggregated finding feed across Security Hub, GuardDuty, and Inspector
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-ivory-400">Total Findings:</span>
              <span className="px-2 py-0.5 bg-charcoal-800 border border-charcoal-700 font-bold text-lime-400">
                {filteredFindings.length} of {findings.length}
              </span>
            </div>
          </div>

          {/* Search & Filter Toolbar */}
          <div className="bg-charcoal-850 border border-charcoal-700 p-4 space-y-3">
            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
              {/* Search input */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-ivory-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter by keyword, CVE, resource ID, IP, or title..."
                  className="w-full bg-charcoal-900 border border-charcoal-700 pl-9 pr-3 py-2 text-xs text-ivory-100 placeholder:text-ivory-500 focus:outline-none focus:border-lime-500 transition-colors"
                />
              </div>

              {/* Severity filter */}
              <div className="flex items-center gap-2 text-xs">
                <span className="text-ivory-400 text-[11px] uppercase">Severity:</span>
                <select
                  value={selectedSeverity}
                  onChange={(e) => setSelectedSeverity(e.target.value)}
                  className="bg-charcoal-900 border border-charcoal-700 px-2 py-2 text-xs text-ivory-200 focus:outline-none focus:border-lime-500"
                >
                  <option value="ALL">All Severities</option>
                  <option value="CRITICAL">Critical</option>
                  <option value="HIGH">High</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="LOW">Low</option>
                </select>
              </div>

              {/* Source filter */}
              <div className="flex items-center gap-2 text-xs">
                <span className="text-ivory-400 text-[11px] uppercase">Source:</span>
                <select
                  value={selectedSource}
                  onChange={(e) => setSelectedSource(e.target.value)}
                  className="bg-charcoal-900 border border-charcoal-700 px-2 py-2 text-xs text-ivory-200 focus:outline-none focus:border-lime-500"
                >
                  <option value="ALL">All Sources</option>
                  <option value="GuardDuty">GuardDuty</option>
                  <option value="SecurityHub">Security Hub</option>
                  <option value="Inspector">Inspector</option>
                  <option value="Config">Config</option>
                </select>
              </div>

              {/* Reset */}
              {(searchQuery || selectedSeverity !== "ALL" || selectedSource !== "ALL") && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedSeverity("ALL");
                    setSelectedSource("ALL");
                  }}
                  className="text-xs text-lime-400 hover:underline px-2 py-1"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>

          {/* Responsive Findings Table */}
          <div className="bg-charcoal-850 border border-charcoal-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-charcoal-900 border-b border-charcoal-700 text-[11px] text-ivory-400 uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Severity</th>
                    <th className="py-3 px-4">Finding ID / Source</th>
                    <th className="py-3 px-4">Title & Context</th>
                    <th className="py-3 px-4">Affected Resource</th>
                    <th className="py-3 px-4">Region / Account</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-charcoal-750">
                  {filteredFindings.map((finding) => (
                    <tr
                      key={finding.id}
                      className="hover:bg-charcoal-800/60 transition-colors group"
                    >
                      {/* Severity */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <SeverityBadge severity={finding.severity} size="sm" />
                      </td>

                      {/* ID / Source */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-bold text-ivory-100 flex items-center gap-1.5">
                          <span>{finding.id}</span>
                          {finding.isDemo && <DemoTag />}
                        </div>
                        <span className="text-[10px] text-ivory-400">
                          {finding.source}
                        </span>
                      </td>

                      {/* Title & Description */}
                      <td className="py-3.5 px-4 max-w-md">
                        <div className="font-bold text-ivory-100 group-hover:text-lime-300 transition-colors">
                          {finding.title}
                        </div>
                        <div className="text-[11px] text-ivory-400 mt-0.5 line-clamp-1">
                          {finding.description}
                        </div>
                      </td>

                      {/* Primary Resource */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {finding.resources[0] ? (
                          <div>
                            <span className="text-[10px] text-ivory-500 block">
                              {finding.resources[0].type.replace("AWS::", "")}
                            </span>
                            <span className="font-bold text-lime-400">
                              {finding.resources[0].id}
                            </span>
                          </div>
                        ) : (
                          <span className="text-ivory-500">—</span>
                        )}
                      </td>

                      {/* Region & Account */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="text-ivory-200">{finding.region}</div>
                        <div className="text-[10px] text-ivory-500">
                          {finding.accountId}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <StatusBadge status={finding.status} />
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <Link href="/incidents/INC-2026-9041">
                          <Button variant="secondary" size="sm" className="gap-1 text-[11px] py-1">
                            <span>Triage</span>
                            <ArrowRight className="w-3 h-3" />
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}

                  {filteredFindings.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-ivory-400">
                        No telemetry findings match the selected filter criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
