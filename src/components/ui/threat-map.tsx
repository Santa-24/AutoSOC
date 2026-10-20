"use client";

import React, { useState } from "react";
import { ShieldAlert, Server, Database, Key, Globe, Lock, CheckCircle2 } from "lucide-react";

interface NodeData {
  id: string;
  label: string;
  sublabel: string;
  type: "attacker" | "perimeter" | "compute" | "identity" | "storage" | "remediation";
  status: "compromised" | "targeted" | "active" | "mitigated";
  ipOrArn: string;
  x: number;
  y: number;
  details: string;
}

const NODES: NodeData[] = [
  {
    id: "node-attacker",
    label: "C2 INFRASTRUCTURE",
    sublabel: "Cobalt Strike Beacon",
    type: "attacker",
    status: "compromised",
    ipOrArn: "198.51.100.42:4444 (Tor Exit Relay)",
    x: 80,
    y: 160,
    details: "Hostile C2 server continuously beaconing to internal payments processor instance via reverse shell.",
  },
  {
    id: "node-waf",
    label: "AWS WAF / EDGE",
    sublabel: "Regional Web ACL",
    type: "perimeter",
    status: "active",
    ipOrArn: "arn:aws:wafv2:ap-south-1:.../AutoSOC-Edge-WAF",
    x: 280,
    y: 80,
    details: "Perimeter inspection gateway. IP rate limiting active; WAF reputation blocklist pending execution.",
  },
  {
    id: "node-ec2",
    label: "PAYMENTS WORKER",
    sublabel: "EC2 Instance",
    type: "compute",
    status: "compromised",
    ipOrArn: "i-0a81f33b1e (10.0.4.15)",
    x: 480,
    y: 160,
    details: "Compromised hypervisor workload. Inbound reverse shell detected; currently staging bulk database exports.",
  },
  {
    id: "node-iam",
    label: "INSTANCE ROLE",
    sublabel: "IAM Profile",
    type: "identity",
    status: "compromised",
    ipOrArn: "arn:aws:iam::123456789012:role/EC2-Payments-Worker",
    x: 480,
    y: 310,
    details: "Temporary STS credential assumed by process. Contains wildcard PutBucketPolicy permission.",
  },
  {
    id: "node-s3",
    label: "CUSTOMER INVOICES",
    sublabel: "Target S3 Bucket",
    type: "storage",
    status: "targeted",
    ipOrArn: "arn:aws:s3:::prod-customer-invoice-vault",
    x: 740,
    y: 160,
    details: "Target data store containing 148,290 customer tax invoices. PublicAccessBlock disabled.",
  },
  {
    id: "node-remediation",
    label: "AUTOSOC QUARANTINE",
    sublabel: "Automated SG Gate",
    type: "remediation",
    status: "active",
    ipOrArn: "sg-quarantine-autosoc-isolated",
    x: 740,
    y: 310,
    details: "Autonomous response playbook dry-run ready. Revokes all inbound/outbound traffic upon analyst approval.",
  },
];

