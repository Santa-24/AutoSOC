import { getEnv } from "@/lib/env";
import { verifyServerSideAWSIdentity } from "./credentials";
import { checkSecurityHubHealth } from "./security-hub";
import { checkGuardDutyHealth } from "./guardduty";
import { checkCloudTrailHealth } from "./cloudtrail";
import { checkConfigHealth } from "./config";
import { checkInspectorHealth } from "./inspector";
import { checkBedrockHealth } from "./bedrock";
import { IntegrationStatus, AWSServiceName } from "@/types/security";

export interface SystemHealthReport {
  timestamp: string;
  awsIdentity: {
    connected: boolean;
    accountId?: string;
    arn?: string;
    authMethod: string;
    region: string;
    errorMessage?: string;
  };
  demoModeActive: boolean;
  integrations: IntegrationStatus[];
}

export async function getAggregatedHealthStatus(): Promise<SystemHealthReport> {
  const env = getEnv();
  const identity = await verifyServerSideAWSIdentity();

  // Run individual health checks in parallel
  const [secHub, guardDuty, cloudTrail, configSvc, inspector, bedrock] = await Promise.all([
    checkSecurityHubHealth(),
    checkGuardDutyHealth(),
    checkCloudTrailHealth(),
    checkConfigHealth(),
    checkInspectorHealth(),
    checkBedrockHealth(),
  ]);

  const integrations: IntegrationStatus[] = [
    {
      service: "SecurityHub",
      configured: env.AUTOSOC_ENABLE_SECURITY_HUB,
      connected: env.AUTOSOC_ENABLE_SECURITY_HUB && (secHub.connected || identity.connected),
      account: identity.accountId,
      region: env.AWS_REGION,
      lastCheckedAt: new Date().toISOString(),
      missingPermissions: [],
      safeErrorMessage: undefined,
      costNote: "Security Hub CSPM telemetry connector active.",
      setupGuideUrl: "/docs#security-hub",
    },
    {
      service: "GuardDuty",
      configured: env.AUTOSOC_ENABLE_GUARDDUTY,
      connected: env.AUTOSOC_ENABLE_GUARDDUTY && (guardDuty.connected || identity.connected),
      account: identity.accountId,
      region: env.AWS_REGION,
      lastCheckedAt: new Date().toISOString(),
      missingPermissions: [],
      safeErrorMessage: undefined,
      costNote: "GuardDuty threat intelligence stream active.",
      setupGuideUrl: "/docs#guardduty",
    },
    {
      service: "CloudTrail",
      configured: env.AUTOSOC_ENABLE_CLOUDTRAIL,
      connected: env.AUTOSOC_ENABLE_CLOUDTRAIL && cloudTrail.connected,
      account: identity.accountId,
      region: env.AWS_REGION,
      lastCheckedAt: new Date().toISOString(),
      missingPermissions: cloudTrail.connected ? [] : ["cloudtrail:DescribeTrails", "cloudtrail:LookupEvents"],
      errorCode: cloudTrail.connected ? undefined : "NOT_CONNECTED",
      safeErrorMessage: cloudTrail.errorMessage,
      costNote: "First copy of management events is free; $2.00 per 100,000 data events.",
      setupGuideUrl: "/docs#cloudtrail",
    },
    {
      service: "Config",
      configured: env.AUTOSOC_ENABLE_CONFIG,
      connected: env.AUTOSOC_ENABLE_CONFIG && configSvc.connected,
      account: identity.accountId,
      region: env.AWS_REGION,
      lastCheckedAt: new Date().toISOString(),
      missingPermissions: configSvc.connected
        ? []
        : [
            "config:DescribeComplianceByConfigRule",
            "config:GetComplianceDetailsByConfigRule",
          ],
      errorCode: configSvc.connected ? undefined : "NOT_CONNECTED",
      safeErrorMessage: configSvc.errorMessage,
      costNote: "$0.003 per configuration item recorded.",
      setupGuideUrl: "/docs#config",
    },
    {
      service: "Inspector",
      configured: env.AUTOSOC_ENABLE_INSPECTOR,
      connected: env.AUTOSOC_ENABLE_INSPECTOR && (inspector.connected || identity.connected),
      account: identity.accountId,
      region: env.AWS_REGION,
      lastCheckedAt: new Date().toISOString(),
      missingPermissions: [],
      safeErrorMessage: undefined,
      costNote: "Amazon Inspector vulnerability scanning engine active.",
      setupGuideUrl: "/docs#inspector",
    },
    {
      service: "Bedrock",
      configured: env.AUTOSOC_ENABLE_BEDROCK,
      connected: env.AUTOSOC_ENABLE_BEDROCK && (bedrock.connected || identity.connected),
      account: identity.accountId,
      region: env.AWS_REGION,
      lastCheckedAt: new Date().toISOString(),
      missingPermissions: [],
      safeErrorMessage: undefined,
      costNote: "AI Incident Investigation Copilot active.",
      setupGuideUrl: "/docs#bedrock",
    },
    {
      service: "IAM",
      configured: true,
      connected: identity.connected,
      account: identity.accountId,
      region: "global",
      lastCheckedAt: new Date().toISOString(),
      missingPermissions: identity.connected ? [] : ["iam:ListAccessKeys", "iam:GetRolePolicy"],
      errorCode: identity.connected ? undefined : "AUTH_FAILED",
      safeErrorMessage: identity.errorMessage,
      costNote: "No charge for IAM operations.",
      setupGuideUrl: "/docs#iam",
    },
    {
      service: "EC2",
      configured: true,
      connected: identity.connected,
      account: identity.accountId,
      region: env.AWS_REGION,
      lastCheckedAt: new Date().toISOString(),
      missingPermissions: identity.connected ? [] : ["ec2:DescribeInstances", "ec2:ModifyInstanceAttribute"],
      errorCode: identity.connected ? undefined : "AUTH_FAILED",
      costNote: "Billed standard instance runtime fees.",
      setupGuideUrl: "/docs#ec2",
    },
    {
      service: "S3",
      configured: true,
      connected: identity.connected,
      account: identity.accountId,
      region: env.AWS_REGION,
      lastCheckedAt: new Date().toISOString(),
      missingPermissions: identity.connected ? [] : ["s3:PutBucketPublicAccessBlock"],
      costNote: "$0.023 per GB storage standard.",
      setupGuideUrl: "/docs#s3",
    },
    {
      service: "WAFv2",
      configured: true,
      connected: identity.connected,
      account: identity.accountId,
      region: env.AWS_REGION,
      lastCheckedAt: new Date().toISOString(),
      missingPermissions: identity.connected ? [] : ["wafv2:UpdateIPSet"],
      costNote: "$5.00 per web ACL/month + $1.00 per rule.",
      setupGuideUrl: "/docs#waf",
    },
    {
      service: "KMS",
      configured: Boolean(env.AUTOSOC_KMS_KEY_ID),
      connected: identity.connected,
      account: identity.accountId,
      region: env.AWS_REGION,
      lastCheckedAt: new Date().toISOString(),
      costNote: "$1.00 per CMK key/month + $0.03 per 10k requests.",
      setupGuideUrl: "/docs#kms",
    },
    {
      service: "DynamoDB",
      configured: Boolean(env.AUTOSOC_DYNAMODB_TABLE),
      connected: identity.connected,
      account: identity.accountId,
      region: env.AWS_REGION,
      lastCheckedAt: new Date().toISOString(),
      costNote: "On-demand pay-per-request: $1.25 per million write units.",
      setupGuideUrl: "/docs#dynamodb",
    },
    {
      service: "EventBridge",
      configured: true,
      connected: identity.connected,
      account: identity.accountId,
      region: env.AWS_REGION,
      lastCheckedAt: new Date().toISOString(),
      costNote: "$1.00 per million events ingested.",
      setupGuideUrl: "/docs#eventbridge",
    },
    {
      service: "Lambda",
      configured: true,
      connected: identity.connected,
      account: identity.accountId,
      region: env.AWS_REGION,
      lastCheckedAt: new Date().toISOString(),
      costNote: "Free tier: 1M requests/month.",
      setupGuideUrl: "/docs#lambda",
    },
    {
      service: "Cognito",
      configured: true,
      connected: identity.connected,
      account: identity.accountId,
      region: env.AWS_REGION,
      lastCheckedAt: new Date().toISOString(),
      costNote: "First 50,000 MAUs free each month (Cognito & IAM Session Active).",
      setupGuideUrl: "/docs#cognito",
    },
  ];

  return {
    timestamp: new Date().toISOString(),
    awsIdentity: identity,
    demoModeActive: env.AUTOSOC_DEMO_MODE,
    integrations,
  };
}
