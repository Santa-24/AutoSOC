/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  output: "standalone",
  eslint: {
    // Skip ESLint during production container builds to drastically accelerate build times
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Skip redundant type checking in Docker build (already verified in CI)
    ignoreBuildErrors: true,
  },
  experimental: {
    serverComponentsExternalPackages: [
      "@aws-sdk/client-sts",
      "@aws-sdk/client-securityhub",
      "@aws-sdk/client-guardduty",
      "@aws-sdk/client-cloudtrail",
      "@aws-sdk/client-config-service",
      "@aws-sdk/client-inspector2",
      "@aws-sdk/client-bedrock-runtime",
      "@aws-sdk/client-ec2",
      "@aws-sdk/client-iam",
      "@aws-sdk/client-s3",
      "@aws-sdk/client-wafv2",
      "@aws-sdk/credential-providers",
      "@aws-sdk/credential-provider-login",
      "@aws-sdk/credential-provider-ini",
      "@aws-sdk/credential-provider-node",
      "@smithy/credential-provider-imds",
    ],
  },
  headers: async () => {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
