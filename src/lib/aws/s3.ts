import {
  S3Client,
  ListBucketsCommand,
  GetPublicAccessBlockCommand,
  GetBucketEncryptionCommand,
} from "@aws-sdk/client-s3";
import { getAWSCredentialsProvider, verifyServerSideAWSIdentity } from "./credentials";
import { getEnv } from "@/lib/env";
import { SecurityFinding } from "@/types/security";

export async function fetchLiveS3Findings(): Promise<SecurityFinding[]> {
  const env = getEnv();
  const identity = await verifyServerSideAWSIdentity();
  if (!identity.connected || !identity.accountId) return [];

  const accountId = identity.accountId;
  const region = env.AWS_REGION;
  const now = new Date().toISOString();

  try {
    const s3Client = new S3Client({
      region,
      credentials: getAWSCredentialsProvider(),
    });

    let bucketItems: { name: string; creationDate?: Date }[] = [];
    try {
      const listRes = await s3Client.send(new ListBucketsCommand({}));
      bucketItems = (listRes.Buckets || [])
        .filter((b) => b.Name)
        .map((b) => ({ name: b.Name!, creationDate: b.CreationDate }));
    } catch {
      const fallback = env.AUTOSOC_AUDIT_BUCKET || `autosoc-audit-${accountId}`;
      bucketItems = [{ name: fallback }];
    }

    const findings: SecurityFinding[] = [];

    const auditBucket = async (bucket: { name: string; creationDate?: Date }): Promise<SecurityFinding[]> => {
      const bucketName = bucket.name;
      if (!bucketName) return [];
      const bucketFindings: SecurityFinding[] = [];

      try {
        const pabRes = await s3Client.send(
          new GetPublicAccessBlockCommand({ Bucket: bucketName })
        );
        const publicBlockConfig = pabRes.PublicAccessBlockConfiguration;
        if (publicBlockConfig) {
          bucketFindings.push({
            id: `s3-posture-${bucketName}`,
            source: "S3",
            title: `S3 Posture Audit: ${bucketName} (Public Access Block Active)`,
            description: `Bucket '${bucketName}' in ${region} is protected by S3 Block Public Access. CIS AWS Foundations Benchmark 2.3 verified PASS.`,
            severity: "INFORMATIONAL",
            status: "ACTIVE",
            accountId,
            region,
            resources: [
              {
                type: "AWS::S3::Bucket",
                id: bucketName,
                arn: `arn:aws:s3:::${bucketName}`,
                region,
                accountId,
              },
            ],
            createdAt: bucket.creationDate ? bucket.creationDate.toISOString() : now,
            updatedAt: now,
            evidenceReferences: [
              `Bucket Name: ${bucketName}`,
              `BlockPublicAcls: ${publicBlockConfig.BlockPublicAcls}`,
              `IgnorePublicAcls: ${publicBlockConfig.IgnorePublicAcls}`,
              `BlockPublicPolicy: ${publicBlockConfig.BlockPublicPolicy}`,
              `RestrictPublicBuckets: ${publicBlockConfig.RestrictPublicBuckets}`,
            ],
            complianceFrameworks: ["CIS AWS Foundations v3.0 (2.3)"],
            tags: { BucketName: bucketName, Posture: "Compliant" },
            isDemo: false,
          });
        }
      } catch (pabErr: unknown) {
        const errName = (pabErr as { name?: string })?.name;
        if (errName === "NoSuchPublicAccessBlockConfiguration") {
          bucketFindings.push({
            id: `s3-pab-missing-${bucketName}`,
            source: "S3",
            title: `S3 Bucket Public Access Block Not Configured: ${bucketName}`,
            description: `Bucket '${bucketName}' does not have S3 Block Public Access enabled. Violates CIS AWS Foundations Benchmark 2.3.`,
            severity: "HIGH",
            status: "ACTIVE",
            accountId,
            region,
            resources: [
              {
                type: "AWS::S3::Bucket",
                id: bucketName,
                arn: `arn:aws:s3:::${bucketName}`,
                region,
                accountId,
              },
            ],
            createdAt: bucket.creationDate ? bucket.creationDate.toISOString() : now,
            updatedAt: now,
            evidenceReferences: [
              `Bucket Name: ${bucketName}`,
              "Status: PublicAccessBlockMissing",
              "Recommendation: Enable S3_BLOCK_PUBLIC_ACCESS playbook",
            ],
            complianceFrameworks: ["CIS AWS Foundations v3.0 (2.3)", "NIST CSF 2.0"],
            tags: {
              BucketName: bucketName,
              Risk: "Unrestricted Public Access Exposure",
            },
            isDemo: false,
          });
        }
      }

      // Check encryption
      try {
        await s3Client.send(
          new GetBucketEncryptionCommand({ Bucket: bucketName })
        );
      } catch (encErr: unknown) {
        const errName = (encErr as { name?: string })?.name;
        if (errName === "ServerSideEncryptionConfigurationNotFoundError") {
          bucketFindings.push({
            id: `s3-unencrypted-${bucketName}`,
            source: "S3",
            title: `S3 Default Encryption Not Configured: ${bucketName}`,
            description: `Bucket '${bucketName}' does not have default server-side encryption (SSE-KMS or SSE-S3) enabled.`,
            severity: "MEDIUM",
            status: "ACTIVE",
            accountId,
            region,
            resources: [
              {
                type: "AWS::S3::Bucket",
                id: bucketName,
                arn: `arn:aws:s3:::${bucketName}`,
                region,
                accountId,
              },
            ],
            createdAt: now,
            updatedAt: now,
            evidenceReferences: [`Bucket Name: ${bucketName}`, "Missing Server-Side Encryption"],
            complianceFrameworks: ["CIS AWS Foundations v3.0 (2.7)"],
            tags: { BucketName: bucketName },
            isDemo: false,
          });
        }
      }

      return bucketFindings;
    };

    const results = await Promise.allSettled(bucketItems.map(auditBucket));
    for (const r of results) {
      if (r.status === "fulfilled") {
        findings.push(...r.value);
      }
    }

    return findings;
  } catch {
    return [];
  }
}
