import {
  Inspector2Client,
  ListCoverageCommand,
} from "@aws-sdk/client-inspector2";
import { getEnv } from "@/lib/env";
import { getAWSCredentialsProvider } from "./credentials";

export async function checkInspectorHealth(): Promise<{
  connected: boolean;
  coveredResourcesCount?: number;
  errorMessage?: string;
}> {
  const env = getEnv();
  if (!env.AUTOSOC_ENABLE_INSPECTOR) {
    return {
      connected: false,
      errorMessage: "AUTOSOC_ENABLE_INSPECTOR flag is disabled in configuration.",
    };
  }

  try {
    const client = new Inspector2Client({
      region: env.AWS_REGION,
      credentials: getAWSCredentialsProvider(),
    });

    const response = await client.send(
      new ListCoverageCommand({ maxResults: 5 })
    );

    return {
      connected: true,
      coveredResourcesCount: response.coveredResources?.length || 0,
    };
  } catch (err: unknown) {
    const error = err as { name?: string; message?: string };
    return {
      connected: false,
      errorMessage: error.name
        ? `${error.name}: Amazon Inspector check failed. Verify inspector2:ListCoverage permission.`
        : "Amazon Inspector health check failed.",
    };
  }
}
