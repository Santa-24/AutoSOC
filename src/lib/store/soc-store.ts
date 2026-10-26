import {
  SecurityFinding,
  Incident,
  ForensicRecord,
  ComplianceControl,
  IAMRiskItem,
  ResourceIdentifier,
} from "@/types/security";
import { getEnv } from "@/lib/env";
import { fetchLiveSecurityHubFindings } from "@/lib/aws/security-hub";
import { fetchLiveGuardDutyFindings } from "@/lib/aws/guardduty";
import { fetchLiveConfigFindings } from "@/lib/aws/config";
import { fetchLiveForensicEvents, fetchLiveCloudTrailFindings } from "@/lib/aws/cloudtrail";
import { fetchLiveIAMRisks, fetchLiveIAMFindings } from "@/lib/aws/iam";
import { fetchLiveS3Findings } from "@/lib/aws/s3";
import { fetchLiveComplianceControls } from "@/lib/aws/compliance";

// Global store cache for fast Next.js dev server responses
const globalStore = globalThis as unknown as {
  _autoSocCachedFindings?: { findings: SecurityFinding[]; timestamp: number };
  _autoSocMemoryIncidents?: Incident[];
  _autoSocMemoryFindings?: SecurityFinding[];
};

if (!globalStore._autoSocMemoryIncidents) globalStore._autoSocMemoryIncidents = [];
if (!globalStore._autoSocMemoryFindings) globalStore._autoSocMemoryFindings = [];

const FINDINGS_CACHE_TTL_MS = 20000; // 20s live cache

export function isDemoModeActive(): boolean {
  return false;
}

export function setDemoModeRuntimeOverride(_active: boolean) {
  // Demo mode is permanently disabled
}

export async function getAllSecurityFindings(forceRefresh = false): Promise<SecurityFinding[]> {
  const now = Date.now();
  if (
    !forceRefresh &&
    globalStore._autoSocCachedFindings &&
    now - globalStore._autoSocCachedFindings.timestamp < FINDINGS_CACHE_TTL_MS
  ) {
    return globalStore._autoSocCachedFindings.findings;
  }

  const env = getEnv();
  const liveFindings: SecurityFinding[] = [];

  const tasks: Promise<SecurityFinding[]>[] = [
    fetchLiveIAMFindings().catch(() => []),
    fetchLiveS3Findings().catch(() => []),
  ];

  if (env.AUTOSOC_ENABLE_CLOUDTRAIL) {
    tasks.push(fetchLiveCloudTrailFindings().catch(() => []));
  }
  if (env.AUTOSOC_ENABLE_SECURITY_HUB) {
    tasks.push(fetchLiveSecurityHubFindings().catch(() => []));
  }
  if (env.AUTOSOC_ENABLE_GUARDDUTY) {
    tasks.push(fetchLiveGuardDutyFindings().catch(() => []));
  }
  if (env.AUTOSOC_ENABLE_CONFIG) {
    tasks.push(fetchLiveConfigFindings().catch(() => []));
  }

  const results = await Promise.allSettled(tasks);
  for (const r of results) {
    if (r.status === "fulfilled") {
      liveFindings.push(...r.value);
    }
  }

  const memoryList = globalStore._autoSocMemoryFindings || [];
  const validMemoryFindings = memoryList.filter((f) => !f.isDemo);
  const totalFindings = [...liveFindings, ...validMemoryFindings];

  globalStore._autoSocCachedFindings = {
    findings: totalFindings,
    timestamp: now,
  };

  return totalFindings;
}

