import React from "react";
import Link from "next/link";
import {
  ArrowRight,
  Shield,
  Terminal,
  Zap,
  Lock,
  Layers,
  Cpu,
  Database,
  Radio,
  FileCheck2,
  CheckCircle2,
  AlertTriangle,
  Server,
  Activity,
  Code2,
  ArrowUpRight,
} from "lucide-react";
import { PublicNav } from "@/components/layout/public-nav";
import { PublicFooter } from "@/components/layout/public-footer";
import { TelemetryTicker } from "@/components/ui/ticker";
import { ThreatMap } from "@/components/ui/threat-map";
import { Button } from "@/components/ui/button";
import { HeroSection } from "@/components/landing/hero-section";

export default function LandingPage() {
  const workflowStages = [
    {
      stage: "01",
      name: "DETECT",
      badge: "Real-Time Ingestion",
      desc: "Continuous event streaming from AWS Security Hub, Amazon GuardDuty, AWS CloudTrail, and Amazon Inspector across multi-region accounts.",
    },
    {
      stage: "02",
      name: "CORRELATE",
      badge: "Cross-Plane Graph",
      desc: "Discovers underlying attack paths by correlating ephemeral VPC compute anomalies with IAM credential abuse and S3 storage policy changes.",
    },
    {
      stage: "03",
      name: "TRIAGE",
      badge: "Deterministic Score",
      desc: "Prioritizes incidents by evaluating real blast radius, asset sensitivity tags (e.g. PCI-DSS, PII), and MITRE ATT&CK technique mapping.",
    },
    {
      stage: "04",
      name: "INVESTIGATE",
      badge: "Bedrock AI Triage",
      desc: "Summarizes evidence using Amazon Bedrock with built-in prompt injection defense and strict evidence citation. Never calls tools autonomously.",
    },
    {
      stage: "05",
      name: "APPROVE / RESPOND",
      badge: "Human-in-the-Loop Gate",
      desc: "Executes precise remediation playbooks with dry-run verification first. High-impact operations require explicit authorized analyst confirmation.",
    },
    {
      stage: "06",
      name: "RECORD",
      badge: "Cryptographic Audit",
      desc: "Logs every action, actor, timestamp, and AWS request identifier to an append-only audit trail with SHA-256 chain-of-custody verification.",
    },
    {
      stage: "07",
      name: "REPORT",
      badge: "Compliance Mapping",
      desc: "Translates findings into informative technical posture checklists against CIS AWS Foundations Benchmark, NIST CSF 2.0, and ISO 27001.",
    },
  ];

  const awsIntegrations = [
    { name: "AWS Security Hub", type: "CSPM Central Findings", icon: Shield },
    { name: "Amazon GuardDuty", type: "Threat Intelligence & ML", icon: Radio },
    { name: "AWS CloudTrail", type: "API Audit & Telemetry", icon: Activity },
    { name: "Amazon Bedrock", type: "Grounded AI Assistance", icon: Cpu },
    { name: "AWS Config", type: "Compliance Evaluations", icon: CheckCircle2 },
    { name: "Amazon Inspector", type: "Vulnerability Scanning", icon: AlertTriangle },
    { name: "AWS IAM", type: "Least-Privilege Analyzer", icon: Lock },
    { name: "Amazon EC2", type: "Hypervisor Quarantine", icon: Server },
    { name: "Amazon S3", type: "Public Block & Audit Store", icon: Database },
    { name: "AWS WAFv2", type: "Perimeter IP Blocklists", icon: Zap },
    { name: "Amazon EventBridge", type: "Event Routing Bus", icon: Layers },
    { name: "Amazon Cognito", type: "Analyst Identity & RBAC", icon: FileCheck2 },
  ];

  const nonNegotiables = [
    {
      title: "Zero Browser Secrets",
      detail: "No AWS credentials, secrets, or privileged SDK clients ever touch frontend bundles. All AWS SDK calls execute server-side.",
    },
    {
      title: "Dry-Run Preview by Default",
      detail: "Destructive remediation (SG isolation, key revocation, bucket policies) always simulates blast radius before any mutation occurs.",
    },
    {
      title: "Explicit Human Approval",
      detail: "Autonomous AI suggests; authorized humans confirm. High-impact actions demand signed analyst acknowledgment and log the actor.",
    },
    {
      title: "No Fabricated Connections",
      detail: "An AWS integration is only marked connected if a real server-side STS or service health check succeeds. Synthetic data is clearly labeled.",
    },
    {
      title: "Prompt Injection Defense",
      detail: "Telemetry from logs and findings is treated as untrusted strings. Embedded injection payloads are stripped before reaching Bedrock.",
    },
    {
      title: "Least Privilege Enforced",
      detail: "Production workloads never use AdministratorAccess. Ingestion read-only roles are strictly isolated from remediation roles.",
    },
  ];

  const faqs = [
    {
      q: "Can AutoSOC accidentally isolate production EC2 workloads without my approval?",
      a: "No. Non-Negotiable #4 and #8 strictly forbid autonomous execution of destructive actions. AutoSOC generates a dry-run preview showing affected network interfaces and services, and requires an authorized analyst with the 'canApproveRemediation' permission to confirm.",
    },
    {
      q: "Does AutoSOC require AWS root credentials or full AdministratorAccess?",
      a: "Never. AutoSOC operates strictly under least-privilege principles. In fact, root access keys are flagged as a CRITICAL compliance violation under CIS 1.4. The starter Terraform files provide narrow IAM policies separating read-only telemetry from scoped remediation.",
    },
    {
      q: "How does AutoSOC work if my AWS account doesn't have Bedrock model access approved?",
      a: "AutoSOC includes a deterministic offline correlation and triage engine as a zero-cost baseline. If Bedrock is disabled or model access is pending, AutoSOC continues triaging findings and recommending playbooks without interruption.",
    },
    {
      q: "Can I run AutoSOC locally without incurring any AWS charges?",
      a: "Yes. AutoSOC operates with non-destructive dry-run simulations and reads live read-only telemetry by default, incurring zero mutating cloud charges.",
    },
  ];

  return (
    <div className="min-h-screen bg-charcoal-900 text-ivory-100 flex flex-col selection:bg-lime-500 selection:text-charcoal-950">
      <PublicNav />

      {/* Enhanced Interactive Cyber-Ops Hero Section */}
      <HeroSection />

      {/* Event Telemetry Marquee */}
      <TelemetryTicker />

      {/* Threat Topology Visual Section */}
      <section className="py-16 md:py-24 border-b border-charcoal-700 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full space-y-6">
        <div className="max-w-2xl">
          <span className="text-[11px] font-mono tracking-widest text-lime-400 uppercase font-bold">
            Interactive Threat Topology
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold font-mono tracking-tight uppercase text-ivory-100 mt-1">
            Real-Time Attack Path Correlation
          </h2>
          <p className="text-xs sm:text-sm font-mono text-ivory-300 mt-2">
            AutoSOC correlates disparate findings from GuardDuty, Security Hub, and CloudTrail into an actionable graph. Select any node below to inspect live blast radius.
          </p>
        </div>

        <ThreatMap />
      </section>

      {/* 7-Stage Autonomous Loop Section */}
      <section id="workflow" className="py-16 md:py-24 border-b border-charcoal-700 bg-charcoal-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="max-w-3xl space-y-2">
            <span className="text-[11px] font-mono tracking-widest text-lime-400 uppercase font-bold">
              Autonomous Investigation Pipeline
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold font-mono tracking-tight uppercase text-ivory-100">
              The 7-Stage Cloud SOC Loop
            </h2>
            <p className="text-xs sm:text-sm font-mono text-ivory-300">
              From continuous API detection to immutable audit exports, AutoSOC enforces an auditable lifecycle that eliminates blind spots while keeping humans in control.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {workflowStages.map((s, idx) => (
              <div
                key={s.stage}
                className="bg-charcoal-900 border border-charcoal-700 p-5 space-y-3 relative group hover:border-lime-500/60 transition-colors"
              >
                <div className="flex items-center justify-between border-b border-charcoal-800 pb-2">
                  <span className="text-xl font-mono font-black text-lime-400">{s.stage}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 bg-charcoal-800 text-ivory-300 border border-charcoal-750 uppercase">
                    {s.badge}
                  </span>
                </div>
                <h3 className="text-base font-mono font-bold text-ivory-100 uppercase">
                  {s.name}
                </h3>
                <p className="text-xs font-mono text-ivory-400 leading-relaxed">
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AWS Integration Architecture Grid */}
      <section id="architecture" className="py-16 md:py-24 border-b border-charcoal-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="max-w-3xl space-y-2">
            <span className="text-[11px] font-mono tracking-widest text-lime-400 uppercase font-bold">
              Native AWS Ecosystem
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold font-mono tracking-tight uppercase text-ivory-100">
              Zero-Agent Cloud Architecture
            </h2>
            <p className="text-xs sm:text-sm font-mono text-ivory-300">
              AutoSOC integrates directly through AWS SDK v3 server-side modules with fine-grained IAM permissions. Enable only the services you need.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {awsIntegrations.map((svc) => {
              const Icon = svc.icon;
              return (
                <div
                  key={svc.name}
                  className="bg-charcoal-850 border border-charcoal-700 p-4 space-y-2 hover:border-charcoal-600 transition"
                >
                  <Icon className="w-5 h-5 text-lime-400" />
                  <div>
                    <h4 className="text-xs font-mono font-bold text-ivory-100">
                      {svc.name}
                    </h4>
                    <span className="text-[10px] font-mono text-ivory-400 block mt-0.5">
                      {svc.type}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Non-Negotiable Security Principles */}
      <section id="principles" className="py-16 md:py-24 border-b border-charcoal-700 bg-charcoal-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="max-w-3xl space-y-2">
            <span className="text-[11px] font-mono tracking-widest text-[#FF823C] uppercase font-bold">
              Safety Engineering
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold font-mono tracking-tight uppercase text-ivory-100">
              Non-Negotiable Guardrails
            </h2>
            <p className="text-xs sm:text-sm font-mono text-ivory-300">
              Autonomous security must never become an unmonitored vulnerability. AutoSOC enforces strict defensive guardrails built into the code.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {nonNegotiables.map((item, idx) => (
              <div
                key={idx}
                className="bg-charcoal-900 border-l-2 border-lime-500 p-5 space-y-2"
              >
                <h4 className="text-sm font-mono font-bold text-ivory-100 uppercase">
                  {item.title}
                </h4>
                <p className="text-xs font-mono text-ivory-400 leading-relaxed">
                  {item.detail}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 md:py-24 border-b border-charcoal-700 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 w-full space-y-8">
        <div className="space-y-2">
          <span className="text-[11px] font-mono tracking-widest text-lime-400 uppercase font-bold">
            Cloud SecOps Questions
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold font-mono tracking-tight uppercase text-ivory-100">
            Frequently Addressed Questions
          </h2>
        </div>

        <div className="space-y-4 font-mono">
          {faqs.map((faq, i) => (
            <div key={i} className="bg-charcoal-850 border border-charcoal-700 p-5 space-y-2">
              <h4 className="text-sm font-bold text-ivory-100 flex items-start gap-2">
                <span className="text-lime-400">Q:</span>
                <span>{faq.q}</span>
              </h4>
              <p className="text-xs text-ivory-300 leading-relaxed pl-6">
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="py-20 md:py-28 bg-lime-500 text-charcoal-950 text-center relative overflow-hidden select-none">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <span className="text-xs font-mono font-black tracking-widest uppercase px-3 py-1 bg-charcoal-950 text-lime-400 inline-block">
            DEPLOYABLE AWS SEC-OPS STARTER
          </span>
          <h2 className="text-4xl sm:text-6xl font-black font-mono tracking-tighter uppercase leading-tight">
            TAKE COMMAND OF YOUR AWS THREAT SURFACE.
          </h2>
          <p className="text-sm sm:text-base font-mono font-medium max-w-2xl mx-auto opacity-90">
            Access the unified analyst command center. Inspect correlated findings, generate dry-run previews, or review compliance mappings directly from live AWS telemetry.
          </p>
          <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
            <Link href="/dashboard">
              <button className="px-8 py-4 bg-charcoal-950 text-lime-400 hover:bg-charcoal-900 font-mono font-bold text-sm tracking-widest uppercase transition-all shadow-2xl flex items-center gap-2">
                <Terminal className="w-5 h-5" />
                <span>LAUNCH CONSOLE</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </Link>
            <Link href="/docs">
              <button className="px-8 py-4 bg-transparent border-2 border-charcoal-950 text-charcoal-950 hover:bg-charcoal-950 hover:text-ivory-100 font-mono font-bold text-sm tracking-widest uppercase transition-all">
                <span>VIEW SETUP GUIDE</span>
              </button>
            </Link>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
