# Security Policy & Defensive Engineering

## Core Security Commitments
AutoSOC is architected under strict zero-trust assumptions. Because security operations tools possess high potential leverage over cloud infrastructure, AutoSOC enforces defensive constraints directly in code:

1. **Zero Browser Secrets:** AWS credentials, secret keys, IAM session tokens, and STS assume-role calls are strictly executed server-side. No AWS SDK credentials ever leak into browser bundles or client-side storage.
2. **Dry-Run by Default:** Destructive or high-impact remediation playbooks (e.g., hypervisor network isolation, IAM key deactivation, S3 public block enforcement) are simulated first to compute blast radius before any mutation can occur.
3. **Explicit Human Confirmation:** AI models and automated correlation engines are strictly advisory. Autonomous execution of destructive mutations is prohibited without signed human analyst confirmation.
4. **Prompt Injection & Redaction Shields:** Telemetry from logs, user agents, and finding bodies is treated as untrusted data. Strings are scrubbed of secrets and wrapped in protective XML delimiters before being evaluated by LLMs.
5. **Cryptographic Tamper-Evident Auditing:** Every query, dry-run simulation, approval, and execution event is committed to an append-only audit trail with SHA-256 integrity verification.
6. **No AdministratorAccess in Production:** Telemetry ingestion roles are granted only read-only permissions and are strictly decoupled from remediation roles.

## Threat Model & Safeguards

| Threat Vector | Risk Description | AutoSOC Defensive Mitigation |
| :--- | :--- | :--- |
| **Credential Exfiltration** | Secrets leaking through frontend JS or console logs. | Server-side execution only; deep recursive redaction filter on all logs (`sanitizeLogDetails`). |
| **Inadvertent Outage** | Autonomous remediation disconnecting critical workloads. | Multi-tier approval gate; mandatory dry-run blast radius evaluation (`generateDryRunPreview`). |
| **Prompt Injection** | Adversary embedding jailbreak commands in finding tags or logs. | Sanitization engine strips control tags (`<system>`, instructions) and enforces strict schema grounding. |
| **Confused Deputy / Overbroad IAM** | Malicious entity assuming AutoSOC roles across accounts. | Scoped IAM policies with condition checks; separation of read-only vs remediation IAM roles. |
| **Fabricated Finding Deception** | Analysts acting on unverified synthetic alerts. | Unmistakable `DEMO DATA` banner; live status lights illuminate only after real server-side STS verification. |

## Responsible Use of Remediation Playbooks
When executing remediation playbooks:
- **EC2 Hypervisor Quarantine:** Only apply to instances verified to be compromised or beaconing. Isolating an instance severs all network connections (SSH, HTTPS, VPC peering).
- **IAM Key Deactivation:** Transitions keys to `Inactive` state rather than deleting them. This preserves key history and allows instant rollback if a legitimate CI/CD pipeline was interrupted.
- **S3 Public Access Block:** Verify whether the target bucket is legitimately designated as a public static asset host before enforcing public block.

## Reporting a Vulnerability
If you discover a security issue or architectural vulnerability within AutoSOC:
1. Do **NOT** file a public GitHub issue.
2. Contact the security team at `security@autosoc.corp` with reproduction steps and an affected component trace.
3. We acknowledge reports within 24 hours and provide coordinated remediation timelines.
