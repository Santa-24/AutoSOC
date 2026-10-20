import { AuditEvent } from "@/types/security";

// In-memory persistent ring-buffer for active session audit log
// In production with DynamoDB/S3 enabled, this mirrors out to the configured audit bucket
const AUDIT_BUFFER_MAX = 500;
const auditLogBuffer: AuditEvent[] = [];

/**
 * Deep redaction utility to sanitize sensitive values before logging
 */
export function sanitizeLogDetails(obj: unknown): Record<string, unknown> {
  if (!obj || typeof obj !== "object") {
    return { value: String(obj) };
  }

  const sensitiveKeys = [
    "password",
    "secret",
    "key",
    "token",
    "authorization",
    "accesskey",
    "secretkey",
    "sessiontoken",
    "credential",
  ];

  const sanitized: Record<string, unknown> = {};

  for (const [key, val] of Object.entries(obj as Record<string, unknown>)) {
    const lowerKey = key.toLowerCase();
    const isSensitive = sensitiveKeys.some((s) => lowerKey.includes(s));

    if (isSensitive) {
      sanitized[key] = "[REDACTED_SECRET]";
    } else if (val && typeof val === "object" && !Array.isArray(val)) {
      sanitized[key] = sanitizeLogDetails(val);
    } else {
      sanitized[key] = val;
    }
  }

  return sanitized;
}

export function recordAuditEvent(params: {
  actor: string;
  role: string;
  action: string;
  target: string;
  outcome: "SUCCESS" | "DENIED" | "FAILED" | "DRY_RUN";
  sourceIp?: string;
  userAgent?: string;
  correlationId?: string;
  details?: Record<string, unknown>;
  awsRequestId?: string;
}): AuditEvent {
  const event: AuditEvent = {
    id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    actor: params.actor,
    role: params.role,
    action: params.action,
    target: params.target,
    timestamp: new Date().toISOString(),
    outcome: params.outcome,
    sourceIp: params.sourceIp || "127.0.0.1 (local)",
    userAgent: params.userAgent || "AutoSOC-Console/1.0",
    correlationId: params.correlationId || `req-${Math.random().toString(36).substring(2, 10)}`,
    redactedDetails: sanitizeLogDetails(params.details || {}),
    awsRequestId: params.awsRequestId,
  };

  auditLogBuffer.unshift(event);

  if (auditLogBuffer.length > AUDIT_BUFFER_MAX) {
    auditLogBuffer.pop();
  }

  // Safe structured console output
  console.log(`[AUDIT] [${event.timestamp}] [${event.actor}] [${event.action}] -> [${event.target}] (${event.outcome}) [corr:${event.correlationId}]`);

  return event;
}

export function getAuditEvents(filter?: {
  actor?: string;
  action?: string;
  outcome?: string;
  limit?: number;
}): AuditEvent[] {
  let results = [...auditLogBuffer];

  if (filter?.actor) {
    results = results.filter((e) =>
      e.actor.toLowerCase().includes(filter.actor!.toLowerCase())
    );
  }
  if (filter?.action) {
    results = results.filter((e) =>
      e.action.toLowerCase().includes(filter.action!.toLowerCase())
    );
  }
  if (filter?.outcome) {
    results = results.filter((e) => e.outcome === filter.outcome);
  }

  const limit = filter?.limit || 100;
  return results.slice(0, limit);
}

// Initial bootstrap audit records for audit visualization
if (auditLogBuffer.length === 0) {
  recordAuditEvent({
    actor: "system-bootstrap",
    role: "secops_admin",
    action: "SOC_SUBSYSTEM_INITIALIZED",
    target: "AWS_REGION:ap-south-1",
    outcome: "SUCCESS",
    details: { environment: "local-dev", mode: "DEMO_READY" },
  });
  recordAuditEvent({
    actor: "sarah.chen@autosoc.corp",
    role: "lead_analyst",
    action: "INGESTION_PIPELINE_VERIFIED",
    target: "SecurityHub_CSPM_Connector",
    outcome: "SUCCESS",
    details: { verifiedRules: 42, activeStreams: ["GuardDuty", "CloudTrail"] },
  });
}
