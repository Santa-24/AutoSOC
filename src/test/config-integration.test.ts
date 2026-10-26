import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { checkConfigHealth, fetchLiveConfigFindings } from "@/lib/aws/config";
import { getAllSecurityFindings, getAllIncidents } from "@/lib/store/soc-store";
import * as envModule from "@/lib/env";
import * as credsModule from "@/lib/aws/credentials";

// Mock AWS Config Client
const mockSend = vi.fn();
vi.mock("@aws-sdk/client-config-service", () => {
  class MockConfigServiceClient {
    send = mockSend;
  }
  class MockDescribeComplianceByConfigRuleCommand {
    constructor(public input: any) {}
  }
  class MockGetComplianceDetailsByConfigRuleCommand {
    constructor(public input: any) {}
  }

  return {
    ConfigServiceClient: MockConfigServiceClient,
    DescribeComplianceByConfigRuleCommand: MockDescribeComplianceByConfigRuleCommand,
    GetComplianceDetailsByConfigRuleCommand: MockGetComplianceDetailsByConfigRuleCommand,
  };
});

describe("AWS Config Integration & Live Findings Normalization", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(credsModule, "verifyServerSideAWSIdentity").mockResolvedValue({
      connected: true,
      accountId: "941905484053",
      arn: "arn:aws:iam::941905484053:user/autosoc-dev-operator",
      authMethod: "ENV_ACCESS_KEYS",
      region: "ap-south-1",
    });
    vi.spyOn(credsModule, "getAWSCredentialsProvider").mockReturnValue(undefined as any);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Feature Flag & Health Check (checkConfigHealth)", () => {
    it("reports STANDBY/disabled when AUTOSOC_ENABLE_CONFIG is false", async () => {
      vi.spyOn(envModule, "getEnv").mockReturnValue({
        ...envModule.getEnv(),
        AUTOSOC_ENABLE_CONFIG: false,
        AWS_REGION: "ap-south-1",
      });

      const health = await checkConfigHealth();
      expect(health.connected).toBe(false);
      expect(health.errorMessage).toContain("AUTOSOC_ENABLE_CONFIG flag is disabled");
      expect(mockSend).not.toHaveBeenCalled();
    });

    it("reports CONNECTED and active rules count when enabled and authorized", async () => {
      vi.spyOn(envModule, "getEnv").mockReturnValue({
        ...envModule.getEnv(),
        AUTOSOC_ENABLE_CONFIG: true,
        AWS_REGION: "ap-south-1",
      });

      mockSend.mockResolvedValueOnce({
        ComplianceByConfigRules: [
          {
            ConfigRuleName: "restricted-ssh",
            Compliance: { ComplianceType: "NON_COMPLIANT" },
          },
        ],
      });

      const health = await checkConfigHealth();
      expect(health.connected).toBe(true);
      expect(health.activeRulesCount).toBe(1);
    });

    it("handles AWS API errors gracefully and produces safe error message", async () => {
      vi.spyOn(envModule, "getEnv").mockReturnValue({
        ...envModule.getEnv(),
        AUTOSOC_ENABLE_CONFIG: true,
        AWS_REGION: "ap-south-1",
      });

      mockSend.mockRejectedValueOnce({
        name: "AccessDeniedException",
        message: "User is not authorized to perform: config:DescribeComplianceByConfigRule",
      });

      const health = await checkConfigHealth();
      expect(health.connected).toBe(false);
      expect(health.errorMessage).toContain("AccessDeniedException");
      expect(health.errorMessage).toContain("config:DescribeComplianceByConfigRule");
    });
  });

  describe("Findings Normalization (fetchLiveConfigFindings)", () => {
    it("returns empty array if AUTOSOC_ENABLE_CONFIG is false", async () => {
      vi.spyOn(envModule, "getEnv").mockReturnValue({
        ...envModule.getEnv(),
        AUTOSOC_ENABLE_CONFIG: false,
      });

      const findings = await fetchLiveConfigFindings();
      expect(findings).toEqual([]);
      expect(mockSend).not.toHaveBeenCalled();
    });

    it("correctly ingests and normalizes noncompliant security groups for restricted-ssh", async () => {
      vi.spyOn(envModule, "getEnv").mockReturnValue({
        ...envModule.getEnv(),
        AUTOSOC_ENABLE_CONFIG: true,
        AWS_REGION: "ap-south-1",
      });

      // 1. DescribeComplianceByConfigRuleCommand response
      mockSend.mockResolvedValueOnce({
        ComplianceByConfigRules: [
          {
            ConfigRuleName: "restricted-ssh",
            Compliance: { ComplianceType: "NON_COMPLIANT" },
          },
        ],
      });

      // 2. GetComplianceDetailsByConfigRuleCommand response with the 2 live noncompliant SGs
      const recordedTime = new Date("2026-10-24T12:00:00Z");
      mockSend.mockResolvedValueOnce({
        EvaluationResults: [
          {
            EvaluationResultIdentifier: {
              EvaluationResultQualifier: {
                ConfigRuleName: "restricted-ssh",
                ResourceType: "AWS::EC2::SecurityGroup",
                ResourceId: "sg-0cd9835b61ad1df1a",
              },
              OrderingTimestamp: recordedTime,
            },
            ComplianceType: "NON_COMPLIANT",
            ResultRecordedTime: recordedTime,
            ConfigRuleInvokedTime: recordedTime,
            Annotation: "Inbound SSH (port 22) rule allows unrestricted ingress 0.0.0.0/0",
          },
          {
            EvaluationResultIdentifier: {
              EvaluationResultQualifier: {
                ConfigRuleName: "restricted-ssh",
                ResourceType: "AWS::EC2::SecurityGroup",
                ResourceId: "sg-0feadfb5292083aab",
              },
              OrderingTimestamp: recordedTime,
            },
            ComplianceType: "NON_COMPLIANT",
            ResultRecordedTime: recordedTime,
            ConfigRuleInvokedTime: recordedTime,
            Annotation: "Inbound SSH (port 22) rule allows unrestricted ingress ::/0",
          },
        ],
      });

      const findings = await fetchLiveConfigFindings();

      expect(findings).toHaveLength(2);

      // Verify finding 1
      const f1 = findings[0];
      expect(f1.id).toBe("cfg-restricted-ssh-sg-0cd9835b61ad1df1a");
      expect(f1.source).toBe("Config");
      expect(f1.severity).toBe("HIGH");
      expect(f1.status).toBe("ACTIVE");
      expect(f1.accountId).toBe("941905484053");
      expect(f1.region).toBe("ap-south-1");
      expect(f1.isDemo).toBe(false);
      expect(f1.resources).toHaveLength(1);
      expect(f1.resources[0].id).toBe("sg-0cd9835b61ad1df1a");
      expect(f1.resources[0].type).toBe("AWS::EC2::SecurityGroup");
      expect(f1.resources[0].arn).toBe(
        "arn:aws:ec2:ap-south-1:941905484053:security-group/sg-0cd9835b61ad1df1a"
      );
      expect(f1.description).toContain("0.0.0.0/0");
      expect(f1.evidenceReferences).toContain("AWS Config Rule: restricted-ssh");
      expect(f1.evidenceReferences).toContain("Compliance Status: NON_COMPLIANT");

      // Verify finding 2
      const f2 = findings[1];
      expect(f2.id).toBe("cfg-restricted-ssh-sg-0feadfb5292083aab");
      expect(f2.source).toBe("Config");
      expect(f2.severity).toBe("HIGH");
      expect(f2.status).toBe("ACTIVE");
      expect(f2.resources[0].id).toBe("sg-0feadfb5292083aab");
      expect(f2.resources[0].type).toBe("AWS::EC2::SecurityGroup");
      expect(f2.resources[0].arn).toBe(
        "arn:aws:ec2:ap-south-1:941905484053:security-group/sg-0feadfb5292083aab"
      );
      expect(f2.description).toContain("::/0");
    });

    it("supports pagination across DescribeComplianceByConfigRule and GetComplianceDetailsByConfigRule", async () => {
      vi.spyOn(envModule, "getEnv").mockReturnValue({
        ...envModule.getEnv(),
        AUTOSOC_ENABLE_CONFIG: true,
        AWS_REGION: "ap-south-1",
      });

      // Page 1 of rules
      mockSend.mockResolvedValueOnce({
        ComplianceByConfigRules: [
          {
            ConfigRuleName: "rule-page-1",
            Compliance: { ComplianceType: "NON_COMPLIANT" },
          },
        ],
        NextToken: "token-rule-page-2",
      });

      // Page 2 of rules
      mockSend.mockResolvedValueOnce({
        ComplianceByConfigRules: [
          {
            ConfigRuleName: "rule-page-2",
            Compliance: { ComplianceType: "NON_COMPLIANT" },
          },
        ],
      });

      // Evaluation results for rule-page-1
      mockSend.mockResolvedValueOnce({
        EvaluationResults: [
          {
            EvaluationResultIdentifier: {
              EvaluationResultQualifier: {
                ConfigRuleName: "rule-page-1",
                ResourceType: "AWS::EC2::Instance",
                ResourceId: "i-001",
              },
            },
            ComplianceType: "NON_COMPLIANT",
          },
        ],
      });

      // Evaluation results for rule-page-2
      mockSend.mockResolvedValueOnce({
        EvaluationResults: [
          {
            EvaluationResultIdentifier: {
              EvaluationResultQualifier: {
                ConfigRuleName: "rule-page-2",
                ResourceType: "AWS::S3::Bucket",
                ResourceId: "bucket-002",
              },
            },
            ComplianceType: "NON_COMPLIANT",
          },
        ],
      });

      const findings = await fetchLiveConfigFindings();
      expect(findings).toHaveLength(2);
      expect(findings.map((f) => f.resources[0].id)).toEqual(["i-001", "bucket-002"]);
    });

    it("resiliently falls back to rule-level finding when GetComplianceDetailsByConfigRule is restricted by IAM", async () => {
      vi.spyOn(envModule, "getEnv").mockReturnValue({
        ...envModule.getEnv(),
        AUTOSOC_ENABLE_CONFIG: true,
        AWS_REGION: "ap-south-1",
      });

      // Describe succeeds
      mockSend.mockResolvedValueOnce({
        ComplianceByConfigRules: [
          {
            ConfigRuleName: "restricted-ssh",
            Compliance: { ComplianceType: "NON_COMPLIANT" },
          },
        ],
      });

      // GetComplianceDetails throws AccessDeniedException (the live observed IAM condition)
      mockSend.mockRejectedValueOnce({
        name: "AccessDeniedException",
        message: "User is not authorized to perform: config:GetComplianceDetailsByConfigRule",
      });

      const findings = await fetchLiveConfigFindings();
      expect(findings).toHaveLength(1);
      const summaryFinding = findings[0];
      expect(summaryFinding.id).toBe("cfg-restricted-ssh-summary");
      expect(summaryFinding.source).toBe("Config");
      expect(summaryFinding.title).toContain("restricted-ssh Noncompliant");
      expect(summaryFinding.description).toContain("config:GetComplianceDetailsByConfigRule");
      expect(summaryFinding.evidenceReferences).toContain(
        "Permission Notice: 'config:GetComplianceDetailsByConfigRule' required for resource enumeration"
      );
    });
  });

  describe("Full Store Integration (getAllSecurityFindings)", () => {
    it("includes AWS Config findings when enabled in live mode", async () => {
      vi.spyOn(envModule, "getEnv").mockReturnValue({
        ...envModule.getEnv(),
        AUTOSOC_DEMO_MODE: false,
        AUTOSOC_ENABLE_SECURITY_HUB: false,
        AUTOSOC_ENABLE_GUARDDUTY: false,
        AUTOSOC_ENABLE_CONFIG: true,
        AWS_REGION: "ap-south-1",
      });

      const iam = await import("@/lib/aws/iam");
      const s3 = await import("@/lib/aws/s3");
      const ct = await import("@/lib/aws/cloudtrail");
      vi.spyOn(iam, "fetchLiveIAMFindings").mockResolvedValue([]);
      vi.spyOn(s3, "fetchLiveS3Findings").mockResolvedValue([]);
      vi.spyOn(ct, "fetchLiveCloudTrailFindings").mockResolvedValue([]);

      mockSend.mockResolvedValueOnce({
        ComplianceByConfigRules: [
          {
            ConfigRuleName: "restricted-ssh",
            Compliance: { ComplianceType: "NON_COMPLIANT" },
          },
        ],
      });

      mockSend.mockResolvedValueOnce({
        EvaluationResults: [
          {
            EvaluationResultIdentifier: {
              EvaluationResultQualifier: {
                ConfigRuleName: "restricted-ssh",
                ResourceType: "AWS::EC2::SecurityGroup",
                ResourceId: "sg-0cd9835b61ad1df1a",
              },
            },
            ComplianceType: "NON_COMPLIANT",
            Annotation: "Open SSH rule",
          },
        ],
      });

      const findings = await getAllSecurityFindings();
      expect(findings).toHaveLength(1);
      expect(findings[0].source).toBe("Config");
      expect(findings[0].resources[0].id).toBe("sg-0cd9835b61ad1df1a");
    });
  });
});
