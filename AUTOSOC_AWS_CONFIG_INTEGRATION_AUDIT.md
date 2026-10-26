# AutoSOC — AWS Config Integration Audit & Live Findings Troubleshooting Report

**Document ID:** `AUTOSOC-AUDIT-2026-CFG-01`  
**Evaluation Date:** October 24, 2026  
**Auditor:** Senior AWS Cloud Security Engineer & TypeScript Full-Stack DevSecOps Specialist  
**Target System:** AutoSOC (Autonomous Cloud Security Operations Center)  
**Target AWS Region:** `ap-south-1` (Mumbai)  
**Active Caller Account:** `941905484053`  
**Active IAM Identity:** `arn:aws:iam::941905484053:user/autosoc-dev-operator`  
**Evaluation Status:** COMPLETE — DIAGNOSIS VERIFIED WITH LIVE AWS TELEMETRY & FULL CODE REMEDIATION IMPLEMENTED  

---

## 1. Executive Summary

AutoSOC is designed to ingest AWS cloud security telemetry (CloudTrail, GuardDuty, Security Hub, AWS Config, and Inspector) and correlate indicators into unified incidents for analyst triage and response. 

During operational validation, the AWS Config console reported two noncompliant security groups (`sg-0cd9835b61ad1df1a` and `sg-0feadfb5292083aab`) evaluated against the managed rule `restricted-ssh`. However, the AutoSOC Incidents page (`/incidents`) and Command Center dashboard (`/dashboard`) displayed **0 findings** and **0 incidents**, while the AWS Integrations page (`/integrations`) reported `AUTOSOC_ENABLE_CONFIG` as `STANDBY` and `Flag: DISABLED`.

This audit executed an exhaustive read-only inspection of the repository, environment configurations, AWS SDK interactions, and live AWS APIs in `ap-south-1`. 

### Key Findings Summary:
1. **Feature Flag Precedence Collision:** `.env.local` contained `AUTOSOC_ENABLE_CONFIG=false`, overriding `.env` (which had `AUTOSOC_ENABLE_CONFIG=true`). Under Next.js configuration loading rules, `.env.local` takes precedence, forcing the runtime configuration flag to `false`.
2. **Missing Ingestion Pipeline in Application Code:** In `src/lib/store/soc-store.ts`, `getAllSecurityFindings()` strictly queried Security Hub and GuardDuty. AWS Config was **never invoked**. Furthermore, `src/lib/aws/config.ts` only implemented a rudimentary health check (`checkConfigHealth`) with no function to retrieve compliance findings.
3. **API Capability Gap:** The existing codebase only referenced `DescribeComplianceByConfigRule`. This API only returns rule-level compliance status (`NON_COMPLIANT`), but **does not return resource IDs**. The `GetComplianceDetailsByConfigRule` API is strictly required to extract evaluated resource identifiers (`sg-0cd9835b61ad1df1a` and `sg-0feadfb5292083aab`).
4. **Active IAM Permission Restriction:** Live testing against AWS confirmed that while `autosoc-dev-operator` has permission to call `config:DescribeComplianceByConfigRule`, calling `config:GetComplianceDetailsByConfigRule` returned `AccessDeniedException` because `AutoSOC-Operator-Policy` lacked the `config:GetComplianceDetailsByConfigRule` permission.
5. **Incident Correlation Disconnect:** In live mode (`AUTOSOC_DEMO_MODE=false`), `getAllIncidents()` filtered out all demo incidents but had no mechanism to group live findings into correlated incidents, causing the dashboard incident counters to remain zero.

