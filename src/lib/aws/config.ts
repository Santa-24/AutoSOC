import {
  ConfigServiceClient,
  DescribeComplianceByConfigRuleCommand,
  DescribeComplianceByConfigRuleCommandOutput,
  GetComplianceDetailsByConfigRuleCommand,
  GetComplianceDetailsByConfigRuleCommandOutput,
  ComplianceByConfigRule,
  EvaluationResult,
} from "@aws-sdk/client-config-service";
import { getEnv } from "@/lib/env";
import { getAWSCredentialsProvider, verifyServerSideAWSIdentity } from "./credentials";
import { SecurityFinding, SeverityLevel } from "@/types/security";

/**
 * Maps AWS Config rules and compliance states to AutoSOC severity levels.
 * Standard benchmarks (CIS AWS Foundations / AWS Foundational Security Best Practices)
 * treat unrestricted administrative access (such as open SSH) and root credential risks as HIGH/CRITICAL.
 */
function mapConfigRuleSeverity(ruleName: string, complianceType?: string): SeverityLevel {
  if (complianceType === "COMPLIANT") return "INFORMATIONAL";
  const name = ruleName.toLowerCase();
  if (
    name.includes("root-account") ||
    name.includes("kms") ||
    name.includes("cloudtrail-enabled")
  ) {
    return "CRITICAL";
  }
  if (
    name.includes("restricted-ssh") ||
    name.includes("restricted-common-ports") ||
    name.includes("s3-bucket-public") ||
    name.includes("security-group") ||
    name.includes("vpc")
  ) {
    return "HIGH";
  }
  return "HIGH";
}

/**
 * Constructs a standard AWS ARN for common resources evaluated by AWS Config.
 */
function formatConfigResourceArn(
  resourceType: string,
  resourceId: string,
  region: string,
  accountId: string
): string {
  switch (resourceType) {
    case "AWS::EC2::SecurityGroup":
      return `arn:aws:ec2:${region}:${accountId}:security-group/${resourceId}`;
    case "AWS::EC2::Instance":
      return `arn:aws:ec2:${region}:${accountId}:instance/${resourceId}`;
    case "AWS::S3::Bucket":
      return `arn:aws:s3:::${resourceId}`;
    case "AWS::IAM::Role":
      return `arn:aws:iam::${accountId}:role/${resourceId}`;
    case "AWS::IAM::User":
      return `arn:aws:iam::${accountId}:user/${resourceId}`;
    default:
      return `arn:aws:config:${region}:${accountId}:resource/${resourceType}/${resourceId}`;
  }
}

export async function checkConfigHealth(): Promise<{
  connected: boolean;
  activeRulesCount?: number;
  errorMessage?: string;
}> {
  const env = getEnv();
  if (!env.AUTOSOC_ENABLE_CONFIG) {
    return {
      connected: false,
      errorMessage: "AUTOSOC_ENABLE_CONFIG flag is disabled in configuration.",
    };
  }

  try {
    const client = new ConfigServiceClient({
      region: env.AWS_REGION,
      credentials: getAWSCredentialsProvider(),
    });

    const response = await client.send(
      new DescribeComplianceByConfigRuleCommand({})
    );

    return {
      connected: true,
      activeRulesCount: response.ComplianceByConfigRules?.length || 0,
    };
  } catch (err: unknown) {
    const error = err as { name?: string; message?: string };
    return {
      connected: false,
      errorMessage: error.name
        ? `${error.name}: AWS Config check failed. Verify config:DescribeComplianceByConfigRule permission.`
        : "AWS Config health check failed.",
    };
  }
}

/**
 * Ingest live compliance evaluation results from AWS Config in ap-south-1.
 * Supports pagination, individual resource detail extraction via GetComplianceDetailsByConfigRule,
 * and graceful fallback if IAM read access is scoped only to DescribeComplianceByConfigRule.
 */
