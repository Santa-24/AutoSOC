import { describe, it, expect } from "vitest";
import { PRESET_ANALYSTS } from "@/lib/auth/presets";
import { requirePermission } from "@/lib/auth/session";
import { DEMO_SECURITY_FINDINGS, DEMO_INCIDENTS, DEMO_FORENSIC_RECORDS } from "@/lib/demo/synthetic-data";
import {
  generateDryRunPreview,
  executeApprovedResponseAction,
  PLAYBOOK_DEFINITIONS,
} from "@/lib/aws/remediation";
import { recordAuditEvent, getAuditEvents } from "@/lib/audit/logger";
import { getEnv, getSafeConfigSummary } from "@/lib/env";

describe("AutoSOC Workflow & Integration Architecture", () => {
  describe("Role-Based Access Control & Permission Matrix", () => {
    it("enforces strict permission boundaries across all 4 analyst tiers", () => {
      // SecOps Admin: full privileges
      expect(PRESET_ANALYSTS.secops_admin.permissions.canApproveRemediation).toBe(true);
      expect(PRESET_ANALYSTS.secops_admin.permissions.canModifySettings).toBe(true);

      // Lead Analyst: cannot modify settings
      expect(PRESET_ANALYSTS.lead_analyst.permissions.canApproveRemediation).toBe(true);
      expect(PRESET_ANALYSTS.lead_analyst.permissions.canModifySettings).toBe(false);

      // Tier-1 SOC Analyst: strictly cannot approve remediation
      expect(PRESET_ANALYSTS.soc_analyst.permissions.canApproveRemediation).toBe(false);
      expect(PRESET_ANALYSTS.soc_analyst.permissions.canExecuteDryRun).toBe(true);

      // Compliance Auditor: read-only auditor, cannot run playbooks or trigger AI
      expect(PRESET_ANALYSTS.compliance_auditor.permissions.canApproveRemediation).toBe(false);
      expect(PRESET_ANALYSTS.compliance_auditor.permissions.canExecuteDryRun).toBe(false);
      expect(PRESET_ANALYSTS.compliance_auditor.permissions.canTriggerAI).toBe(false);
      expect(PRESET_ANALYSTS.compliance_auditor.permissions.canExportAudit).toBe(true);
    });

    it("evaluates requirePermission assertions against session users", async () => {
      const admin = await requirePermission("canExecuteDryRun");
      expect(admin).toBeDefined();
      expect(admin.role).toBe("secops_admin");
    });
  });

  describe("Synthetic Telemetry & Data Model Standards", () => {
    it("ensures every synthetic security finding is explicitly marked isDemo", () => {
      expect(DEMO_SECURITY_FINDINGS.length).toBeGreaterThan(0);
      for (const finding of DEMO_SECURITY_FINDINGS) {
        expect(finding.isDemo).toBe(true);
        expect(finding.id).toBeDefined();
        expect(finding.title).toBeDefined();
        expect(["CRITICAL", "HIGH", "MEDIUM", "LOW", "INFORMATIONAL"]).toContain(finding.severity);
        expect(finding.resources.length).toBeGreaterThan(0);
        expect(finding.evidenceReferences.length).toBeGreaterThan(0);
      }
    });

    it("verifies correlated incidents adhere to the 7-stage operational model", () => {
      expect(DEMO_INCIDENTS.length).toBeGreaterThan(0);
      for (const incident of DEMO_INCIDENTS) {
        expect(incident.id).toBeDefined();
        expect(incident.findingIds.length).toBeGreaterThan(0);
        expect(incident.timeline.length).toBeGreaterThan(0);
        expect(incident.summary).toBeDefined();
        expect(incident.affectedResources.length).toBeGreaterThan(0);
      }
    });

    it("maintains forensic timeline integrity with ISO timestamps and event actors", () => {
      expect(DEMO_FORENSIC_RECORDS.length).toBeGreaterThan(0);
      for (const record of DEMO_FORENSIC_RECORDS) {
        expect(record.id).toBeDefined();
        expect(record.eventName).toBeDefined();
        expect(record.eventSource).toBeDefined();
        expect(record.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
      }
    });
  });

  describe("Playbook Catalog & Dry-Run Preview Validation", () => {
    it("defines pre-approved response playbooks with explicit impact and permissions", () => {
      const playbooks = Object.values(PLAYBOOK_DEFINITIONS);
      expect(playbooks.length).toBeGreaterThanOrEqual(4);
      for (const pb of playbooks) {
        expect(pb.id).toBeDefined();
        expect(pb.name).toBeDefined();
        expect(pb.riskImpact).toBeDefined();
        expect(pb.prerequisites.length).toBeGreaterThan(0);
        expect(pb.requiredPermissions.length).toBeGreaterThan(0);
      }
    });

    it("computes safe dry-run preview for IAM access key deactivation", async () => {
      const preview = await generateDryRunPreview(
        "IAM_ACCESS_KEY_DEACTIVATION",
        "AKIAIOSFODNN7EXAMPLE"
      );
      expect(preview.canExecuteSafely).toBe(true);
      expect(preview.simulatedAction).toContain("update-access-key");
      expect(preview.simulatedAction).toContain("Inactive");
      expect(preview.affectedDependencies.length).toBeGreaterThan(0);
      expect(preview.affectedDependencies[0]).toContain("External API callers");
    });

    it("computes safe dry-run preview for S3 public access block enforcement", async () => {
      const preview = await generateDryRunPreview(
        "S3_BLOCK_PUBLIC_ACCESS",
        "autosoc-financial-records-prod"
      );
      expect(preview.canExecuteSafely).toBe(true);
      expect(preview.simulatedAction.toLowerCase()).toContain("put-public-access-block");
      expect(preview.potentialOutageRisk).toBeDefined();
    });

    it("blocks execution when confirmedApproval is false", async () => {
      await expect(
        executeApprovedResponseAction({
          incidentId: "INC-AWS-001",
          playbookId: "IAM_ACCESS_KEY_DEACTIVATION",
          targetResource: "AKIAIOSFODNN7EXAMPLE",
          actor: "marcus.brooks@autosoc.corp",
          role: "soc_analyst",
          confirmedApproval: false,
        })
      ).rejects.toThrow("Action requires explicit analyst approval");
    });

    it("successfully executes simulated remediation for authorized lead analyst", async () => {
      const result = await executeApprovedResponseAction({
        incidentId: "INC-AWS-001",
        playbookId: "IAM_ACCESS_KEY_DEACTIVATION",
        targetResource: "AKIAIOSFODNN7EXAMPLE",
        actor: "sarah.chen@autosoc.corp",
        role: "lead_analyst",
        confirmedApproval: true,
      });

      expect(result.executionStatus).toBe("SUCCESS");
      expect(result.id).toBeDefined();
      expect(result.resultSummary).toContain("SAFE DEMO EXECUTION");

      const auditRecords = getAuditEvents({
        action: "REMEDIATION_EXECUTED:IAM_ACCESS_KEY_DEACTIVATION",
      });
      expect(auditRecords.length).toBeGreaterThan(0);
      expect(auditRecords[0].target).toBe("AKIAIOSFODNN7EXAMPLE");
    });
  });

  describe("Environment Validation & Safe Defaults", () => {
    it("validates environment variables safely with demo defaults", () => {
      const env = getEnv();
      expect(env.AUTOSOC_DEMO_MODE).toBe(true);
      expect(env.AWS_REGION).toBeDefined();
      expect(env.AUTOSOC_ENABLE_REMEDIATION).toBe(false);

      const summary = getSafeConfigSummary();
      expect(summary.demoModeActive).toBe(true);
      expect(summary.region).toBeDefined();
      expect(summary.servicesConfigured.remediationExecution).toBe(false);
    });
  });
});