### Remediation Completed:
- Implemented `fetchLiveConfigFindings()` in `src/lib/aws/config.ts` supporting full two-tier Config ingestion (`DescribeComplianceByConfigRule` + `GetComplianceDetailsByConfigRule`), token pagination, deduplication, and graceful rule-level fallback when resource-level IAM permissions are pending.
- Integrated AWS Config findings into `getAllSecurityFindings()` and live incident correlation in `src/lib/store/soc-store.ts`.
- Updated health status reporting in `src/lib/aws/health.ts` and documentation in `AWS_CREDENTIALS_SETUP.txt` and `src/app/docs/page.tsx` to include `config:GetComplianceDetailsByConfigRule`.
- Created automated test suite `src/test/config-integration.test.ts` (8 new tests, 100% passing; all 31 project tests passing; TypeScript and ESLint clean).

---

## 2. Root Cause Analysis (Ranked by Evidence)

| Rank | Root Cause | Evidence Type | Specific File & Line Reference | Impact |
| :--- | :--- | :--- | :--- | :--- |
| **1** | **Feature Flag Override in `.env.local`** | Code & Environment Inspection | `.env.local:21` (`AUTOSOC_ENABLE_CONFIG=false`) vs `.env:23` (`AUTOSOC_ENABLE_CONFIG=true`) | Next.js loads `.env.local` over `.env`. `getEnv().AUTOSOC_ENABLE_CONFIG` evaluates to `false` at runtime. Entire Config subsystem disabled at entry gate. |
| **2** | **No Findings Fetcher Implemented in Code** | Architectural Code Inspection | `src/lib/store/soc-store.ts:38-59`, `src/lib/aws/config.ts:1-45` | `getAllSecurityFindings()` only called `fetchLiveSecurityHubFindings()` and `fetchLiveGuardDutyFindings()`. `config.ts` had no `fetchLiveConfigFindings` function whatsoever. |
| **3** | **API Selection Inadequacy (`Describe` vs `GetDetails`)** | AWS API Specification & Code Inspection | `src/lib/aws/config.ts:3, 28` (`DescribeComplianceByConfigRuleCommand`) | `DescribeComplianceByConfigRule` only yields compliance summaries (e.g. `NON_COMPLIANT`). Resource IDs (`sg-0cd9835b61ad1df1a`) can only be obtained via `GetComplianceDetailsByConfigRule`. |
| **4** | **Missing IAM Read Permission on Operator Identity** | Live AWS API Verification | Live STS + Config API call against `ap-south-1`: `AccessDeniedException` for `config:GetComplianceDetailsByConfigRule` | Identity `arn:aws:iam::941905484053:user/autosoc-dev-operator` is permitted for `DescribeComplianceByConfigRule`, but blocked on `GetComplianceDetailsByConfigRule`. |
| **5** | **Zero Incident Synthesis for Live Mode** | Data Layer Inspection | `src/lib/store/soc-store.ts:61-68` (`getAllIncidents`) | When `AUTOSOC_DEMO_MODE=false`, `memoryIncidents.filter(inc => !inc.isDemo)` returned `[]` because live findings were never grouped into an active live incident. |

---

## 3. End-to-End Telemetry Pipeline

```
[ AWS Cloud Infrastructure (ap-south-1) ]
                  │
                  ▼
         AWS Config Evaluator
         (Rule: restricted-ssh)
                  │
                  ├──────────────────────────────────────────────┐
                  ▼                                              ▼
  DescribeComplianceByConfigRule                  GetComplianceDetailsByConfigRule
  [Returns: restricted-ssh: NON_COMPLIANT]        [Returns: sg-0cd9835b61ad1df1a, sg-0feadfb5292083aab]
                  │                                              │
                  │ (Permission granted)                         │ (Requires config:GetComplianceDetailsByConfigRule)
                  └───────────────────────┬──────────────────────┘
                                          │
                                          ▼
                         AutoSOC Data Ingestion Layer
                          (src/lib/aws/config.ts)
                                          │
                         • Normalizes EvaluationResult
                         • Generates stable ID: cfg-restricted-ssh-sg-...
                         • Formats ARN: arn:aws:ec2:ap-south-1:...
                         • Maps severity: HIGH
                         • Resilient fallback if GetDetails denied
                                          │
                                          ▼
                          AutoSOC Store (soc-store.ts)
                         getAllSecurityFindings()
                         getAllIncidents() [Live Correlator]
                                          │
                                          ▼
                           Next.js API Gateway Routes
                           GET /api/findings
                           GET /api/incidents
                           GET /api/health
                                          │
            ┌─────────────────────────────┼─────────────────────────────┐
            ▼                             ▼                             ▼
    /incidents (UI)             /dashboard (UI)               /integrations (UI)
  • Security Findings feed    • Active Correlated Incidents • Connected status
  • SG Resource IDs displayed • Ingested Telemetry Findings • Active rules count
  • Filter by Source: Config  • High/Critical risk index    • Missing permissions alert
```

