import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AutoSOC — Autonomous Cloud Security Operations Center",
  description:
    "Production-grade, AI-powered autonomous cloud security operations center for AWS. Real-time telemetry correlation, Bedrock-assisted triage, and human-authorized remediation playbooks.",
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' fill='%23141613'/><rect x='20' y='20' width='60' height='60' fill='%23C7F36B'/><text x='50' y='62' font-family='monospace' font-weight='bold' font-size='38' fill='%23141613' text-anchor='middle'>AS</text></svg>",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-charcoal-900 text-ivory-100 min-h-screen flex flex-col antialiased selection:bg-lime-500 selection:text-charcoal-950">
        {children}
      </body>
    </html>
  );
}
