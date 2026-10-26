import {
  GuardDutyClient,
  ListDetectorsCommand,
  ListFindingsCommand,
  GetFindingsCommand,
} from "@aws-sdk/client-guardduty";
import { getEnv } from "@/lib/env";
import { getAWSCredentialsProvider } from "./credentials";
import { SecurityFinding, SeverityLevel } from "@/types/security";

function mapGuardDutySeverity(score: number | undefined): SeverityLevel {
  if (!score) return "INFORMATIONAL";
  if (score >= 7.0) return "CRITICAL";
  if (score >= 5.0) return "HIGH";
  if (score >= 4.0) return "MEDIUM";
  return "LOW";
}

export async function checkGuardDutyHealth(): Promise<{
  connected: boolean;
  detectorId?: string;
  errorMessage?: string;
}> {
  const env = getEnv();
  if (!env.AUTOSOC_ENABLE_GUARDDUTY) {
    return {
      connected: false,
      errorMessage: "AUTOSOC_ENABLE_GUARDDUTY flag is disabled in configuration.",
    };
  }

  try {
    const client = new GuardDutyClient({
      region: env.AWS_REGION,
      credentials: getAWSCredentialsProvider(),
    });

    const listResp = await client.send(new ListDetectorsCommand({ MaxResults: 1 }));
    const detectorId = listResp.DetectorIds?.[0];

    if (!detectorId) {
      return {
        connected: false,
        errorMessage: "GuardDuty is enabled in AutoSOC config, but no active Detector was found in region " + env.AWS_REGION + ". Enable GuardDuty in AWS Console.",
      };
    }

    return {
      connected: true,
      detectorId,
    };
  } catch (err: unknown) {
    const error = err as { name?: string; message?: string };
    return {
      connected: false,
      errorMessage: error.name
        ? `${error.name}: GuardDuty API check failed. Verify guardduty:ListDetectors permission.`
        : "GuardDuty health check failed.",
    };
  }
}

export async function fetchLiveGuardDutyFindings(): Promise<SecurityFinding[]> {
  const env = getEnv();
  if (!env.AUTOSOC_ENABLE_GUARDDUTY) return [];

  try {
    const client = new GuardDutyClient({
      region: env.AWS_REGION,
      credentials: getAWSCredentialsProvider(),
    });

    const detectors = await client.send(new ListDetectorsCommand({ MaxResults: 1 }));
    const detectorId = detectors.DetectorIds?.[0];
    if (!detectorId) return [];

    const listFindings = await client.send(
      new ListFindingsCommand({
        DetectorId: detectorId,
        MaxResults: 20,
      })
    );

    const findingIds = listFindings.FindingIds || [];
    if (findingIds.length === 0) return [];

    const findingsDetail = await client.send(
      new GetFindingsCommand({
        DetectorId: detectorId,
        FindingIds: findingIds.slice(0, 20),
      })
    );

    return (findingsDetail.Findings || []).map((f): SecurityFinding => {
      const targetInstance = f.Resource?.InstanceDetails;
      const targetAccessKey = f.Resource?.AccessKeyDetails;

      const resources = [];
      if (targetInstance?.InstanceId) {
        resources.push({
          type: "AWS::EC2::Instance",
          id: targetInstance.InstanceId,
          arn: `arn:aws:ec2:${env.AWS_REGION}:${f.AccountId}:instance/${targetInstance.InstanceId}`,
          tags: (targetInstance.Tags || []).reduce<Record<string, string>>(
            (acc, t) => ({ ...acc, [t.Key || ""]: t.Value || "" }),
            {}
          ),
        });
      }
      if (targetAccessKey?.AccessKeyId) {
        resources.push({
          type: "AWS::IAM::AccessKey",
          id: targetAccessKey.AccessKeyId,
          arn: `arn:aws:iam::${f.AccountId}:user/${targetAccessKey.UserName || "unknown"}`,
          tags: {},
        });
      }

      return {
        id: f.Id || `gd-${Date.now()}`,
        source: "GuardDuty",
        title: f.Title || f.Type || "GuardDuty Threat Finding",
        description: f.Description || "Threat detected by Amazon GuardDuty ML intelligence.",
        severity: mapGuardDutySeverity(f.Severity),
        status: "ACTIVE",
        accountId: f.AccountId || "unknown",
        region: f.Region || env.AWS_REGION,
        resources,
        createdAt: f.CreatedAt || new Date().toISOString(),
        updatedAt: f.UpdatedAt || new Date().toISOString(),
        evidenceReferences: f.Service?.Action?.ActionType ? [f.Service.Action.ActionType] : [],
        mitreAttackTechniques: f.Type?.includes("UnauthorizedAccess")
          ? ["T1078 (Valid Accounts)", "T1110 (Brute Force)"]
          : ["T1059 (Command Execution)"],
        tags: {},
        isDemo: false,
      };
    });
  } catch {
    return [];
  }
}