---

## 4. Files Inspected and Files Changed

### Files Inspected:
- `.env` (Environment config)
- `.env.local` (Local environment override)
- `.env.example` (Reference configuration template)
- `package.json` (SDK dependencies: `@aws-sdk/client-config-service@^3.696.0`)
- `AWS_CREDENTIALS_SETUP.txt` (IAM policies and setup guidance)
- `src/lib/env.ts` (Zod schema and configuration parsing)
- `src/types/security.ts` (Finding, incident, resource schema)
- `src/lib/aws/credentials.ts` (STS caller identity and AWS credential resolution)
- `src/lib/aws/config.ts` (Config client and health check)
- `src/lib/aws/health.ts` (Aggregated service health checks)
- `src/lib/store/soc-store.ts` (Findings, incidents, compliance store)
- `src/app/api/findings/route.ts` (Findings REST endpoint)
- `src/app/api/incidents/route.ts` (Incidents REST endpoint)
- `src/app/api/health/route.ts` (Health REST endpoint)
- `src/app/incidents/page.tsx` (Incidents & findings UI)
- `src/app/dashboard/page.tsx` (SecOps Command Center dashboard)
- `src/app/integrations/page.tsx` (Integrations health panel)
- `src/app/docs/page.tsx` (Documentation page and IAM policy snippet)
- `src/test/integration-workflow.test.ts` (Existing integration tests)
- `src/test/security.test.ts` (Existing defensive security tests)

### Files Modified:
- `src/lib/aws/config.ts`:
  - Added `fetchLiveConfigFindings()` with token pagination and evaluation result normalization.
  - Added `mapConfigRuleSeverity()` and `formatConfigResourceArn()`.
  - Added resilient fallback to rule-level finding if `config:GetComplianceDetailsByConfigRule` is restricted.
- `src/lib/store/soc-store.ts`:
  - Integrated `fetchLiveConfigFindings()` into `getAllSecurityFindings()`.
  - Added live incident correlation in `getAllIncidents()` when operating in live mode with active findings.
- `src/lib/aws/health.ts`:
  - Updated `missingPermissions` to declare both `config:DescribeComplianceByConfigRule` and `config:GetComplianceDetailsByConfigRule`.
- `src/app/docs/page.tsx`:
  - Updated sample IAM policy statement to include `config:GetComplianceDetailsByConfigRule`.
- `AWS_CREDENTIALS_SETUP.txt`:
  - Updated `AutoSOC-Operator-Policy` definition to include `config:GetComplianceDetailsByConfigRule`.
- `src/test/config-integration.test.ts` *(New file)*:
  - 8 automated unit tests verifying health checks, findings normalization, pagination, and error fallback.

---

## 5. Exact Feature Flag Configuration Required

In Next.js, environment variables are loaded in order of precedence:
1. `process.env` (system runtime)
2. `.env.development.local` / `.env.local` **(Highest file priority)**
3. `.env.development` / `.env` **(Lower file priority)**

In this project:
- `.env` line 23 has: `AUTOSOC_ENABLE_CONFIG=true`
- `.env.local` line 21 has: `AUTOSOC_ENABLE_CONFIG=false`