export async function getAllIncidents(): Promise<Incident[]> {
  const liveIncidents = memoryIncidents.filter((inc) => !inc.isDemo);
  if (liveIncidents.length > 0) {
    return liveIncidents;
  }

  // Correlate active live findings by source into distinct incidents
  const liveFindings = await getAllSecurityFindings();
  if (liveFindings.length > 0) {
    // Group findings by source
    const grouped = new Map<string, SecurityFinding[]>();
    for (const finding of liveFindings) {
      const key = finding.source;
      if (!grouped.has(key)) {
        grouped.set(key, []);
      }
      grouped.get(key)!.push(finding);
    }

    const now = new Date().toISOString();
    const createdIncidents: Incident[] = [];

    const groupEntries = Array.from(grouped.entries());
    for (const entry of groupEntries) {
      const source = entry[0];
      const groupFindings: SecurityFinding[] = entry[1];
      const highOrCrit = groupFindings.filter(
        (f: SecurityFinding) => f.severity === "CRITICAL" || f.severity === "HIGH"
      );
      const targetFindings: SecurityFinding[] = highOrCrit.length > 0 ? highOrCrit : groupFindings;
      const allResources: ResourceIdentifier[] = targetFindings.flatMap((f: SecurityFinding) => f.resources);
      const uniqueResources: ResourceIdentifier[] = Array.from(
        new Map(allResources.map((r: ResourceIdentifier) => [r.id, r])).values()
      );

      const incidentSeverity = targetFindings.some((f: SecurityFinding) => f.severity === "CRITICAL")
        ? "CRITICAL"
        : targetFindings.some((f: SecurityFinding) => f.severity === "HIGH")
        ? "HIGH"
        : "MEDIUM";

      const liveIncident: Incident = {
        id: `INC-LIVE-${source.toUpperCase()}-001`,
        findingIds: targetFindings.map((f: SecurityFinding) => f.id),
        title: `Live AWS Security Incident: ${targetFindings[0].title}`,
        severity: incidentSeverity,
        status: "TRIAGE",
        owner: "secops-oncall@autosoc.corp",
        summary: `Autonomous correlation engine grouped ${targetFindings.length} active live telemetry finding(s) from ${source}. Affects ${uniqueResources.length} cloud resource(s).`,
        affectedResources: uniqueResources,
        timeline: [
          {
            id: `tl-live-${Date.now()}-${source.toLowerCase()}`,
            timestamp: now,
            title: `Live ${source} telemetry ingested and correlated`,
            description: `AutoSOC correlated telemetry from ${source} in region ${targetFindings[0].region}. Primary indicator: '${targetFindings[0].title}'`,
            source,
            type: "DETECTION",
          },
        ],
        notes: [],
        responseState: {
          dryRunExecuted: false,
          approvalGranted: false,
          executionStatus: "IDLE",
        },
        createdAt: targetFindings[0].createdAt || now,
        updatedAt: now,
        isDemo: false,
      };

      createdIncidents.push(liveIncident);
    }

    memoryIncidents.push(...createdIncidents);
    return createdIncidents;
  }

  return [];
}

export async function getIncidentById(id: string): Promise<Incident | null> {
  const incidents = await getAllIncidents();
  const directMatch = incidents.find((inc) => inc.id === id);
  if (directMatch) return directMatch;

  const matchByFinding = incidents.find((inc) => inc.findingIds.includes(id));
  if (matchByFinding) return matchByFinding;

  // If queried by finding ID directly, synthesize on-the-fly incident
  const liveFindings = await getAllSecurityFindings();
  const targetFinding = liveFindings.find((f) => f.id === id);
  if (targetFinding) {
    const now = new Date().toISOString();
    const inc: Incident = {
      id: `INC-${targetFinding.id}`,
      findingIds: [targetFinding.id],
      title: `Security Incident: ${targetFinding.title}`,
      severity: targetFinding.severity === "INFORMATIONAL" ? "LOW" : targetFinding.severity,
      status: "TRIAGE",
      owner: "secops-oncall@autosoc.corp",
      summary: targetFinding.description,
      affectedResources: targetFinding.resources,
      timeline: [
        {
          id: `tl-${Date.now()}`,
          timestamp: now,
          title: "Finding ingested and converted to incident",
          description: `AutoSOC ingested finding ${targetFinding.id} from ${targetFinding.source}.`,
          source: targetFinding.source,
          type: "DETECTION",
        },
      ],
      notes: [],
      responseState: {
        dryRunExecuted: false,
        approvalGranted: false,
        executionStatus: "IDLE",
      },
      createdAt: targetFinding.createdAt || now,
      updatedAt: now,
      isDemo: false,
    };
    memoryIncidents.push(inc);
    return inc;
  }

  return null;
}

export function updateIncidentStatus(
  id: string,
  status: Incident["status"],
  actor: string
): Incident | null {
  const incident = memoryIncidents.find((inc) => inc.id === id);
  if (!incident) return null;

  incident.status = status;
  incident.updatedAt = new Date().toISOString();
  incident.timeline.push({
    id: `tl-${Date.now()}`,
    timestamp: new Date().toISOString(),
    title: `Incident status updated to ${status}`,
    description: `Analyst '${actor}' transitioned status to ${status}.`,
    actor,
    source: "AutoSOC-Console",
    type: "ANALYSIS",
  });

  return incident;
}

export function addIncidentNote(
  incidentId: string,
  author: string,
  content: string
): Incident | null {
  const incident = memoryIncidents.find((inc) => inc.id === incidentId);
  if (!incident) return null;

  incident.notes.push({
    id: `note-${Date.now()}`,
    author,
    timestamp: new Date().toISOString(),
    content,
  });
  incident.updatedAt = new Date().toISOString();

  return incident;
}

export async function getForensicRecords(): Promise<ForensicRecord[]> {
  const env = getEnv();
  const liveRecords: ForensicRecord[] = [];
  if (env.AUTOSOC_ENABLE_CLOUDTRAIL) {
    const ct = await fetchLiveForensicEvents();
    liveRecords.push(...ct);
  }
  return liveRecords;
}

export async function getComplianceControls(): Promise<ComplianceControl[]> {
  return fetchLiveComplianceControls();
}

export async function getIAMRisks(): Promise<IAMRiskItem[]> {
  return fetchLiveIAMRisks();
}
