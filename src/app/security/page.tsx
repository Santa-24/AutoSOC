import React from "react";
import Link from "next/link";
import { PublicNav } from "@/components/layout/public-nav";
import { PublicFooter } from "@/components/layout/public-footer";
import { ShieldCheck, Lock, AlertTriangle, Key, Terminal, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SecurityPrinciplesPage() {
  const principles = [
    {
      num: "01",
      title: "Zero Frontend Credential Exposure",
      desc: "All AWS SDK clients are instantiated server-side within Next.js API route handlers. The frontend browser bundle never receives AWS access keys, secret keys, session tokens, or STS credentials.",
    },
    {
      num: "02",
      title: "Dry-Run Previews & Human Approval Gates",
      desc: "Destructive remediation actions (such as EC2 security group quarantine, IAM access key revocation, or S3 bucket policy changes) must generate a dry-run preview first and require an explicit authorized analyst confirmation before any AWS API mutation occurs.",
    },
    {
      num: "03",
      title: "Strict Least-Privilege IAM Boundary",
      desc: "AutoSOC never requests or uses AdministratorAccess or root credentials. Ingestion permissions (e.g. guardduty:GetFindings, securityhub:GetFindings) are strictly separated from remediation permissions (e.g. ec2:ModifyInstanceAttribute).",
    },
    {
      num: "04",
      title: "Real Server-Side Health Verification",
      desc: "An AWS integration is never marked as connected unless a real server-side health check (such as sts:GetCallerIdentity or config:DescribeComplianceByConfigRule) succeeds. Live telemetry is parsed in real time directly from your AWS account.",
    },
    {
      num: "05",
      title: "Prompt Injection & Secret Redaction Defense",
      desc: "External telemetry strings (finding bodies, CloudTrail parameters, user agents) are treated as untrusted data. Before dispatch to Amazon Bedrock, sensitive tokens and API keys are redacted, and control delimiters are filtered to neutralize prompt injection attacks.",
    },
    {
      num: "06",
      title: "Append-Only Cryptographic Audit Logging",
      desc: "Every query, dry-run simulation, approval, and execution event produces an immutable audit record containing actor identity, timestamp, target resource, outcome, correlation ID, and AWS request identifier.",
    },
  ];

  return (
    <div className="min-h-screen bg-charcoal-900 text-ivory-100 flex flex-col font-mono selection:bg-lime-500 selection:text-charcoal-950">
      <PublicNav />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
        <div className="space-y-4 border-b border-charcoal-700 pb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-charcoal-850 border border-charcoal-700 text-xs text-lime-400">
            <Lock className="w-3.5 h-3.5" />
            <span>SECURITY ARCHITECTURE & PRINCIPLES</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-ivory-100">
            Security Model & Trust Architecture
          </h1>
          <p className="text-sm text-ivory-300 leading-relaxed max-w-3xl">
            AutoSOC is engineered under zero-trust assumptions. As an autonomous security platform, its own architecture must adhere to the highest standard of defensive engineering.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {principles.map((p) => (
            <div
              key={p.num}
              className="bg-charcoal-850 border border-charcoal-700 p-6 space-y-3 relative"
            >
              <div className="flex items-center justify-between border-b border-charcoal-750 pb-2">
                <span className="text-xl font-black text-lime-400">{p.num}</span>
                <ShieldCheck className="w-4 h-4 text-lime-400" />
              </div>
              <h2 className="text-base font-bold text-ivory-100 uppercase">
                {p.title}
              </h2>
              <p className="text-xs text-ivory-300 leading-relaxed">
                {p.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Threat Model Summary */}
        <div className="bg-charcoal-950 border border-charcoal-700 p-6 space-y-4">
          <h2 className="text-base font-bold text-ivory-100 uppercase flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-[#FF823C]" />
            Adversarial Threat Model Summary
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-3 bg-charcoal-900 border border-charcoal-800 space-y-1">
              <span className="text-lime-400 font-bold block">Compromised Finding Content</span>
              <p className="text-ivory-400">
                Threat actors inject malicious prompts into EC2 tags or HTTP user-agents. AutoSOC isolates finding bodies in XML delimiters and strips control sequences.
              </p>
            </div>
            <div className="p-3 bg-charcoal-900 border border-charcoal-800 space-y-1">
              <span className="text-lime-400 font-bold block">Overzealous Automation</span>
              <p className="text-ivory-400">
                Autonomous remediation causing inadvertent production outages. Prevented by strict dry-run requirements and role-based approval gates.
              </p>
            </div>
            <div className="p-3 bg-charcoal-900 border border-charcoal-800 space-y-1">
              <span className="text-lime-400 font-bold block">Credential Leakage</span>
              <p className="text-ivory-400">
                Secrets leaking into frontend JS or browser logs. Gated by server-side AWS SDK calls, Git-ignored environment templates, and log redaction filters.
              </p>
            </div>
          </div>
        </div>

        <div className="pt-4 flex items-center justify-between border-t border-charcoal-700">
          <Link href="/docs">
            <Button variant="secondary" size="md">
              ← Setup & Permissions Guide
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button size="md" className="gap-2">
              <span>Go to Command Center</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