Because `.env.local` overrides `.env`, the effective runtime value evaluated by `src/lib/env.ts` was `false`.

### Required Local Change:
In `.env.local`:
```diff
-AUTOSOC_ENABLE_CONFIG=false
+AUTOSOC_ENABLE_CONFIG=true
```

> [!IMPORTANT]
> Next.js bundles environment variables during server initialization. Changing `.env.local` requires restarting the development server (`npm run dev`) for the change to take effect in the active node runtime.

---

## 6. Required Read-Only IAM Permissions

### Current State of IAM Policy:
The IAM user `autosoc-dev-operator` is attached to a policy matching `AWS_CREDENTIALS_SETUP.txt`, which only authorized:
```json
"Action": [
  "sts:GetCallerIdentity",
  "securityhub:DescribeHub",
  "securityhub:GetFindings",
  "guardduty:ListDetectors",
  "guardduty:GetFindings",
  "cloudtrail:DescribeTrails",
  "cloudtrail:LookupEvents",
  "config:DescribeComplianceByConfigRule",
  "inspector2:ListCoverage",
  "inspector2:ListFindings"
]
```

### Necessary Read-Only Expansion:
To enumerate individual noncompliant security groups (`sg-0cd9835b61ad1df1a` and `sg-0feadfb5292083aab`), the action `config:GetComplianceDetailsByConfigRule` must be added to the read-only telemetry statement.

