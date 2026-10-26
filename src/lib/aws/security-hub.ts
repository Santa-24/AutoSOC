import {
  SecurityHubClient,
  GetFindingsCommand,
  DescribeHubCommand,
} from "@aws-sdk/client-securityhub";
import { getEnv } from "@/lib/env";
import { getAWSCredentialsProvider } from "./credentials";
import { SecurityFinding, SeverityLevel } from "@/types/security";

function mapHubSeverity(severity: string | undefined): SeverityLevel {
  switch (severity?.toUpperCase()) {
    case "CRITICAL":
      return "CRITICAL";
    case "HIGH":
      return "HIGH";
    case "MEDIUM":
      return "MEDIUM";
    case "LOW":
      return "LOW";
    default:
      return "INFORMATIONAL";
  }
}

export async function checkSecurityHubHealth(): Promise<{
  connected: boolean;
  hubArn?: string;
  errorMessage?: string;
}> {
  const env = getEnv();
  if (!env.AUTOSOC_ENABLE_SECURITY_HUB) {
    return {
      connected: false,
      errorMessage: "AUTOSOC_ENABLE_SECURITY_HUB flag is disabled in configuration.",
    };
  }

  try {
    const client = new SecurityHubClient({
      region: env.AWS_REGION,
      credentials: getAWSCredentialsProvider(),
    });
    const response = await client.send(new DescribeHubCommand({}));
    return {
      connected: true,
      hubArn: response.HubArn,
    };
  } catch (err: unknown) {
    const error = err as { name?: string; message?: string };
    return {
      connected: false,
      errorMessage: error.name
        ? `${error.name}: Security Hub API check failed. Verify securityhub:DescribeHub permission.`
        : "Security Hub health check failed.",
    };
  }
}

export async function fetchLiveSecurityHubFindings(): Promise<SecurityFinding[]> {
  const env = getEnv();
  if (!env.AUTOSOC_ENABLE_SECURITY_HUB) {
    return [];
  }

  try {
    const client = new SecurityHubClient({
      region: env.AWS_REGION,
      credentials: getAWSCredentialsProvider(),
    });

    const response = await client.send(
      new GetFindingsCommand({
        Filters: {
          RecordState: [{ Value: "ACTIVE", Comparison: "EQUALS" }],
        },
        MaxResults: 25,
      })
    );

    if (!response.Findings) return [];

    return response.Findings.map((f): SecurityFinding => {
      const primaryResource = f.Resources?.[0];
      return {
        id: f.Id || `sh-${Date.now()}`,
        source: "SecurityHub",
        title: f.Title || "AWS Security Hub Finding",
        description: f.Description || "No description provided by CSPM finding.",
        severity: mapHubSeverity(f.Severity?.Label),
        status: f.Workflow?.Status === "RESOLVED" ? "RESOLVED" : "ACTIVE",
        accountId: f.AwsAccountId || "unknown-account",
        region: f.Region || env.AWS_REGION,
        resources: (f.Resources || []).map((r) => ({
          type: r.Type || "AwsResource",
          id: r.Id || "resource-id",
          arn: r.Id || "",
          region: r.Region || env.AWS_REGION,
          tags: r.Tags || {},
        })),
        createdAt: f.CreatedAt || new Date().toISOString(),
        updatedAt: f.UpdatedAt || new Date().toISOString(),
        evidenceReferences: primaryResource?.Id ? [primaryResource.Id] : [],
        complianceFrameworks: f.Compliance?.RelatedRequirements || ["CIS AWS Foundations"],
        tags: f.UserDefinedFields || {},
        isDemo: false,
      };
    });
  } catch {
    return [];
  }
}
