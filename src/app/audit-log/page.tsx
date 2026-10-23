"use client";

import React, { useState, useEffect } from "react";
import {
  History,
  Download,
  Filter,
  Shield,
  Search,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { ConsoleNav } from "@/components/layout/console-nav";
import { ConsoleSidebar } from "@/components/layout/console-sidebar";
import { DemoBanner } from "@/components/ui/demo-banner";
import { Button } from "@/components/ui/button";
import { AuditEvent } from "@/types/security";

export default function AuditLogPage() {
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [filterAction, setFilterAction] = useState("");
  const [selectedEvent, setSelectedEvent] = useState<AuditEvent | null>(null);

  const fetchEvents = async () => {
    try {
      const res = await fetch("/api/audit");
      const data = await res.json();
      setEvents(data.events || []);
      if (data.events && data.events.length > 0) {
        setSelectedEvent(data.events[0]);
      }
    } catch {
      // Fallback
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const filtered = events.filter(
    (e) =>
      filterAction === "" ||
      e.action.toLowerCase().includes(filterAction.toLowerCase()) ||
      e.actor.toLowerCase().includes(filterAction.toLowerCase()) ||
      e.target.toLowerCase().includes(filterAction.toLowerCase())
  );

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
                <History className="w-5 h-5 text-lime-400" />
                <h1 className="text-xl sm:text-2xl font-black uppercase text-ivory-100">
                  Append-Only SecOps Audit Trail
                </h1>
              </div>
              <p className="text-xs text-ivory-400 mt-0.5">
                Cryptographically tracked record of analyst approvals, dry-run simulations, and AWS SDK mutations
              </p>
            </div>

            <div className="flex items-center gap-3">
              <a href="/api/audit?format=csv" download>
                <Button variant="secondary" size="sm" className="gap-2">
                  <Download className="w-3.5 h-3.5 text-lime-400" />
                  <span>EXPORT CSV</span>
                </Button>
              </a>
            </div>
          </div>

          {/* 2-Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left 7 Cols: Audit Events Table */}
            <div className="lg:col-span-7 space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 text-ivory-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={filterAction}
                  onChange={(e) => setFilterAction(e.target.value)}
                  placeholder="Filter by action name, actor, or target resource..."
                  className="w-full bg-charcoal-850 border border-charcoal-700 pl-9 pr-3 py-2 text-xs text-ivory-100 placeholder:text-ivory-500 focus:outline-none focus:border-lime-500 font-mono"
                />
              </div>

              <div className="bg-charcoal-850 border border-charcoal-700 overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-charcoal-900 border-b border-charcoal-700 text-[10px] text-ivory-400 uppercase tracking-wider">
                    <tr>
                      <th className="py-2.5 px-3">Outcome</th>
                      <th className="py-2.5 px-3">Action</th>
                      <th className="py-2.5 px-3">Actor / Role</th>
                      <th className="py-2.5 px-3">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-charcoal-750">
                    {filtered.map((evt) => {
                      const isSelected = selectedEvent?.id === evt.id;
                      return (
                        <tr
                          key={evt.id}
                          onClick={() => setSelectedEvent(evt)}
                          className={`cursor-pointer transition ${
                            isSelected
                              ? "bg-lime-950/40"
                              : "hover:bg-charcoal-800/60"
                          }`}
                        >
                          <td className="py-3 px-3 whitespace-nowrap">
                            <span
                              className={`text-[9px] px-1.5 py-0.2 border uppercase font-bold ${
                                evt.outcome === "SUCCESS"
                                  ? "bg-lime-950 text-lime-400 border-lime-800"
                                  : evt.outcome === "DENIED"
                                  ? "bg-[#3D1414] text-[#FF8585] border-[#6E2222]"
                                  : "bg-charcoal-800 text-ivory-400 border-charcoal-700"
                              }`}
                            >
                              {evt.outcome}
                            </span>
                          </td>

                          <td className="py-3 px-3">
                            <span className="font-bold text-ivory-200 block truncate max-w-[200px]">
                              {evt.action}
                            </span>
                            <span className="text-[10px] text-ivory-500 truncate block max-w-[200px]">
                              {evt.target}
                            </span>
                          </td>

                          <td className="py-3 px-3 whitespace-nowrap text-[11px]">
                            <div className="text-ivory-300 truncate max-w-[140px]">
                              {evt.actor}
                            </div>
                            <div className="text-[9px] text-lime-400 uppercase">
                              {evt.role}
                            </div>
                          </td>

                          <td className="py-3 px-3 whitespace-nowrap text-[10px] text-ivory-500">
                            {evt.timestamp.slice(11, 19)} UTC
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Right 5 Cols: Event Inspector */}
            <div className="lg:col-span-5 space-y-4">
              {selectedEvent ? (
                <div className="bg-charcoal-850 border-2 border-charcoal-700 p-5 space-y-4 text-xs font-mono">
                  <div className="border-b border-charcoal-700 pb-2">
                    <span className="text-[10px] text-lime-400 font-bold uppercase tracking-widest block">
                      Audit Record Inspector
                    </span>
                    <h2 className="text-sm font-bold text-ivory-100">
                      {selectedEvent.action}
                    </h2>
                  </div>

                  <div className="space-y-2 text-[11px]">
                    <div className="p-2.5 bg-charcoal-900 border border-charcoal-750">
                      <span className="text-[9px] text-ivory-500 block uppercase">
                        Correlation ID:
                      </span>
                      <code className="text-lime-300 text-[10px]">
                        {selectedEvent.correlationId}
                      </code>
                    </div>

                    <div className="p-2.5 bg-charcoal-900 border border-charcoal-750">
                      <span className="text-[9px] text-ivory-500 block uppercase">
                        AWS Request ID:
                      </span>
                      <code className="text-ivory-300 text-[10px]">
                        {selectedEvent.awsRequestId || "N/A (Local / Dry-run)"}
                      </code>
                    </div>

                    <div className="p-2.5 bg-charcoal-900 border border-charcoal-750">
                      <span className="text-[9px] text-ivory-500 block uppercase">
                        Target Resource:
                      </span>
                      <span className="text-ivory-200 break-all">
                        {selectedEvent.target}
                      </span>
                    </div>

                    <div className="p-2.5 bg-charcoal-900 border border-charcoal-750">
                      <span className="text-[9px] text-ivory-500 block uppercase">
                        Source Metadata:
                      </span>
                      <span className="text-ivory-300">
                        IP: {selectedEvent.sourceIp} | {selectedEvent.userAgent}
                      </span>
                    </div>
                  </div>

                  {/* Redacted Details */}
                  <div className="space-y-1">
                    <span className="text-[10px] text-ivory-400 font-bold uppercase block">
                      Redacted Event Attributes:
                    </span>
                    <pre className="p-3 bg-charcoal-950 border border-charcoal-800 text-lime-300 text-[10px] max-h-48 overflow-y-auto">
                      {JSON.stringify(selectedEvent.redactedDetails, null, 2)}
                    </pre>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center text-ivory-500 bg-charcoal-850 border border-charcoal-700">
                  Select an audit event to inspect payload metadata.
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