### Scoped Read-Only IAM Policy Statement:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AutoSOCReadConfigCompliance",
      "Effect": "Allow",
      "Action": [
        "config:DescribeComplianceByConfigRule",
        "config:GetComplianceDetailsByConfigRule",
        "config:DescribeConfigRules"
      ],
      "Resource": "*"
    }
  ]
}
```

> [!NOTE]
> This permission is strictly read-only (`Get`/`Describe`). It does not allow modifying rules, deleting evaluations, or executing remediation actions. It preserves least privilege.

---

## 7. AWS Config API Calls and Finding Data Mapping

AutoSOC implements a two-stage querying pattern:
1. `DescribeComplianceByConfigRuleCommand`: Queries all evaluated rules in `ap-south-1` to discover rules with `ComplianceType === "NON_COMPLIANT"`.
2. `GetComplianceDetailsByConfigRuleCommand`: Queries the specific evaluation results for each noncompliant rule with `ComplianceTypes: ["NON_COMPLIANT"]` to extract individual resource identifiers and timestamps.

### Data Mapping Table:

| AutoSOC `SecurityFinding` Property | AWS Config Source Field | Example Mapped Value for `restricted-ssh` |
| :--- | :--- | :--- |
| `id` | Stable hash / composite key | `cfg-restricted-ssh-sg-0cd9835b61ad1df1a` |
| `source` | AutoSOC enum `AWSServiceName` | `"Config"` |
| `title` | Rule and resource descriptor | `"AWS Config: restricted-ssh Noncompliant (sg-0cd9835b61ad1df1a)"` |
| `description` | `EvaluationResult.Annotation` or template | `"Inbound SSH (port 22) rule allows unrestricted ingress 0.0.0.0/0"` |
| `severity` | `mapConfigRuleSeverity(ruleName, complianceType)` | `"HIGH"` |
| `status` | Normalized finding lifecycle | `"ACTIVE"` |
| `accountId` | AWS caller identity account ID | `"941905484053"` |
| `region` | `env.AWS_REGION` | `"ap-south-1"` |
| `resources[0].id` | `EvaluationResultQualifier.ResourceId` | `"sg-0cd9835b61ad1df1a"` |
| `resources[0].type` | `EvaluationResultQualifier.ResourceType` | `"AWS::EC2::SecurityGroup"` |
| `resources[0].arn` | Computed ARN | `"arn:aws:ec2:ap-south-1:941905484053:security-group/sg-0cd9835b61ad1df1a"` |
| `createdAt` | `ConfigRuleInvokedTime` | `2026-10-24T12:00:00.000Z` |
| `updatedAt` | `ResultRecordedTime` | `2026-10-24T12:05:00.000Z` |
| `complianceFrameworks` | Security benchmark frameworks | `["AWS Config Managed Rules", "CIS AWS Foundations"]` |
| `evidenceReferences` | Rule name + Compliance type + Annotation | `["AWS Config Rule: restricted-ssh", "Compliance Status: NON_COMPLIANT"]` |
| `tags` | Key-value metadata | `{ "ConfigRuleName": "restricted-ssh", "ComplianceType": "NON_COMPLIANT" }` |
| `isDemo` | Operational mode indicator | `false` |

---

## 8. Verification & Test Execution Results

### 8.1 Automated Unit Tests (Vitest)
Ran full test suite using `npm run test`:
- **Total Test Files:** 3 passed
- **Total Tests:** 31 passed (0 failed)
  - `src/test/config-integration.test.ts` (8 tests passed):
    - `checkConfigHealth` with flag disabled returns STANDBY.
    - `checkConfigHealth` with flag enabled and mock rules returns CONNECTED.
    - `checkConfigHealth` with API error returns safe diagnostic.
    - `fetchLiveConfigFindings` with flag disabled returns empty array.
    - `fetchLiveConfigFindings` correctly normalizes `restricted-ssh` with security groups `sg-0cd9835b61ad1df1a` and `sg-0feadfb5292083aab`.
    - `fetchLiveConfigFindings` handles multi-page pagination with `NextToken`.
    - `fetchLiveConfigFindings` gracefully falls back to rule-level finding when `GetComplianceDetailsByConfigRule` is denied by IAM.
    - `getAllSecurityFindings` includes Config findings in live mode.
  - `src/test/security.test.ts` (12 tests passed).
  - `src/test/integration-workflow.test.ts` (11 tests passed).

### 8.2 TypeScript Type Checking
Ran `npm run typecheck` (`tsc --noEmit`):
- **Result:** Exit code 0 (0 type errors).

### 8.3 ESLint
Ran `npm run lint` (`next lint`):
- **Result:** Exit code 0 (✔ No ESLint warnings or errors).

### 8.4 Live AWS Read-Only Verification in `ap-south-1`
Executed scratch verification against live AWS endpoints using active credentials:
- `sts:GetCallerIdentity`: **SUCCESS**
  - Account ID: `941905484053`
  - ARN: `arn:aws:iam::941905484053:user/autosoc-dev-operator`
- `config:DescribeComplianceByConfigRuleCommand`: **SUCCESS**
  - Active rules count: `1`
  - Rule: `restricted-ssh`
  - Compliance: `NON_COMPLIANT`
- `config:GetComplianceDetailsByConfigRuleCommand`: **ACCESS DENIED (Live Proof of Root Cause 4)**
  - Error: `AccessDeniedException: User: arn:aws:iam::941905484053:user/autosoc-dev-operator is not authorized to perform: config:GetComplianceDetailsByConfigRule on resource: restricted-ssh`

---

## 9. Step-by-Step Instructions to Verify Locally

1. **Update `.env.local` to enable AWS Config:**
   Open `.env.local` and set:
   ```env
   AUTOSOC_ENABLE_CONFIG=true
   ```
2. **Restart the Next.js development server:**
   In your terminal running `npm run dev`:
   - Press `Ctrl+C` to stop the dev server.
   - Run `npm run dev` to restart it with the updated environment variables.
3. **Verify AWS Integrations page (`http://localhost:3000/integrations`):**
   - Click **RE-VERIFY SERVER-SIDE INTEGRATIONS**.
   - AWS Config will illuminate green as **CONNECTED**.
   - Flag will display as **ENABLED**.
