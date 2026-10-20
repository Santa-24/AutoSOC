import {
  SecurityFinding,
  Incident,
  ForensicRecord,
  ComplianceControl,
  IAMRiskItem,
} from "@/types/security";
import {
  DEMO_SECURITY_FINDINGS,
  DEMO_INCIDENTS,
  DEMO_FORENSIC_RECORDS,
  DEMO_COMPLIANCE_CONTROLS,
  DEMO_IAM_RISKS,
} from "@/lib/demo/synthetic-data";
import { getEnv } from "@/lib/env";
import { fetchLiveSecurityHubFindings } from "@/lib/aws/security-hub";
import { fetchLiveGuardDutyFindings } from "@/lib/aws/guardduty";
import { fetchLiveForensicEvents } from "@/lib/aws/cloudtrail";

// Mutable in-memory store for active session state (simulates DynamoDB incident persistence)
let memoryIncidents: Incident[] = [...DEMO_INCIDENTS];
let memoryFindings: SecurityFinding[] = [...DEMO_SECURITY_FINDINGS];
let isDemoModeRuntimeOverride: boolean | null = null;

export function isDemoModeActive(): boolean {
  if (isDemoModeRuntimeOverride !== null) {
    return isDemoModeRuntimeOverride;
  }
  return getEnv().AUTOSOC_DEMO_MODE;
}

export function setDemoModeRuntimeOverride(active: boolean) {
  isDemoModeRuntimeOverride = active;
}

export async function getAllSecurityFindings(): Promise<SecurityFinding[]> {
  const env = getEnv();
  const demoActive = isDemoModeActive();

  const liveFindings: SecurityFinding[] = [];

  // If live flags enabled, attempt real server-side fetch
  if (env.AUTOSOC_ENABLE_SECURITY_HUB) {
    const hubFindings = await fetchLiveSecurityHubFindings();
    liveFindings.push(...hubFindings);
  }
  if (env.AUTOSOC_ENABLE_GUARDDUTY) {
    const gdFindings = await fetchLiveGuardDutyFindings();
    liveFindings.push(...gdFindings);
  }

  if (demoActive) {
    return [...liveFindings, ...memoryFindings];
  }

  return liveFindings;
}

export async function getAllIncidents(): Promise<Incident[]> {
  const demoActive = isDemoModeActive();
  if (!demoActive) {
    // In live mode without demo, return only live-correlated incidents
    return memoryIncidents.filter((inc) => !inc.isDemo);
  }
  return memoryIncidents;
}

export async function getIncidentById(id: string): Promise<Incident | null> {
  const incidents = await getAllIncidents();
  return incidents.find((inc) => inc.id === id) || null;
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
  const demoActive = isDemoModeActive();

  const liveRecords: ForensicRecord[] = [];
  if (env.AUTOSOC_ENABLE_CLOUDTRAIL) {
    const ct = await fetchLiveForensicEvents();
    liveRecords.push(...ct);
  }

  if (demoActive) {
    return [...liveRecords, ...DEMO_FORENSIC_RECORDS];
  }
  return liveRecords;
}

export function getComplianceControls(): ComplianceControl[] {
  return DEMO_COMPLIANCE_CONTROLS;
}

export function getIAMRisks(): IAMRiskItem[] {
  return DEMO_IAM_RISKS;
}
