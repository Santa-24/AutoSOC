"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Shield, Lock, UserCheck, AlertCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PRESET_ANALYSTS } from "@/lib/auth/presets";
import { AnalystRole } from "@/types/security";

export default function LoginPage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<AnalystRole>("secops_admin");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleRoleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: selectedRole }),
      });

      if (!res.ok) {
        throw new Error("Failed to authenticate analyst session.");
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err: unknown) {
      const error = err as Error;
      setErrorMessage(error.message || "Authentication error.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-charcoal-900 text-ivory-100 flex flex-col items-center justify-center p-4 font-mono select-none bg-grid-cyber">
      <div className="w-full max-w-md bg-charcoal-950 border-2 border-charcoal-700 p-6 sm:p-8 space-y-6 shadow-2xl relative">
        {/* Header */}
        <div className="space-y-2 border-b border-charcoal-700 pb-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-lime-500 text-charcoal-950 font-bold text-xs flex items-center justify-center">
              AS
            </div>
            <span className="font-bold text-sm tracking-tight text-ivory-100 uppercase">
              AutoSOC Console Access
            </span>
          </div>
          <p className="text-xs text-ivory-400">
            Sign in with Amazon Cognito or select an authorized analyst profile for local session authorization.
          </p>
        </div>

        {errorMessage && (
          <div className="p-3 bg-[#3D1414] border border-[#6E2222] text-[#FF8585] text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Local Analyst Role Selector */}
        <form onSubmit={handleRoleLogin} className="space-y-4">
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-ivory-300 uppercase tracking-wider block">
              Select Authorized Analyst Role
            </label>

            <div className="space-y-2">
              {Object.entries(PRESET_ANALYSTS).map(([roleKey, user]) => {
                const isSelected = selectedRole === roleKey;
                return (
                  <div
                    key={roleKey}
                    onClick={() => setSelectedRole(roleKey as AnalystRole)}
                    className={`p-3 border cursor-pointer transition-colors ${
                      isSelected
                        ? "bg-lime-950/60 border-lime-500 text-ivory-100"
                        : "bg-charcoal-900 border-charcoal-800 text-ivory-400 hover:border-charcoal-700"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-ivory-200">
                        {user.name}
                      </span>
                      {isSelected && (
                        <span className="w-2 h-2 rounded-full bg-lime-400" />
                      )}
                    </div>
                    <div className="text-[10px] text-ivory-500 mt-0.5">
                      {user.email}
                    </div>
                    <div className="text-[10px] text-lime-400 mt-1 uppercase">
                      Permissions: {user.permissions.canApproveRemediation ? "Remediation Approved" : "Read-Only / Triage"}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <Button
            type="submit"
            isLoading={isLoading}
            size="lg"
            className="w-full gap-2 mt-4"
          >
            <UserCheck className="w-4 h-4" />
            <span>ESTABLISH SEC-OPS SESSION</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </form>

        {/* Enterprise Cognito Notice */}
        <div className="p-3 bg-charcoal-900 border border-charcoal-800 text-[10px] text-ivory-400 leading-relaxed space-y-1">
          <span className="text-ivory-300 font-bold block uppercase flex items-center gap-1.5">
            <Lock className="w-3 h-3 text-lime-400" />
            Amazon Cognito Hosted UI Integration
          </span>
          <p>
            In production deployments with COGNITO_USER_POOL_ID configured, incoming authentication redirects through your corporate IdP (Okta, Azure AD, or AWS IAM Identity Center).
          </p>
        </div>

        <div className="text-center pt-2">
          <Link
            href="/"
            className="text-[11px] text-ivory-500 hover:text-ivory-300 underline"
          >
            ← Return to Landing Page
          </Link>
        </div>
      </div>
    </div>
  );
}