4. **Inspect Findings in Incidents page (`http://localhost:3000/incidents`):**
   - Under current IAM permissions (before adding `GetComplianceDetails`), AutoSOC's resilient fallback will display:
     `AWS Config: restricted-ssh Noncompliant (AccessRestricted)`
     noting that `config:GetComplianceDetailsByConfigRule` permission is required for resource-level enumeration.
5. **Inspect Command Center dashboard (`http://localhost:3000/dashboard`):**
   - "Ingested Telemetry Findings" counter will increment.
   - "Active Correlated Incidents" counter will increment to 1.
   - Severity distribution will reflect 1 or more High severity findings.

---

## 10. How to Verify the Two Noncompliant Resources

To display `sg-0cd9835b61ad1df1a` and `sg-0feadfb5292083aab` directly in AutoSOC:

1. In the **AWS IAM Console**, navigate to `Users` -> `autosoc-dev-operator` -> `Permissions`.
2. Edit the policy `AutoSOC-Operator-Policy` (or attached inline policy).
3. Under the `AutoSOCReadTelemetry` statement, add:
   ```json
   "config:GetComplianceDetailsByConfigRule"
   ```
4. Save the policy.
5. Refresh `http://localhost:3000/incidents`.
6. AutoSOC will automatically query `GetComplianceDetailsByConfigRule` for `restricted-ssh`, returning two individual findings:
   - Resource ID: `sg-0cd9835b61ad1df1a` | Type: `EC2::SecurityGroup` | Severity: `HIGH`
   - Resource ID: `sg-0feadfb5292083aab` | Type: `EC2::SecurityGroup` | Severity: `HIGH`

---

## 11. Troubleshooting Guide

If AWS Config integration shows `CONNECTED` on `/integrations` but `/incidents` shows 0 findings:

| Symptom | Cause | Resolution |
| :--- | :--- | :--- |
| `/incidents` table empty | Filter active in UI toolbar | In `/incidents`, check the "Source" and "Severity" dropdowns. Ensure "Source" is set to "All Sources" or "Config", and "Severity" is set to "All Severities". Click "Clear Filters". |
| Ingestion returns 0 rules | AWS Config rule evaluation delay | In AWS Config Console, check if `restricted-ssh` evaluation status is recent. You can click "Re-evaluate" on the rule in the console. |
| Integrations page still shows STANDBY | `.env.local` not reloaded | Stop Next.js server (`Ctrl+C`) and start again (`npm run dev`). Next.js caches `.env.local` at process startup. |
| Console log: `AccessDeniedException` | IAM policy missing permission | Verify policy attached to `autosoc-dev-operator` contains `config:DescribeComplianceByConfigRule` and `config:GetComplianceDetailsByConfigRule`. |
| Finding displays rule summary instead of SG IDs | Missing `GetComplianceDetails` permission | Add `config:GetComplianceDetailsByConfigRule` to IAM policy. AutoSOC will automatically transition from rule summary to resource-level findings. |

---

## 12. Cost, Security, and Operational Considerations

### Cost Impact:
- `DescribeComplianceByConfigRule` and `GetComplianceDetailsByConfigRule` calls are billed standard AWS Config API request pricing (~$0.003 per API request tier).
- AutoSOC's in-memory store and Next.js server-side caching avoid aggressive polling loops.

### Operational Safety & Guardrails:
- AutoSOC's AWS Config connector is **100% read-only**. It cannot modify security group ingress rules, alter network ACLs, or disrupt VPC traffic.
- Remediation playbooks remain strictly protected by `AUTOSOC_ENABLE_REMEDIATION=false`, two-analyst confirmation modals, and dry-run preview simulation.

### Defense-in-Depth:
- All sensitive credentials (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, session tokens) remain fully redacted from logs, audit records, and client responses via `sanitizeLogDetails()` in `src/lib/audit/logger.ts`.
- Zero credentials or account secrets are committed or written to source files.
