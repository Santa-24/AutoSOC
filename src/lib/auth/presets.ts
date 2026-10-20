import { AnalystRole, SessionUser } from "@/types/security";

export const PRESET_ANALYSTS: Record<AnalystRole, SessionUser> = {
  secops_admin: {
    id: "usr-admin-01",
    email: "alex.vance@autosoc.corp",
    name: "Alex Vance (SecOps Principal)",
    role: "secops_admin",
    permissions: {
      canApproveRemediation: true,
      canExecuteDryRun: true,
      canTriggerAI: true,
      canModifySettings: true,
      canExportAudit: true,
    },
  },
  lead_analyst: {
    id: "usr-lead-02",
    email: "sarah.chen@autosoc.corp",
    name: "Sarah Chen (Lead Cloud Investigator)",
    role: "lead_analyst",
    permissions: {
      canApproveRemediation: true,
      canExecuteDryRun: true,
      canTriggerAI: true,
      canModifySettings: false,
      canExportAudit: true,
    },
  },
  soc_analyst: {
    id: "usr-tier1-03",
    email: "marcus.brooks@autosoc.corp",
    name: "Marcus Brooks (Tier-1 SOC Analyst)",
    role: "soc_analyst",
    permissions: {
      canApproveRemediation: false, // Strict: cannot approve high-impact remediation
      canExecuteDryRun: true,
      canTriggerAI: true,
      canModifySettings: false,
      canExportAudit: false,
    },
  },
  compliance_auditor: {
    id: "usr-audit-04",
    email: "elena.rostova@autosoc.corp",
    name: "Elena Rostova (Compliance & Risk Auditor)",
    role: "compliance_auditor",
    permissions: {
      canApproveRemediation: false,
      canExecuteDryRun: false,
      canTriggerAI: false,
      canModifySettings: false,
      canExportAudit: true,
    },
  },
};
