import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  APP_BASE_URL: z.string().url().default("http://localhost:3000"),
  
  // AWS Configuration
  AWS_REGION: z.string().min(1).default("ap-south-1"),
  AWS_PROFILE: z.string().optional().default("default"),
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  AWS_SESSION_TOKEN: z.string().optional(),

  // AutoSOC Feature Flags
  AUTOSOC_DEMO_MODE: z
    .string()
    .transform((val) => val === "true" || val === "1")
    .default("false"),
  AUTOSOC_ENABLE_SECURITY_HUB: z
    .string()
    .transform((val) => val === "true" || val === "1")
    .default("false"),
  AUTOSOC_ENABLE_GUARDDUTY: z
    .string()
    .transform((val) => val === "true" || val === "1")
    .default("false"),
  AUTOSOC_ENABLE_CLOUDTRAIL: z
    .string()
    .transform((val) => val === "true" || val === "1")
    .default("false"),
  AUTOSOC_ENABLE_CONFIG: z
    .string()
    .transform((val) => val === "true" || val === "1")
    .default("false"),
  AUTOSOC_ENABLE_INSPECTOR: z
    .string()
    .transform((val) => val === "true" || val === "1")
    .default("false"),
  AUTOSOC_ENABLE_BEDROCK: z
    .string()
    .transform((val) => val === "true" || val === "1")
    .default("false"),
  AUTOSOC_ENABLE_REMEDIATION: z
    .string()
    .transform((val) => val === "true" || val === "1")
    .default("false"),

  // Storage and AI parameters
  AUTOSOC_DYNAMODB_TABLE: z.string().optional().default("AutoSOC_Incidents"),
  AUTOSOC_AUDIT_BUCKET: z.string().optional().default("autosoc-security-audit-records"),
  AUTOSOC_KMS_KEY_ID: z.string().optional(),
  AUTOSOC_BEDROCK_MODEL_ID: z
    .string()
    .default("anthropic.claude-3-sonnet-20240229-v1:0"),

  // Cognito Authentication Boundary
  COGNITO_USER_POOL_ID: z.string().optional(),
  COGNITO_CLIENT_ID: z.string().optional(),
  COGNITO_ISSUER_URL: z.string().optional(),

  // Session Secret
  NEXTAUTH_SECRET: z.string().min(16).default("autosoc-dev-secops-session-secret-9941"),
});

export type Env = z.infer<typeof envSchema>;

let cachedEnv: Env | null = null;

export function getEnv(): Env {
  if (process.env.NODE_ENV === "production" && cachedEnv) return cachedEnv;

  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    // Redact any values from error output to prevent credential leaking
    const issues = parsed.error.issues.map((issue) => ({
      path: issue.path.join("."),
      message: issue.message,
    }));
    console.warn("[AutoSOC Security] Non-fatal environment validation warning:", JSON.stringify(issues));
    // Fall back to safe development defaults
    cachedEnv = envSchema.parse({
      NODE_ENV: process.env.NODE_ENV || "development",
      AUTOSOC_DEMO_MODE: "false",
      AWS_REGION: process.env.AWS_REGION || "ap-south-1",
    });
    return cachedEnv;
  }

  cachedEnv = parsed.data;
  return cachedEnv;
}

/**
 * Returns safe environment overview without leaking any credentials
 */
export function getSafeConfigSummary() {
  const env = getEnv();
  return {
    nodeEnv: env.NODE_ENV,
    region: env.AWS_REGION,
    authMethod: env.AWS_ACCESS_KEY_ID ? "STATIC_KEYS_OVERRIDE (Local Fallback)" : "IAM_ROLE_OR_AWS_PROFILE (Preferred)",
    demoModeActive: env.AUTOSOC_DEMO_MODE,
    servicesConfigured: {
      securityHub: env.AUTOSOC_ENABLE_SECURITY_HUB,
      guardDuty: env.AUTOSOC_ENABLE_GUARDDUTY,
      cloudTrail: env.AUTOSOC_ENABLE_CLOUDTRAIL,
      config: env.AUTOSOC_ENABLE_CONFIG,
      inspector: env.AUTOSOC_ENABLE_INSPECTOR,
      bedrockAI: env.AUTOSOC_ENABLE_BEDROCK,
      remediationExecution: env.AUTOSOC_ENABLE_REMEDIATION,
    },
    cognitoConfigured: Boolean(env.COGNITO_USER_POOL_ID && env.COGNITO_CLIENT_ID),
  };
}