export function ThreatMap() {
  const [activeNode, setActiveNode] = useState<NodeData>(NODES[2]);

  const getNodeIcon = (type: NodeData["type"]) => {
    switch (type) {
      case "attacker":
        return <Globe className="w-5 h-5 text-[#FF6666]" />;
      case "perimeter":
        return <Lock className="w-5 h-5 text-lime-400" />;
      case "compute":
        return <Server className="w-5 h-5 text-[#FFA066]" />;
      case "identity":
        return <Key className="w-5 h-5 text-[#FFCC66]" />;
      case "storage":
        return <Database className="w-5 h-5 text-[#FF6666]" />;
      case "remediation":
        return <ShieldAlert className="w-5 h-5 text-lime-400" />;
    }
  };

  return (
    <div className="w-full bg-charcoal-900 border border-charcoal-700 p-4 md:p-6 relative">
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-charcoal-700/80 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#FF4747] animate-pulse" />
            <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-ivory-100">
              Active Attack Path & Blast Radius Topology
            </h3>
          </div>
          <p className="text-xs font-mono text-ivory-400 mt-0.5">
            Real-time correlation of Incident INC-2026-9041 across VPC boundaries and IAM identities
          </p>
        </div>

        <div className="flex items-center gap-4 text-[11px] font-mono">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-[#FF4747] border border-[#FF6666]" />
            <span className="text-ivory-300">Compromised</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-[#FF823C] border border-[#FFA066]" />
            <span className="text-ivory-300">Target Asset</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-lime-500 border border-lime-400" />
            <span className="text-ivory-300">AutoSOC Defense</span>
          </div>
        </div>
      </div>

      {/* SVG Canvas */}
      <div className="relative w-full overflow-x-auto py-6">
        <svg
          viewBox="0 0 880 400"
          className="w-full min-w-[700px] h-[360px] select-none"
        >
          {/* Animated Attack Path Edges */}
          {/* Attacker -> EC2 */}
          <line
            x1="180"
            y1="160"
            x2="380"
            y2="160"
            stroke="#FF4747"
            strokeWidth="2"
            strokeDasharray="6,4"
            className="animate-pulse"
          />
          {/* Attacker -> WAF */}
          <line
            x1="150"
            y1="130"
            x2="230"
            y2="95"
            stroke="#43493D"
            strokeWidth="1.5"
            strokeDasharray="4,4"
          />
          {/* WAF -> EC2 */}
          <line
            x1="330"
            y1="95"
            x2="410"
            y2="135"
            stroke="#43493D"
            strokeWidth="1.5"
          />
          {/* EC2 -> IAM Role */}
          <line
            x1="480"
            y1="210"
            x2="480"
            y2="260"
            stroke="#FFA066"
            strokeWidth="2"
            strokeDasharray="4,4"
          />
          {/* EC2 -> S3 */}
          <line
            x1="580"
            y1="160"
            x2="650"
            y2="160"
            stroke="#FF4747"
            strokeWidth="2.5"
            className="animate-pulse"
          />
          {/* Remediation SG -> EC2 */}
          <line
            x1="650"
            y1="310"
            x2="550"
            y2="200"
            stroke="#C7F36B"
            strokeWidth="2"
            strokeDasharray="5,5"
          />

          {/* Node Cards */}
          {NODES.map((node) => {
            const isSelected = activeNode.id === node.id;
            let strokeColor = "#2E332A";
            let bgColor = "#1B1E19";

            if (node.status === "compromised") {
              strokeColor = isSelected ? "#FF4747" : "#5E1E1E";
              bgColor = isSelected ? "#2E1111" : "#1F1212";
            } else if (node.status === "targeted") {
              strokeColor = isSelected ? "#FF823C" : "#5E321E";
              bgColor = isSelected ? "#2E1C11" : "#1E1510";
            } else if (node.type === "remediation") {
              strokeColor = isSelected ? "#C7F36B" : "#445C16";
              bgColor = isSelected ? "#141F05" : "#111A07";
            }

            return (
              <g
                key={node.id}
                transform={`translate(${node.x - 75}, ${node.y - 45})`}
                onClick={() => setActiveNode(node)}
                className="cursor-pointer group"
              >
                <rect
                  width="150"
                  height="90"
                  fill={bgColor}
                  stroke={strokeColor}
                  strokeWidth={isSelected ? "2" : "1"}
                  className="transition-all duration-150"
                />
                {/* Node Title */}
                <text
                  x="75"
                  y="26"
                  textAnchor="middle"
                  fill="#F3F0E7"
                  fontSize="10"
                  fontWeight="bold"
                  fontFamily="monospace"
                  letterSpacing="0.05em"
                >
                  {node.label}
                </text>
                <text
                  x="75"
                  y="42"
                  textAnchor="middle"
                  fill="#A9A599"
                  fontSize="9"
                  fontFamily="monospace"
                >
                  {node.sublabel}
                </text>
                {/* Status Pill */}
                <rect
                  x="30"
                  y="56"
                  width="90"
                  height="18"
                  fill="#141613"
                  stroke={strokeColor}
                  strokeWidth="1"
                />
                <text
                  x="75"
                  y="69"
                  textAnchor="middle"
                  fill={
                    node.status === "compromised"
                      ? "#FF8080"
                      : node.type === "remediation"
                      ? "#C7F36B"
                      : "#E0E878"
                  }
                  fontSize="8"
                  fontFamily="monospace"
                  fontWeight="bold"
                >
                  {node.status.toUpperCase()}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Selected Node Details Drawer */}
      {activeNode && (
        <div className="mt-4 p-4 bg-charcoal-850 border border-charcoal-700 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-charcoal-800 border border-charcoal-700 shrink-0">
              {getNodeIcon(activeNode.type)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-ivory-100 uppercase">
                  {activeNode.label}
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 bg-charcoal-800 text-ivory-400 border border-charcoal-700">
                  {activeNode.sublabel}
                </span>
              </div>
              <p className="text-xs font-mono text-ivory-300 mt-1 max-w-2xl">
                {activeNode.details}
              </p>
              <div className="text-[11px] font-mono text-lime-400 mt-1">
                RESOURCE: <span className="text-ivory-200">{activeNode.ipOrArn}</span>
              </div>
            </div>
          </div>

          <div className="shrink-0 flex items-center gap-2">
            {activeNode.type === "remediation" ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-lime-950 text-lime-400 border border-lime-700 text-xs font-mono font-bold">
                <CheckCircle2 className="w-4 h-4" />
                PLAYBOOK READY
              </span>
            ) : (
              <span className="text-[11px] font-mono text-ivory-400">
                Click any node to inspect telemetry
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
