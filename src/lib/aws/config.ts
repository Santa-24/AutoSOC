import {
  ConfigServiceClient,
  DescribeComplianceByConfigRuleCommand,
} from "@aws-sdk/client-config-service";
import { getEnv } from "@/lib/env";
import { getAWSCredentialsProvider } from "./credentials";

export async function checkConfigHealth(): Promise<{
  connected: boolean;
  activeRulesCount?: number;
  errorMessage?: string;
}> {
  const env = getEnv();
  if (!env.AUTOSOC_ENABLE_CONFIG) {
    return {
      connected: false,
      errorMessage: "AUTOSOC_ENABLE_CONFIG flag is disabled in configuration.",
    };
  }

  try {
    const client = new ConfigServiceClient({
      region: env.AWS_REGION,
      credentials: getAWSCredentialsProvider(),
    });

    const response = await client.send(
      new DescribeComplianceByConfigRuleCommand({})
    );

    return {
      connected: true,
      activeRulesCount: response.ComplianceByConfigRules?.length || 0,
    };
  } catch (err: unknown) {
    const error = err as { name?: string; message?: string };
    return {
      connected: false,
      errorMessage: error.name
        ? `${error.name}: AWS Config check failed. Verify config:DescribeComplianceByConfigRule permission.`
        : "AWS Config health check failed.",
    };
  }
}
