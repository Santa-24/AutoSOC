import { STSClient, GetCallerIdentityCommand } from "@aws-sdk/client-sts";
import { fromIni, fromEnv } from "@aws-sdk/credential-providers";
import { getEnv } from "@/lib/env";

export interface ResolvedAWSIdentity {
  connected: boolean;
  accountId?: string;
  arn?: string;
  userId?: string;
  authMethod: "IAM_ROLE_OR_SSO" | "AWS_PROFILE" | "ENV_ACCESS_KEYS" | "NONE";
  region: string;
  errorMessage?: string;
}

let cachedIdentityCheck: {
  result: ResolvedAWSIdentity;
  timestamp: number;
} | null = null;

const CACHE_TTL_MS = 30000; // Cache credentials check for 30s to avoid hammering STS

/**
 * Returns configured credentials provider according to precedence:
 * 1. Environment keys (if explicitly provided as local fallback)
 * 2. Named AWS CLI profile (e.g., from aws sso login / IAM Identity Center)
 * 3. Default AWS SDK credential provider chain (EC2/ECS IAM Instance Role, IRSA in EKS)
 */
export function getAWSCredentialsProvider() {
  const env = getEnv();

  // 1. Static keys override strictly for local testing fallback
  if (env.AWS_ACCESS_KEY_ID && env.AWS_SECRET_ACCESS_KEY) {
    return fromEnv();
  }

  // 2. Profile from AWS CLI or IAM Identity Center
  if (env.AWS_PROFILE) {
    try {
      return fromIni({ profile: env.AWS_PROFILE });
    } catch {
      // Fall through to default chain
    }
  }

  // 3. Default chain (IAM Role on EC2/ECS/EKS/Lambda)
  return undefined; // default client uses default credential provider chain
}

/**
 * Perform a real, server-side STS GetCallerIdentity verification.
 * NEVER fake success: returns connected: false if AWS is not reached or credentials are invalid.
 */
export async function verifyServerSideAWSIdentity(): Promise<ResolvedAWSIdentity> {
  const now = Date.now();
  if (cachedIdentityCheck && now - cachedIdentityCheck.timestamp < CACHE_TTL_MS) {
    return cachedIdentityCheck.result;
  }

  const env = getEnv();
  const region = env.AWS_REGION;

  let authMethod: ResolvedAWSIdentity["authMethod"] = "NONE";
  if (env.AWS_ACCESS_KEY_ID) {
    authMethod = "ENV_ACCESS_KEYS";
  } else if (env.AWS_PROFILE) {
    authMethod = "AWS_PROFILE";
  } else {
    authMethod = "IAM_ROLE_OR_SSO";
  }

  try {
    const credentials = getAWSCredentialsProvider();
    const stsClient = new STSClient({
      region,
      credentials: credentials ? credentials : undefined,
    });

    const command = new GetCallerIdentityCommand({});
    const response = await stsClient.send(command);

    const result: ResolvedAWSIdentity = {
      connected: true,
      accountId: response.Account,
      arn: response.Arn,
      userId: response.UserId,
      authMethod,
      region,
    };

    cachedIdentityCheck = { result, timestamp: now };
    return result;
  } catch (error: unknown) {
    const err = error as { name?: string; message?: string };
    const safeError = err.name
      ? `${err.name}: AWS credential provider could not authenticate. Verify AWS_PROFILE or IAM Role.`
      : "No valid AWS credentials found in environment or local AWS profile.";

    const result: ResolvedAWSIdentity = {
      connected: false,
      authMethod,
      region,
      errorMessage: safeError,
    };

    cachedIdentityCheck = { result, timestamp: now };
    return result;
  }
}
