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
      connected: secHub.connected,
      account: identity.accountId,
      region: env.AWS_REGION,
      lastCheckedAt: new Date().toISOString(),
      missingPermissions: secHub.connected ? [] : ["securityhub:DescribeHub", "securityhub:GetFindings"],
      errorCode: secHub.connected ? undefined : "NOT_CONNECTED",
      safeErrorMessage: secHub.errorMessage,
      costNote: "Free 30-day trial in new accounts; ~$0.0010 per finding check afterwards.",
      setupGuideUrl: "/docs#security-hub",
    },
    {
      service: "GuardDuty",
      configured: env.AUTOSOC_ENABLE_GUARDDUTY,
      connected: guardDuty.connected,
      account: identity.accountId,
      region: env.AWS_REGION,
      lastCheckedAt: new Date().toISOString(),
      missingPermissions: guardDuty.connected ? [] : ["guardduty:ListDetectors", "guardduty:GetFindings"],
      errorCode: guardDuty.connected ? undefined : "NOT_CONNECTED",
      safeErrorMessage: guardDuty.errorMessage,
      costNote: "Free 30-day trial; billed on CloudTrail & VPC Flow Log volume.",
      setupGuideUrl: "/docs#guardduty",
    },
    {
      service: "CloudTrail",
      configured: env.AUTOSOC_ENABLE_CLOUDTRAIL,
      connected: cloudTrail.connected,
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
      connected: configSvc.connected,
      account: identity.accountId,
      region: env.AWS_REGION,
      lastCheckedAt: new Date().toISOString(),
      missingPermissions: configSvc.connected ? [] : ["config:DescribeComplianceByConfigRule"],
      errorCode: configSvc.connected ? undefined : "NOT_CONNECTED",
      safeErrorMessage: configSvc.errorMessage,
      costNote: "$0.003 per configuration item recorded.",
      setupGuideUrl: "/docs#config",
    },
    {
      service: "Inspector",
      configured: env.AUTOSOC_ENABLE_INSPECTOR,
      connected: inspector.connected,
      account: identity.accountId,
      region: env.AWS_REGION,
      lastCheckedAt: new Date().toISOString(),
      missingPermissions: inspector.connected ? [] : ["inspector2:ListCoverage", "inspector2:ListFindings"],
      errorCode: inspector.connected ? undefined : "NOT_CONNECTED",
      safeErrorMessage: inspector.errorMessage,
      costNote: "15-day free trial; ~$1.25 per EC2 instance scan per month.",
      setupGuideUrl: "/docs#inspector",
    },
    {
      service: "Bedrock",
      configured: env.AUTOSOC_ENABLE_BEDROCK,
      connected: bedrock.connected,
      account: identity.accountId,
      region: env.AWS_REGION,
      lastCheckedAt: new Date().toISOString(),
      missingPermissions: bedrock.connected ? [] : ["bedrock:InvokeModel"],
      errorCode: bedrock.connected ? undefined : "MODEL_ACCESS_REQUIRED",
      safeErrorMessage: bedrock.errorMessage,
      costNote: "Pay per 1,000 input/output tokens. Claude 3 Sonnet: ~$0.003/1k input, $0.015/1k output.",
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
      configured: Boolean(env.COGNITO_USER_POOL_ID),
      connected: Boolean(env.COGNITO_USER_POOL_ID),
      account: identity.accountId,
      region: env.AWS_REGION,
      lastCheckedAt: new Date().toISOString(),
      costNote: "First 50,000 MAUs free each month.",
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
