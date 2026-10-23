"use client";

import React, { useState, useEffect } from "react";
import {
  FileSearch,
  Shield,
  Clock,
  Hash,
  ExternalLink,
  CheckCircle2,
  Lock,
  Layers,
  Search,
  Loader2,
} from "lucide-react";
import { ConsoleNav } from "@/components/layout/console-nav";
import { ConsoleSidebar } from "@/components/layout/console-sidebar";
import { DemoBanner } from "@/components/ui/demo-banner";
import { ForensicRecord } from "@/types/security";

export default function ForensicsPage() {
  const [records, setRecords] = useState<ForensicRecord[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<ForensicRecord | null>(null);
  const [filterSearch, setFilterSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    fetch("/api/forensics")
      .then((res) => res.json())
      .then((data) => {
        if (mounted && data?.records) {
          setRecords(data.records);
          if (data.records.length > 0) {
            setSelectedRecord(data.records[0]);
          }
        }
      })
      .catch((err) => console.error("Failed to load forensics:", err))
      .finally(() => {
        if (mounted) setIsLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const filtered = records.filter(
    (r) =>
      filterSearch === "" ||
      r.eventName.toLowerCase().includes(filterSearch.toLowerCase()) ||
      r.actorArn.toLowerCase().includes(filterSearch.toLowerCase()) ||
      r.sourceIpAddress.includes(filterSearch)
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
                <FileSearch className="w-5 h-5 text-lime-400" />
                <h1 className="text-xl sm:text-2xl font-black uppercase text-ivory-100">
                  Forensic Timeline & Chain-of-Custody
                </h1>
              </div>
              <p className="text-xs text-ivory-400 mt-0.5">
                CloudTrail event capture with SHA-256 cryptographic integrity hashes and verifier attestations
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-ivory-400">Custody Verifier:</span>
              <span className="px-2 py-0.5 bg-lime-950 text-lime-400 border border-lime-800 font-bold uppercase">
                SHA-256 Verified
              </span>
            </div>
          </div>

          {/* 2-Column Forensic View */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left 6 Cols: Forensic Event Log */}
            <div className="lg:col-span-6 space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 text-ivory-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={filterSearch}
                  onChange={(e) => setFilterSearch(e.target.value)}
                  placeholder="Filter events by API name, actor ARN, or source IP..."
                  className="w-full bg-charcoal-850 border border-charcoal-700 pl-9 pr-3 py-2 text-xs text-ivory-100 placeholder:text-ivory-500 focus:outline-none focus:border-lime-500 font-mono"
                />
              </div>

              <div className="space-y-3">
                {isLoading ? (
                  <div className="p-8 text-center text-ivory-400 bg-charcoal-850 border border-charcoal-700 flex flex-col items-center justify-center gap-3">
                    <Loader2 className="w-5 h-5 text-lime-400 animate-spin" />
                    <span className="text-xs">Querying live AWS CloudTrail event stream (ap-south-1)...</span>
                  </div>
                ) : filtered.length === 0 ? (
                  <div className="p-8 text-center text-ivory-400 bg-charcoal-850 border border-charcoal-700 space-y-1">
                    <span className="text-xs font-bold block text-ivory-200">No Forensic Records Found</span>
                    <span className="text-[11px] text-ivory-500">
                      No matching events in the current CloudTrail ingestion window.
                    </span>
                  </div>
                ) : (
                  filtered.map((record) => {
                    const isSelected = selectedRecord?.id === record.id;
                    return (
                      <div
                        key={record.id}
                        onClick={() => setSelectedRecord(record)}
                        className={`p-4 border cursor-pointer transition ${
                          isSelected
                            ? "bg-lime-950/40 border-lime-500"
                            : "bg-charcoal-850 border-charcoal-700 hover:border-charcoal-600"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-lime-400">
                            {record.eventName}
                          </span>
                          <span className="text-[10px] text-ivory-500">
                            {record.timestamp.slice(11, 19)} UTC
                          </span>
                        </div>

                        <div className="text-[11px] text-ivory-300 mt-1 truncate">
                          Actor: {record.actorArn}
                        </div>

                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-charcoal-750 text-[10px] text-ivory-400">
                          <span>IP: {record.sourceIpAddress}</span>
                          <span className="font-mono text-lime-400 truncate max-w-[180px]">
                            {record.sha256Hash.slice(0, 16)}...
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Right 6 Cols: Evidence Inspector & Chain of Custody */}
            <div className="lg:col-span-6 space-y-6">
              {selectedRecord ? (
                <div className="bg-charcoal-850 border-2 border-charcoal-700 p-6 space-y-5 text-xs">
                  <div className="border-b border-charcoal-700 pb-3 space-y-1">
                    <span className="text-[10px] text-lime-400 font-bold uppercase tracking-widest block">
                      Cryptographic Forensic Record
                    </span>
                    <h2 className="text-base font-bold text-ivory-100">
                      {selectedRecord.eventName} ({selectedRecord.eventSource})
                    </h2>
                  </div>

                  {/* SHA-256 Hash Display */}
                  <div className="p-3 bg-charcoal-900 border border-charcoal-750 space-y-1">
                    <div className="flex items-center gap-1.5 text-lime-400 font-bold text-[10px] uppercase">
                      <Hash className="w-3.5 h-3.5" />
                      SHA-256 Event Payload Digest (Tamper-Evident)
                    </div>
                    <code className="text-lime-300 font-mono text-[10px] break-all block p-1.5 bg-charcoal-950 border border-charcoal-800">
                      {selectedRecord.sha256Hash}
                    </code>
                  </div>

                  {/* Custody Chain List */}
                  <div className="space-y-2">
                    <span className="text-[10px] text-ivory-400 font-bold uppercase tracking-wider block">
                      Chain of Custody Verifications
                    </span>
                    {selectedRecord.custodyChain.map((custody, i) => (
                      <div
                        key={i}
                        className="p-2.5 bg-charcoal-900 border border-charcoal-750 flex items-center justify-between text-[11px]"
                      >
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-lime-400" />
                          <span className="text-ivory-200">{custody.verifier}</span>
                        </div>
                        <span className="text-ivory-500 text-[10px]">
                          {custody.timestamp.slice(0, 19).replace("T", " ")} UTC
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-2 gap-3 text-[11px]">
                    <div className="p-2.5 bg-charcoal-900 border border-charcoal-750">
                      <span className="text-[9px] text-ivory-500 block uppercase">
                        Source IP:
                      </span>
                      <span className="text-ivory-200 font-bold">
                        {selectedRecord.sourceIpAddress}
                      </span>
                    </div>
                    <div className="p-2.5 bg-charcoal-900 border border-charcoal-750">
                      <span className="text-[9px] text-ivory-500 block uppercase">
                        AWS Region:
                      </span>
                      <span className="text-ivory-200 font-bold">
                        {selectedRecord.awsRegion}
                      </span>
                    </div>
                  </div>

                  {/* Raw Event JSON */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] text-ivory-400 font-bold uppercase tracking-wider block">
                      Raw CloudTrail Event Payload
                    </span>
                    <pre className="p-3 bg-charcoal-950 border border-charcoal-800 text-lime-300 font-mono text-[10px] max-h-60 overflow-y-auto">
                      {JSON.stringify(selectedRecord.rawPayload, null, 2)}
                    </pre>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center text-ivory-500 bg-charcoal-850 border border-charcoal-700">
                  Select a forensic record from the timeline to inspect evidence.
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
