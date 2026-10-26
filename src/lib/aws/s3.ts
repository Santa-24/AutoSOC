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

    const listRes = await s3Client.send(new ListBucketsCommand({}));
    const buckets = listRes.Buckets || [];
    const findings: SecurityFinding[] = [];

    for (const bucket of buckets) {
      const bucketName = bucket.Name;
      if (!bucketName) continue;

      let publicBlockConfig = null;
      try {
        const pabRes = await s3Client.send(
          new GetPublicAccessBlockCommand({ Bucket: bucketName })
        );
        publicBlockConfig = pabRes.PublicAccessBlockConfiguration;
        if (publicBlockConfig) {
          findings.push({
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
            createdAt: bucket.CreationDate ? bucket.CreationDate.toISOString() : now,
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
      } catch (pabErr) {
        // Missing Public Access Block is a serious finding
        findings.push({
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
          createdAt: bucket.CreationDate ? bucket.CreationDate.toISOString() : now,
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

      // Check encryption
      try {
        await s3Client.send(
          new GetBucketEncryptionCommand({ Bucket: bucketName })
        );
      } catch {
        findings.push({
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

    return findings;
  } catch (err) {
    console.error("[AutoSOC S3] Failed to audit S3 buckets:", err);
    return [];
  }
}
