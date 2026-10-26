"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Terminal,
  Shield,
  Zap,
  CheckCircle2,
  Copy,
  Check,
  Cpu,
  Layers,
  Radio,
  Lock,
  Server,
  Database,
  Activity,
  Play,
  Sparkles,
  AlertOctagon,
  ArrowUpRight,
  RefreshCw,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export function HeroSection() {
  const [activeTab, setActiveTab] = useState<"correlation" | "ai" | "dryrun">("correlation");
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationCompleted, setSimulationCompleted] = useState(false);
  const [copied, setCopied] = useState(false);
  const [tickerIndex, setTickerIndex] = useState(0);

  const liveFeeds = [
    { service: "GuardDuty", alert: "UnauthorizedAccess:EC2/SSHBruteForce", region: "ap-south-1", severity: "HIGH" },
    { service: "CloudTrail", alert: "IAM:PutUserPolicy grant Action:*", region: "ap-south-1", severity: "CRITICAL" },
    { service: "Config", alert: "s3-bucket-public-read-prohibited NON_COMPLIANT", region: "ap-south-1", severity: "HIGH" },
    { service: "Bedrock", alert: "Autonomous Root-Cause Triage Completed", region: "ap-south-1", severity: "INFO" },
    { service: "AutoSOC", alert: "Incident #INC-8821 Correlated across 3 services", region: "ap-south-1", severity: "CORRELATED" },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setTickerIndex((prev) => (prev + 1) % liveFeeds.length);
    }, 3500);
    return () => clearInterval(timer);
  }, [liveFeeds.length]);

  const handleCopyCommand = () => {
    navigator.clipboard.writeText("git clone https://github.com/Santa-24/AutoSOC.git && cd AutoSOC && npm run dev");
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleRunSimulation = () => {
    setIsSimulating(true);
    setSimulationCompleted(false);
    setTimeout(() => {
      setIsSimulating(false);
      setSimulationCompleted(true);
    }, 1200);
  };

  return (
    <section className="relative pt-12 pb-20 md:pt-20 md:pb-28 border-b border-charcoal-700 bg-grid-cyber overflow-hidden">
      {/* Dynamic Ambient Glow Backdrops */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[350px] bg-lime-500/10 blur-[140px] rounded-full pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 translate-x-1/3 w-[450px] h-[300px] bg-[#3B82F6]/5 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-[800px] h-[180px] bg-lime-500/5 blur-[120px] rounded-full pointer-events-none" />

      {/* Cyber Grid Scanning Beam */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-lime-500/[0.02] to-transparent pointer-events-none animate-pulse-slow" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Top Real-time Security State Ribbon */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-8 pb-4 border-b border-charcoal-800 text-[11px] font-mono">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-lime-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-lime-400" />
            </span>
            <span className="text-lime-400 font-bold uppercase tracking-wider">
              Autonomous Cloud Defense Loop
            </span>
            <span className="text-charcoal-600">/</span>
            <span className="text-ivory-400 hidden sm:inline">AWS SDK v3 Native</span>
            <span className="text-charcoal-600 hidden sm:inline">/</span>
            <span className="text-ivory-400 hidden md:inline">Zero Browser Secrets</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 bg-charcoal-850 border border-charcoal-700 text-ivory-300">
              <span className="w-1.5 h-1.5 rounded-full bg-lime-400" />
              <span>REGION: ap-south-1</span>
            </div>
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-0.5 bg-charcoal-850 border border-charcoal-700 text-lime-400">
              <Cpu className="w-3 h-3 text-lime-400" />
              <span>BEDROCK CLAUDE 3 READY</span>
            </div>
          </div>
        </div>

        {/* Main Hero Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-start">
          {/* Left Column: Vision, Headline & Actionable CTAs (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Mission Category Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-charcoal-850/90 border border-charcoal-700 text-xs font-mono shadow-sm backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-lime-400 animate-pulse" />
              <span className="text-lime-400 font-bold uppercase tracking-widest text-[11px]">
                Autonomous SecOps for AWS
              </span>
              <span className="text-charcoal-600">|</span>
              <span className="text-ivory-300 text-[11px]">Detect → Correlate → Respond</span>
            </div>

            {/* Main Editorial Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black font-mono tracking-tighter uppercase leading-[0.98] text-ivory-100">
              Stop Drowning in <br />
              <span className="text-ivory-400 line-through decoration-[#FF4747] decoration-2">
                Alert Noise.
              </span>{" "}
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-lime-400 via-lime-300 to-[#99E344]">
                Automate Your
              </span>{" "}
              <br />
              Cloud Defense.
            </h1>

            {/* Value Proposition Description */}
            <p className="text-sm sm:text-base text-ivory-300 font-mono leading-relaxed max-w-2xl">
              AutoSOC unifies disconnected telemetry from <span className="text-ivory-100 font-semibold">Security Hub</span>, <span className="text-ivory-100 font-semibold">GuardDuty</span>, <span className="text-ivory-100 font-semibold">CloudTrail</span>, and <span className="text-ivory-100 font-semibold">Config</span> into correlated attack graphs. Triages via <span className="text-lime-400 font-semibold">Amazon Bedrock</span> and executes human-authorized containment with <span className="text-ivory-100 font-semibold underline decoration-lime-500/50 decoration-2">dry-run blast-radius safeguards</span>.
            </p>

            {/* Call to Actions */}
            <div className="flex flex-wrap items-center gap-3.5 pt-2">
              <Link href="/dashboard">
                <Button size="lg" className="gap-2.5 font-bold shadow-[0_0_24px_rgba(199,243,107,0.3)] hover:shadow-[0_0_32px_rgba(199,243,107,0.45)] transition-all">
                  <Terminal className="w-4 h-4 text-charcoal-950" />
                  <span>Launch Analyst Console</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>

              <Link href="/incidents">
                <Button variant="secondary" size="lg" className="gap-2">
                  <AlertOctagon className="w-4 h-4 text-lime-400" />
                  <span>Explore Live Incidents</span>
                </Button>
              </Link>

              <Link href="/docs">
                <Button variant="ghost" size="lg" className="text-ivory-300 hover:text-ivory-100 gap-1.5 text-xs font-mono">
                  <span>Architecture Docs</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-ivory-400" />
                </Button>
              </Link>
            </div>

            {/* Quick Install / Clone Bar */}
            <div className="pt-2">
              <div className="inline-flex items-center gap-2 p-1.5 px-3 bg-charcoal-950 border border-charcoal-800 text-xs font-mono text-ivory-300 max-w-full overflow-hidden">
                <span className="text-lime-400 font-bold select-none">$</span>
                <code className="text-ivory-200 truncate select-all">
                  git clone https://github.com/Santa-24/AutoSOC.git &amp;&amp; npm run dev
                </code>
                <button
                  onClick={handleCopyCommand}
                  className="ml-2 p-1 bg-charcoal-850 hover:bg-charcoal-750 border border-charcoal-700 text-ivory-300 hover:text-lime-400 transition"
                  title="Copy Quick Start Command"
                  aria-label="Copy Quick Start Command"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-lime-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
              {copied && (
                <span className="block text-[10px] font-mono text-lime-400 mt-1 animate-pulse">
                  ✓ Command copied to clipboard!
                </span>
              )}
            </div>

            {/* Core Non-Negotiable Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-4 border-t border-charcoal-700/70 text-[11px] font-mono text-ivory-400">
              <div className="flex items-center gap-2 p-2 bg-charcoal-850/60 border border-charcoal-800/80">
                <CheckCircle2 className="w-4 h-4 text-lime-400 shrink-0" />
                <div>
                  <span className="text-ivory-200 block font-bold">Dry-Run Preview</span>
                  <span className="text-[10px] text-ivory-500">Zero outage risk</span>
                </div>
              </div>
              <div className="flex items-center gap-2 p-2 bg-charcoal-850/60 border border-charcoal-800/80">
                <CheckCircle2 className="w-4 h-4 text-lime-400 shrink-0" />
                <div>
                  <span className="text-ivory-200 block font-bold">Human Approval</span>
                  <span className="text-[10px] text-ivory-500">Signed analyst gate</span>
                </div>
              </div>
              <div className="flex items-center gap-2 p-2 bg-charcoal-850/60 border border-charcoal-800/80 col-span-2 sm:col-span-1">
                <CheckCircle2 className="w-4 h-4 text-lime-400 shrink-0" />
                <div>
                  <span className="text-ivory-200 block font-bold">Zero Browser Keys</span>
                  <span className="text-[10px] text-ivory-500">Server-side SDK only</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Live Interactive SOC Autonomous Command HUD (5 Cols) */}
          <div className="lg:col-span-5">
            <div className="bg-charcoal-950/95 border border-charcoal-700 shadow-2xl backdrop-blur-md relative overflow-hidden">
              {/* Header Terminal Strip */}
              <div className="px-4 py-2.5 bg-charcoal-900 border-b border-charcoal-700 flex items-center justify-between font-mono text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#FF5F56] inline-block" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E] inline-block" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#27C93F] inline-block" />
                  <span className="ml-2 text-ivory-400 text-[10px] font-bold tracking-wider">
                    AUTOSOC // LIVE ENGINE
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-[10px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-lime-400 animate-ping" />
                  <span className="text-lime-400 font-bold uppercase">LIVE FEED</span>
                </div>
              </div>

              {/* Streaming Alert Ribbon */}
              <div className="px-4 py-2 bg-charcoal-850 border-b border-charcoal-800 flex items-center justify-between text-[11px] font-mono">
                <div className="flex items-center gap-2 truncate">
                  <span className="px-1.5 py-0.2 bg-charcoal-750 text-lime-400 border border-charcoal-700 uppercase text-[9px] font-bold">
                    {liveFeeds[tickerIndex].service}
                  </span>
                  <span className="text-ivory-300 truncate text-[11px]">
                    {liveFeeds[tickerIndex].alert}
                  </span>
                </div>
                <span className="text-[9px] text-[#FFA066] font-bold shrink-0 ml-2">
                  {liveFeeds[tickerIndex].severity}
                </span>
              </div>

              {/* Interactive Tabs Header */}
              <div className="grid grid-cols-3 border-b border-charcoal-800 font-mono text-[11px] text-center bg-charcoal-900/60">
                <button
                  onClick={() => setActiveTab("correlation")}
                  className={`py-2 px-1 border-b-2 transition font-bold uppercase ${
                    activeTab === "correlation"
                      ? "border-lime-400 text-lime-400 bg-charcoal-850/80"
                      : "border-transparent text-ivory-400 hover:text-ivory-200"
                  }`}
                >
                  1. Correlation
                </button>
                <button
                  onClick={() => setActiveTab("ai")}
                  className={`py-2 px-1 border-b-2 transition font-bold uppercase ${
                    activeTab === "ai"
                      ? "border-lime-400 text-lime-400 bg-charcoal-850/80"
                      : "border-transparent text-ivory-400 hover:text-ivory-200"
                  }`}
                >
                  2. Bedrock AI
                </button>
                <button
                  onClick={() => setActiveTab("dryrun")}
                  className={`py-2 px-1 border-b-2 transition font-bold uppercase ${
                    activeTab === "dryrun"
                      ? "border-lime-400 text-lime-400 bg-charcoal-850/80"
                      : "border-transparent text-ivory-400 hover:text-ivory-200"
                  }`}
                >
                  3. Dry Run
                </button>
              </div>

              {/* Tab Content Display */}
              <div className="p-4 space-y-3 font-mono text-xs">
                {activeTab === "correlation" && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-charcoal-800 pb-2">
                      <span className="text-ivory-100 font-bold text-xs uppercase flex items-center gap-1.5">
                        <AlertOctagon className="w-3.5 h-3.5 text-[#FF4747]" />
                        Incident #INC-8821
                      </span>
                      <span className="px-2 py-0.5 bg-[#2E1111] text-[#FF8080] border border-[#5E1E1E] text-[10px] font-bold">
                        CRITICAL SEVERITY
                      </span>
                    </div>

                    <p className="text-[11px] text-ivory-300 leading-relaxed">
                      AutoSOC linked 3 isolated events occurring within 180 seconds into a single lateral-movement breach:
                    </p>

                    <div className="space-y-1.5 text-[11px]">
                      <div className="p-2 bg-charcoal-900 border border-charcoal-800 flex items-start gap-2">
                        <Server className="w-3.5 h-3.5 text-lime-400 shrink-0 mt-0.5" />
                        <div>
                          <span className="text-ivory-200 font-bold block">GuardDuty Anomaly</span>
                          <span className="text-ivory-400 text-[10px]">
                            EC2 instance <code className="text-lime-300">i-0a81f33b1e</code> beaconing to C2 IP 198.51.100.42
                          </span>
                        </div>
                      </div>

                      <div className="p-2 bg-charcoal-900 border border-charcoal-800 flex items-start gap-2">
                        <Lock className="w-3.5 h-3.5 text-[#FFA066] shrink-0 mt-0.5" />
                        <div>
                          <span className="text-ivory-200 font-bold block">CloudTrail Anomaly</span>
                          <span className="text-ivory-400 text-[10px]">
                            Access key <code className="text-lime-300">AKIA5W...</code> called PutBucketPolicy from external Tor IP
                          </span>
                        </div>
                      </div>

                      <div className="p-2 bg-charcoal-900 border border-charcoal-800 flex items-start gap-2">
                        <Database className="w-3.5 h-3.5 text-[#FF8080] shrink-0 mt-0.5" />
                        <div>
                          <span className="text-ivory-200 font-bold block">AWS Config Alert</span>
                          <span className="text-ivory-400 text-[10px]">
                            S3 bucket <code className="text-lime-300">corp-financials-9419</code> granted wildcard public READ
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "ai" && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-charcoal-800 pb-2">
                      <span className="text-ivory-100 font-bold text-xs uppercase flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-lime-400" />
                        Bedrock Claude 3 Sonnet
                      </span>
                      <span className="px-2 py-0.5 bg-lime-950 text-lime-300 border border-lime-800 text-[10px]">
                        AI PROMPT-DEFENDED
                      </span>
                    </div>

                    <div className="p-2.5 bg-charcoal-900 border border-charcoal-800 space-y-2 text-[11px] text-ivory-300">
                      <div className="flex items-center justify-between text-[10px] text-ivory-400">
                        <span>MITRE ATT&amp;CK TACTIC:</span>
                        <span className="text-lime-400 font-bold">T1078 (Valid Accounts) + T1041</span>
                      </div>
                      <p className="leading-relaxed">
                        &quot;High probability of initial credential theft via instance metadata service (IMDSv1). Attacker subsequently tampered with bucket permissions to exfiltrate financial records.&quot;
                      </p>
                      <div className="pt-1 border-t border-charcoal-800 text-[10px] text-lime-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-lime-400" />
                        <span>2 AWS Access Keys redacted before inference</span>
                      </div>
                    </div>

                    <div className="text-[11px] text-ivory-400">
                      <span className="text-ivory-200 font-bold">Recommended Playbook:</span> EC2_QUARANTINE_ISOLATION + S3_BLOCK_PUBLIC_ACCESS
                    </div>
                  </div>
                )}

                {activeTab === "dryrun" && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-charcoal-800 pb-2">
                      <span className="text-ivory-100 font-bold text-xs uppercase flex items-center gap-1.5">
                        <Shield className="w-3.5 h-3.5 text-lime-400" />
                        Dry-Run Blast Radius Preview
                      </span>
                      <span className="px-2 py-0.5 bg-charcoal-800 text-ivory-300 border border-charcoal-700 text-[10px]">
                        SIMULATED NOOP
                      </span>
                    </div>

                    <div className="p-2.5 bg-charcoal-900 border border-charcoal-800 font-mono text-[10px] space-y-1.5">
                      <div className="text-ivory-400">PROPOSED MUTATION:</div>
                      <code className="text-lime-300 block bg-charcoal-950 p-1.5 border border-charcoal-800">
                        ec2:ModifyInstanceAttribute(InstanceId=&apos;i-0a81f33b1e&apos;, Groups=[&apos;sg-quarantine&apos;])
                      </code>
                      <div className="text-ivory-400 pt-1">EVALUATED DEPENDENCY IMPACT:</div>
                      <ul className="text-ivory-300 list-disc list-inside space-y-0.5 text-[10px]">
                        <li>Instance network interface isolated (All external ingress severed)</li>
                        <li>Zero database dependencies impacted (Target is stateless worker)</li>
                        <li>Safe to execute without production cluster cascade</li>
                      </ul>
                    </div>

                    {simulationCompleted ? (
                      <div className="p-2 bg-[#122416] border border-[#22572E] text-[#63E894] text-[11px] font-bold flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-[#63E894]" />
                        <span>Dry-run verified! Awaiting authorized analyst confirmation.</span>
                      </div>
                    ) : (
                      <button
                        onClick={handleRunSimulation}
                        disabled={isSimulating}
                        className="w-full py-2 bg-charcoal-850 hover:bg-charcoal-800 border border-charcoal-700 hover:border-lime-500 text-lime-400 text-xs font-bold uppercase transition flex items-center justify-center gap-2"
                      >
                        {isSimulating ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin text-lime-400" />
                            <span>Evaluating Blast Radius...</span>
                          </>
                        ) : (
                          <>
                            <Play className="w-3.5 h-3.5 fill-lime-400" />
                            <span>Simulate Remediation Dry-Run</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Bottom Quick-Action Console Strip */}
              <div className="px-4 py-2.5 bg-charcoal-900 border-t border-charcoal-800 flex items-center justify-between text-[11px] font-mono">
                <span className="text-ivory-400 text-[10px]">MTTR: &lt; 15 SECONDS</span>
                <Link
                  href="/incidents/INC-8821"
                  className="text-lime-400 hover:text-lime-300 font-bold uppercase flex items-center gap-1 text-[11px] transition"
                >
                  <span>Open Full Workbench</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Key Metric Pillars: Real Numbers & Concrete Proof */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12 pt-8 border-t border-charcoal-800">
          <div className="p-4 bg-charcoal-950 border border-charcoal-800/80 hover:border-charcoal-700 transition">
            <div className="text-2xl sm:text-3xl font-black font-mono text-lime-400">
              &lt; 15s
            </div>
            <div className="text-xs font-mono font-bold text-ivory-200 mt-1 uppercase">
              Mean Time to Correlate
            </div>
            <div className="text-[11px] font-mono text-ivory-400 mt-0.5">
              Cross-plane graph linking GuardDuty, CloudTrail, Config
            </div>
          </div>

          <div className="p-4 bg-charcoal-950 border border-charcoal-800/80 hover:border-charcoal-700 transition">
            <div className="text-2xl sm:text-3xl font-black font-mono text-ivory-100">
              0 Outages
            </div>
            <div className="text-xs font-mono font-bold text-ivory-200 mt-1 uppercase">
              Blast-Radius Protected
            </div>
            <div className="text-[11px] font-mono text-ivory-400 mt-0.5">
              Dry-run preview simulation mandatory on all playbooks
            </div>
          </div>

          <div className="p-4 bg-charcoal-950 border border-charcoal-800/80 hover:border-charcoal-700 transition">
            <div className="text-2xl sm:text-3xl font-black font-mono text-lime-400">
              100%
            </div>
            <div className="text-xs font-mono font-bold text-ivory-200 mt-1 uppercase">
              Server-Side Isolation
            </div>
            <div className="text-[11px] font-mono text-ivory-400 mt-0.5">
              Zero static access keys or tokens reach browser bundles
            </div>
          </div>

          <div className="p-4 bg-charcoal-950 border border-charcoal-800/80 hover:border-charcoal-700 transition">
            <div className="text-2xl sm:text-3xl font-black font-mono text-ivory-100">
              $0.00
            </div>
            <div className="text-xs font-mono font-bold text-ivory-200 mt-1 uppercase">
              Instant Demo Mode
            </div>
            <div className="text-[11px] font-mono text-ivory-400 mt-0.5">
              Complete offline synthetic telemetry for zero cloud bill
            </div>
          </div>
        </div>

        {/* AWS Integrations Micro-Bar */}
        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 py-3 px-4 bg-charcoal-950/60 border border-charcoal-800 text-[11px] font-mono text-ivory-400">
          <span className="text-lime-400 font-bold uppercase tracking-wider text-[10px]">
            NATIVE AWS CONNECTORS:
          </span>
          <div className="flex flex-wrap items-center gap-4 text-ivory-300">
            <span className="flex items-center gap-1.5 hover:text-ivory-100 transition">
              <Shield className="w-3.5 h-3.5 text-lime-400" />
              <span>Security Hub</span>
            </span>
            <span className="flex items-center gap-1.5 hover:text-ivory-100 transition">
              <Radio className="w-3.5 h-3.5 text-[#FFA066]" />
              <span>GuardDuty</span>
            </span>
            <span className="flex items-center gap-1.5 hover:text-ivory-100 transition">
              <Activity className="w-3.5 h-3.5 text-lime-400" />
              <span>CloudTrail</span>
            </span>
            <span className="flex items-center gap-1.5 hover:text-ivory-100 transition">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#63E894]" />
              <span>AWS Config</span>
            </span>
            <span className="flex items-center gap-1.5 hover:text-ivory-100 transition">
              <Cpu className="w-3.5 h-3.5 text-lime-400" />
              <span>Amazon Bedrock</span>
            </span>
            <span className="flex items-center gap-1.5 hover:text-ivory-100 transition">
              <Server className="w-3.5 h-3.5 text-ivory-300" />
              <span>EC2 &amp; WAFv2</span>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