export async function fetchLiveConfigFindings(): Promise<SecurityFinding[]> {
  const env = getEnv();
  if (!env.AUTOSOC_ENABLE_CONFIG) {
    return [];
  }

  try {
    const identity = await verifyServerSideAWSIdentity();
    const accountId = identity.accountId || "unknown-account";
    const region = env.AWS_REGION;

    const client = new ConfigServiceClient({
      region,
      credentials: getAWSCredentialsProvider(),
    });

    const ruleSummaries: ComplianceByConfigRule[] = [];
    let nextToken: string | undefined = undefined;

    do {
      const resp: DescribeComplianceByConfigRuleCommandOutput = await client.send(
        new DescribeComplianceByConfigRuleCommand({
          NextToken: nextToken,
        })
      );
      if (resp.ComplianceByConfigRules) {
        ruleSummaries.push(...resp.ComplianceByConfigRules);
      }
      nextToken = resp.NextToken;
    } while (nextToken);

    const nonCompliantRules = ruleSummaries.filter(
      (r) => r.Compliance?.ComplianceType === "NON_COMPLIANT"
    );

    if (nonCompliantRules.length === 0) {
      return [];
    }

    const findings: SecurityFinding[] = [];

    for (const rule of nonCompliantRules) {
      const ruleName = rule.ConfigRuleName || "unknown-rule";

      try {
        let evalToken: string | undefined = undefined;
        let resultCount = 0;

        do {
          const detailResp: GetComplianceDetailsByConfigRuleCommandOutput = await client.send(
            new GetComplianceDetailsByConfigRuleCommand({
              ConfigRuleName: ruleName,
              ComplianceTypes: ["NON_COMPLIANT"],
              NextToken: evalToken,
            })
          );

          const evaluations: EvaluationResult[] = detailResp.EvaluationResults || [];
          resultCount += evaluations.length;

          for (const ev of evaluations) {
            const qualifier = ev.EvaluationResultIdentifier?.EvaluationResultQualifier;
            const resourceId = qualifier?.ResourceId || ruleName;
            const resourceType = qualifier?.ResourceType || "AWS::Config::Resource";
            const recordedTime = ev.ResultRecordedTime
              ? ev.ResultRecordedTime.toISOString()
              : new Date().toISOString();
            const invokedTime = ev.ConfigRuleInvokedTime
              ? ev.ConfigRuleInvokedTime.toISOString()
              : recordedTime;

            const resourceArn = formatConfigResourceArn(
              resourceType,
              resourceId,
              region,
              accountId
            );

            findings.push({
              id: `cfg-${ruleName}-${resourceId}`,
              source: "Config",
              title: `AWS Config: ${ruleName} Noncompliant (${resourceId})`,
              description:
                ev.Annotation ||
                `Resource ${resourceId} (${resourceType}) was evaluated as NON_COMPLIANT by AWS Config managed rule '${ruleName}'.`,
              severity: mapConfigRuleSeverity(ruleName, ev.ComplianceType),
              status: "ACTIVE",
              accountId,
              region,
              resources: [
                {
                  type: resourceType,
                  id: resourceId,
                  arn: resourceArn,
                  region,
                  accountId,
                },
              ],
              createdAt: invokedTime,
              updatedAt: recordedTime,
              evidenceReferences: [
                `AWS Config Rule: ${ruleName}`,
                `Compliance Status: ${ev.ComplianceType || "NON_COMPLIANT"}`,
                ...(ev.Annotation ? [`Evaluation Annotation: ${ev.Annotation}`] : []),
              ],
              complianceFrameworks: ["AWS Config Managed Rules", "CIS AWS Foundations"],
              tags: {
                ConfigRuleName: ruleName,
                ComplianceType: ev.ComplianceType || "NON_COMPLIANT",
              },
              isDemo: false,
            });
          }

          evalToken = detailResp.NextToken;
        } while (evalToken);

        // Edge case: rule marked NON_COMPLIANT in summary but 0 individual evaluations returned
        if (resultCount === 0) {
          findings.push({
            id: `cfg-${ruleName}-summary`,
            source: "Config",
            title: `AWS Config: ${ruleName} Noncompliant`,
            description: `AWS Config rule '${ruleName}' was evaluated as NON_COMPLIANT across evaluated configuration items.`,
            severity: mapConfigRuleSeverity(ruleName, "NON_COMPLIANT"),
            status: "ACTIVE",
            accountId,
            region,
            resources: [
              {
                type: "AWS::Config::ConfigRule",
                id: ruleName,
                arn: `arn:aws:config:${region}:${accountId}:config-rule/${ruleName}`,
                region,
                accountId,
              },
            ],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            evidenceReferences: [
              `AWS Config Rule: ${ruleName}`,
              `Compliance Status: NON_COMPLIANT`,
            ],
            complianceFrameworks: ["AWS Config Managed Rules", "CIS AWS Foundations"],
            tags: { ConfigRuleName: ruleName, ComplianceType: "NON_COMPLIANT" },
            isDemo: false,
          });
        }
      } catch (detailErr: unknown) {
        const error = detailErr as { name?: string; message?: string };
        // Resilient fallback when config:GetComplianceDetailsByConfigRule IAM permission is restricted
        findings.push({
          id: `cfg-${ruleName}-summary`,
          source: "Config",
          title: `AWS Config: ${ruleName} Noncompliant (${error.name || "AccessRestricted"})`,
          description: `AWS Config rule '${ruleName}' is NON_COMPLIANT. Detailed resource enumeration was restricted (${error.name || "Error"}: ${error.message || "Access Denied"}). Add 'config:GetComplianceDetailsByConfigRule' IAM permission to view individual noncompliant resource IDs.`,
          severity: mapConfigRuleSeverity(ruleName, "NON_COMPLIANT"),
          status: "ACTIVE",
          accountId,
          region,
          resources: [
            {
              type: "AWS::Config::ConfigRule",
              id: ruleName,
              arn: `arn:aws:config:${region}:${accountId}:config-rule/${ruleName}`,
              region,
              accountId,
            },
          ],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          evidenceReferences: [
            `AWS Config Rule: ${ruleName}`,
            `Compliance Status: NON_COMPLIANT`,
            `Permission Notice: 'config:GetComplianceDetailsByConfigRule' required for resource enumeration`,
          ],
          complianceFrameworks: ["AWS Config Managed Rules", "CIS AWS Foundations"],
          tags: {
            ConfigRuleName: ruleName,
            ComplianceType: "NON_COMPLIANT",
            PermissionStatus: "MISSING_GET_COMPLIANCE_DETAILS",
          },
          isDemo: false,
        });
      }
    }

    return findings;
  } catch (err) {
    console.error("[AutoSOC] Failed to fetch AWS Config findings:", err);
    return [];
  }
}

