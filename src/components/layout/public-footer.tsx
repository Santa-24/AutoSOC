import React from "react";
import Link from "next/link";
import { ShieldCheck, ExternalLink, Terminal } from "lucide-react";

export function PublicFooter() {
  return (
    <footer className="w-full bg-charcoal-950 border-t border-charcoal-700 pt-12 pb-16 text-ivory-400 font-mono text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-charcoal-800">
          {/* Brand Col */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-lime-500 text-charcoal-950 flex items-center justify-center font-bold text-xs">
                AS
              </div>
              <span className="font-bold text-sm tracking-tight text-ivory-100 uppercase">
                AutoSOC
              </span>
            </div>
            <p className="text-[11px] leading-relaxed text-ivory-400">
              Autonomous Cloud Security Operations Center for AWS environments. Real-time correlation, Bedrock-assisted triage, and human-authorized remediation playbooks.
            </p>
          </div>

          {/* Core Routes */}
          <div className="space-y-2">
            <h4 className="text-[11px] font-bold text-ivory-200 tracking-widest uppercase">
              Operational Workspace
            </h4>
            <ul className="space-y-1.5 text-[11px]">
              <li>
                <Link href="/dashboard" className="hover:text-lime-400 transition-colors">
                  Analyst Command Center
                </Link>
              </li>
              <li>
                <Link href="/incidents" className="hover:text-lime-400 transition-colors">
                  Incident Manager
                </Link>
              </li>
              <li>
                <Link href="/investigations" className="hover:text-lime-400 transition-colors">
                  AI Investigation Workbench
                </Link>
              </li>
              <li>
                <Link href="/response-playbooks" className="hover:text-lime-400 transition-colors">
                  Response Playbook Catalog
                </Link>
              </li>
              <li>
                <Link href="/forensics" className="hover:text-lime-400 transition-colors">
                  Forensic Chain-of-Custody
                </Link>
              </li>
            </ul>
          </div>

          {/* Compliance & Trust */}
          <div className="space-y-2">
            <h4 className="text-[11px] font-bold text-ivory-200 tracking-widest uppercase">
              Trust & Governance
            </h4>
            <ul className="space-y-1.5 text-[11px]">
              <li>
                <Link href="/compliance" className="hover:text-lime-400 transition-colors">
                  Framework Mapping Engine
                </Link>
              </li>
              <li>
                <Link href="/iam-risk" className="hover:text-lime-400 transition-colors">
                  IAM Risk Analyzer
                </Link>
              </li>
              <li>
                <Link href="/audit-log" className="hover:text-lime-400 transition-colors">
                  Append-Only Audit Log
                </Link>
              </li>
              <li>
                <Link href="/security" className="hover:text-lime-400 transition-colors">
                  Non-Negotiable Principles
                </Link>
              </li>
              <li>
                <Link href="/docs" className="hover:text-lime-400 transition-colors">
                  AWS Setup & Permissions
                </Link>
              </li>
            </ul>
          </div>

          {/* AWS Ecosystem */}
          <div className="space-y-2">
            <h4 className="text-[11px] font-bold text-ivory-200 tracking-widest uppercase">
              Native AWS Adapters
            </h4>
            <p className="text-[11px] leading-relaxed text-ivory-400">
              Integrates directly with AWS Security Hub CSPM, Amazon GuardDuty, AWS CloudTrail, AWS Config, Amazon Inspector, and Amazon Bedrock with zero browser-exposed credentials.
            </p>
          </div>
        </div>

        {/* Regulatory & Cost Disclaimers (Non-negotiable requirement #10) */}
        <div className="p-4 bg-charcoal-900 border border-charcoal-800 space-y-2 text-[10px] leading-relaxed text-ivory-400">
          <div className="flex items-center gap-1.5 text-ivory-300 font-bold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-lime-400" />
            COMPLIANCE & OPERATING COST STATEMENTS
          </div>
          <p>
            <strong className="text-ivory-200">Framework Mapping Disclaimer:</strong> CIS AWS Foundations Benchmark, NIST CSF 2.0, and ISO/IEC 27001 control mappings provided in AutoSOC represent informative technical configuration checklists. They do not constitute certified compliance audits or official third-party accreditations.
          </p>
          <p>
            <strong className="text-ivory-200">Operating Cost Transparency:</strong> AutoSOC itself is an open-architecture platform. Cloud service costs incurred from AWS Security Hub, Amazon GuardDuty, AWS CloudTrail, and Amazon Bedrock are billed directly by Amazon Web Services according to individual account usage. Inactive feature flags incur $0.00.
          </p>
        </div>

        {/* Bottom copyright */}
        <div className="flex flex-col sm:flex-row items-center justify-between text-[11px] text-ivory-500 pt-4 gap-2">
          <div>
            © {new Date().getFullYear()} AutoSOC — AI-Powered Autonomous Cloud Security Operations Center.
          </div>
          <div className="flex items-center gap-4">
            <Link href="/security" className="hover:text-ivory-300">
              Security Model
            </Link>
            <span>/</span>
            <Link href="/docs" className="hover:text-ivory-300">
              Architecture Docs
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
