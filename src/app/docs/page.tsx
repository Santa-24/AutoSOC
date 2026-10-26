import React from "react";
import Link from "next/link";
import { PublicNav } from "@/components/layout/public-nav";
import { PublicFooter } from "@/components/layout/public-footer";
import { BookOpen, Terminal, Key, Shield, ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-charcoal-900 text-ivory-100 flex flex-col font-mono selection:bg-lime-500 selection:text-charcoal-950">
      <PublicNav />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
        <div className="space-y-4 border-b border-charcoal-700 pb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-charcoal-850 border border-charcoal-700 text-xs text-lime-400">
            <BookOpen className="w-3.5 h-3.5" />
            <span>OPERATIONAL MANUAL & SETUP GUIDE</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-ivory-100">
            AutoSOC Documentation
          </h1>
          <p className="text-sm text-ivory-300 leading-relaxed max-w-3xl">
            Complete guide for configuring local development, connecting AWS security services, establishing IAM least-privilege roles, and validating health status.
          </p>
        </div>

        {/* Quickstart 3-Step */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold uppercase text-ivory-100 flex items-center gap-2">
            <Terminal className="w-5 h-5 text-lime-400" />
            1. Local Development Quickstart
          </h2>
          <div className="bg-charcoal-950 border border-charcoal-700 p-6 space-y-4 text-xs">
            <p className="text-ivory-300">
              AutoSOC connects directly to your live AWS environment using IAM operator credentials.
            </p>
            <pre className="p-4 bg-charcoal-900 border border-charcoal-800 text-lime-400 overflow-x-auto">
{`# 1. Clone repository & install dependencies
git clone <repository-url>
cd AutoSOC
npm install

# 2. Copy environment example
cp .env.example .env

# 3. Launch development server
npm run dev
# Console will be available at: http://localhost:3000`}
            </pre>
          </div>
        </section>

        {/* Authentication Methods */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold uppercase text-ivory-100 flex items-center gap-2">
            <Key className="w-5 h-5 text-lime-400" />
            2. Recommended AWS Authentication Methods
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-5 bg-charcoal-850 border border-charcoal-700 space-y-2">
              <span className="text-lime-400 font-bold block uppercase">
                Method A: AWS CLI Profile / IAM Identity Center (Recommended for Local Dev)
              </span>
              <p className="text-ivory-300">
                Configure your AWS CLI using AWS IAM Identity Center (formerly AWS SSO):
              </p>
              <pre className="p-2.5 bg-charcoal-950 border border-charcoal-800 text-ivory-200">
{`aws configure sso
# Select your AWS Account & Role
export AWS_PROFILE=default`}
              </pre>
              <p className="text-ivory-400 text-[11px]">
                AutoSOC automatically reads your active SSO profile without requiring long-lived static access keys.
              </p>
            </div>

            <div className="p-5 bg-charcoal-850 border border-charcoal-700 space-y-2">
              <span className="text-lime-400 font-bold block uppercase">
                Method B: IAM Instance Role / ECS Task Role (Recommended for Production)
              </span>
              <p className="text-ivory-300">
                When deployed to Amazon EC2, Amazon ECS, or EKS:
              </p>
              <pre className="p-2.5 bg-charcoal-950 border border-charcoal-800 text-ivory-200">
{`# Leave AWS_ACCESS_KEY_ID blank in production
# AutoSOC utilizes the default AWS SDK credential provider chain.`}
              </pre>
              <p className="text-ivory-400 text-[11px]">
                EC2 instance metadata service (IMDSv2) or ECS task role provides short-lived rotating credentials automatically.
              </p>
            </div>
          </div>
        </section>

        {/* Least Privilege IAM Policy */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold uppercase text-ivory-100 flex items-center gap-2">
            <Shield className="w-5 h-5 text-lime-400" />
            3. Least-Privilege IAM Policy Reference
          </h2>
          <div className="bg-charcoal-950 border border-charcoal-700 p-6 space-y-4 text-xs">
            <p className="text-ivory-300">
              Attach this policy to your AutoSOC read-only ingestion role. It strictly enforces least privilege:
            </p>
            <pre className="p-4 bg-charcoal-900 border border-charcoal-800 text-ivory-200 overflow-x-auto text-[11px]">
{`{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AutoSOCReadTelemetry",
      "Effect": "Allow",
      "Action": [
        "sts:GetCallerIdentity",
        "securityhub:DescribeHub",
        "securityhub:GetFindings",
        "guardduty:ListDetectors",
        "guardduty:GetFindings",
        "cloudtrail:DescribeTrails",
        "cloudtrail:LookupEvents",
        "config:DescribeComplianceByConfigRule",
        "config:GetComplianceDetailsByConfigRule",
        "inspector2:ListCoverage",
        "inspector2:ListFindings"
      ],
      "Resource": "*"
    },
    {
      "Sid": "AutoSOCBedrockAssistance",
      "Effect": "Allow",
      "Action": [
        "bedrock:InvokeModel"
      ],
      "Resource": "arn:aws:bedrock:*:*:foundation-model/anthropic.claude-3-sonnet-*"
    }
  ]
}`}
            </pre>
          </div>
        </section>

        <div className="pt-4 flex items-center justify-between border-t border-charcoal-700">
          <Link href="/security">
            <Button variant="secondary" size="md">
              ← Security Model & Threat Principles
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button size="md" className="gap-2">
              <span>Launch Command Center</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
