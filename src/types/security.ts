export type SeverityLevel = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "INFORMATIONAL";

export type FindingStatus = "ACTIVE" | "INVESTIGATING" | "REMEDIATING" | "RESOLVED" | "SUPPRESSED";

export type IncidentStatus = "TRIAGE" | "INVESTIGATING" | "AWAITING_APPROVAL" | "REMEDIATING" | "CONTAINED" | "CLOSED";

export type AWSServiceName =
  | "SecurityHub"
  | "GuardDuty"
  | "CloudTrail"
  | "Config"
  | "Inspector"
  | "Bedrock"
  | "IAM"
  | "EC2"
  | "S3"
  | "WAFv2"
  | "KMS"
  | "DynamoDB"
  | "EventBridge"
  | "Lambda"
  | "Cognito";

export interface ResourceIdentifier {
  type: string;
  id: string;
  arn: string;
  region?: string;
  accountId?: string;
  tags?: Record<string, string>;
}

export interface SecurityFinding {
  id: string;
  source: AWSServiceName;
  title: string;
  description: string;
  severity: SeverityLevel;
  status: FindingStatus;
  accountId: string;
  region: string;
  resources: ResourceIdentifier[];
  createdAt: string; // ISO UTC
  updatedAt: string; // ISO UTC
  evidenceReferences: string[];
  rawFindingReference?: string;
  complianceFrameworks?: string[];
  mitreAttackTechniques?: string[];
  tags: Record<string, string>;
  isDemo: boolean;
}

export interface TimelineEvent {
  id: string;
  timestamp: string; // ISO UTC
  title: string;
  description: string;
  actor?: string;
  source: string;
  type: "DETECTION" | "ENRICHMENT" | "ANALYSIS" | "APPROVAL" | "EXECUTION" | "NOTE";
}

export interface Incident {
  id: string;
  findingIds: string[];
  title: string;
  severity: SeverityLevel;
  status: IncidentStatus;
  owner: string;
  summary: string;
  affectedResources: ResourceIdentifier[];
  timeline: TimelineEvent[];
  notes: Array<{
    id: string;
    author: string;
    timestamp: string;
    content: string;
  }>;
  responseState: {
    playbookId?: string;
    dryRunExecuted: boolean;
    approvalGranted: boolean;
    approvedBy?: string;
    executionStatus: "IDLE" | "PENDING_APPROVAL" | "EXECUTING" | "COMPLETED" | "FAILED";
  };
  createdAt: string;
  updatedAt: string;
  isDemo: boolean;
}

export type PlaybookId =
  | "EC2_QUARANTINE_ISOLATION"
  | "IAM_ACCESS_KEY_DEACTIVATION"
  | "S3_BLOCK_PUBLIC_ACCESS"
  | "WAF_IP_REPUTATION_BLOCK"
  | "IAM_EXCESSIVE_PERMS_PROPOSAL";

export interface ResponsePlaybookDefinition {
  id: PlaybookId;
  name: string;
  targetService: "EC2" | "IAM" | "S3" | "WAFv2";
  description: string;
  riskImpact: "HIGH" | "MEDIUM" | "LOW";
  prerequisites: string[];
  impactWarning: string;
  requiredPermissions: string[];
  requiresApproval: boolean;
  rollbackNotes: string;
}

export interface DryRunResult {
  playbookId: PlaybookId;
  targetResource: string;
  simulatedAction: string;
  affectedDependencies: string[];
  potentialOutageRisk: string;
  canExecuteSafely: boolean;
  reasonsToRefuse?: string[];
  generatedCommandProposal: string;
}

export interface ResponseAction {
  id: string;
  incidentId: string;
  playbookId: PlaybookId;
  target: string;
  action: string;
  dryRun: boolean;
  approvalStatus: "NOT_REQUIRED" | "PENDING" | "APPROVED" | "REJECTED";
  requestedBy: string;
  approvedBy?: string;
  executionStatus: "PROPOSED" | "DRY_RUN_COMPLETED" | "EXECUTING" | "SUCCESS" | "FAILED" | "CANCELLED";
  resultSummary?: string;
  awsRequestId?: string;
  correlationId: string;
  createdAt: string;
  executedAt?: string;
  isDemo: boolean;
}

export interface AuditEvent {
  id: string;
  actor: string;
  role: string;
  action: string;
  target: string;
  timestamp: string;
  outcome: "SUCCESS" | "DENIED" | "FAILED" | "DRY_RUN";
  sourceIp: string;
  userAgent: string;
  correlationId: string;
  redactedDetails: Record<string, unknown>;
  awsRequestId?: string;
}

export interface IntegrationStatus {
  service: AWSServiceName;
  configured: boolean;
  connected: boolean;
  lastCheckedAt?: string;
  account?: string;
  region?: string;
  missingPermissions?: string[];
  errorCode?: string;
  safeErrorMessage?: string;
  costNote: string;
  setupGuideUrl?: string;
}

export interface ComplianceControl {
  id: string;
  framework: "CIS AWS Foundations v3.0" | "NIST CSF 2.0" | "ISO/IEC 27001:2022";
  controlId: string;
  title: string;
  domain: string;
  severity: SeverityLevel;
  status: "PASS" | "FAIL" | "NOT_EVALUATED" | "UNKNOWN";
  resourceId?: string;
  description: string;
  rationale: string;
  remediationGuidance: string;
  lastEvaluatedAt: string;
}

export interface IAMRiskItem {
  id: string;
  entityType: "ROLE" | "USER" | "POLICY";
  entityName: string;
  arn: string;
  riskLevel: SeverityLevel;
  findingType: "WILDCARD_ADMIN_POLICY" | "UNUSED_PRIVILEGED_CREDS" | "INLINE_UNRESTRICTED_PASSROLE" | "PUBLIC_ASSUME_ROLE_TRUST";
  description: string;
  affectedActionCount: number;
  lastActivity: string;
  remediationRecommendation: string;
  policySnippet: string;
  isDemo: boolean;
}

export interface ForensicRecord {
  id: string;
  timestamp: string;
  eventSource: string;
  eventName: string;
  actorArn: string;
  sourceIpAddress: string;
  userAgent: string;
  resourceArn: string;
  awsRegion: string;
  sha256Hash: string;
  custodyChain: Array<{
    verifier: string;
    timestamp: string;
    hashVerified: boolean;
  }>;
  rawPayload: Record<string, unknown>;
}

export type AnalystRole = "secops_admin" | "lead_analyst" | "soc_analyst" | "compliance_auditor";

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: AnalystRole;
  permissions: {
    canApproveRemediation: boolean;
    canExecuteDryRun: boolean;
    canTriggerAI: boolean;
    canModifySettings: boolean;
    canExportAudit: boolean;
  };
}

export interface AIInvestigationRequest {
  incidentId: string;
  findingContext: SecurityFinding[];
  analystPrompt?: string;
}

export interface AIInvestigationResponse {
  summary: string;
  suggestedMitigations: string[];
  evidencePointers: Array<{
    id: string;
    source: string;
    description: string;
  }>;
  recommendedPlaybook?: PlaybookId;
  uncertaintyDisclaimer: string;
  confidenceScore: number;
  modelUsed: string;
  isFallback: boolean;
  redactedSensitiveTokensCount: number;
}
