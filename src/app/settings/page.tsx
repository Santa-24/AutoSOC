"use client";

import React, { useState } from "react";
import {
  Sliders,
  User,
  Shield,
  Bell,
  Lock,
  CheckCircle2,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { ConsoleNav } from "@/components/layout/console-nav";
import { ConsoleSidebar } from "@/components/layout/console-sidebar";
import { DemoBanner } from "@/components/ui/demo-banner";
import { Button } from "@/components/ui/button";

export default function SettingsPage() {
  const [demoMode, setDemoMode] = useState(false);
  const [slackNotifications, setSlackNotifications] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState("30");
  const [isSaved, setIsSaved] = useState(false);

  React.useEffect(() => {
    fetch("/api/health")
      .then((res) => res.json())
      .then((data) => {
        if (data?.demoModeActive !== undefined) {
          setDemoMode(data.demoModeActive);
        }
      })
      .catch(() => {});
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="min-h-screen bg-charcoal-900 text-ivory-100 flex flex-col font-mono selection:bg-lime-500 selection:text-charcoal-950">
      <DemoBanner isDemoMode={demoMode} onToggleDemoMode={(val) => setDemoMode(val)} />
      <ConsoleNav user={null} />

      <div className="flex-1 flex overflow-hidden">
        <ConsoleSidebar />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-charcoal-700 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-lime-400" />
                <h1 className="text-xl sm:text-2xl font-black uppercase text-ivory-100">
                  SecOps Preferences & Feature Flags
                </h1>
              </div>
              <p className="text-xs text-ivory-400 mt-0.5">
                Configure operational parameters, notification channels, and session security settings
              </p>
            </div>

            {isSaved && (
              <span className="flex items-center gap-1.5 px-3 py-1 bg-lime-950 text-lime-400 border border-lime-800 text-xs font-bold animate-in fade-in">
                <CheckCircle2 className="w-4 h-4" />
                PREFERENCES UPDATED
              </span>
            )}
          </div>

          <form onSubmit={handleSave} className="max-w-4xl space-y-6 text-xs">
            {/* Operational Mode Card */}
            <div className="bg-charcoal-850 border border-charcoal-700 p-5 space-y-4">
              <div className="border-b border-charcoal-750 pb-2">
                <h2 className="font-bold text-ivory-100 uppercase text-sm">
                  1. Operational Mode Configuration
                </h2>
                <p className="text-[11px] text-ivory-400 mt-0.5">
                  Toggle between isolated synthetic demonstration data and live AWS SDK stream
                </p>
              </div>

              <div className="flex items-center justify-between p-3 bg-charcoal-900 border border-charcoal-750">
                <div>
                  <span className="font-bold text-ivory-200 block text-xs">
                    Synthetic Demo Data Mode (AUTOSOC_DEMO_MODE)
                  </span>
                  <p className="text-[11px] text-ivory-400 mt-0.5">
                    When enabled, AutoSOC displays pre-loaded multi-stage attack scenarios without requiring live AWS credentials.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setDemoMode(!demoMode)}
                  className="flex items-center gap-1.5 px-3 py-1 bg-charcoal-800 border border-charcoal-700 text-xs"
                >
                  {demoMode ? (
                    <ToggleRight className="w-5 h-5 text-lime-400" />
                  ) : (
                    <ToggleLeft className="w-5 h-5 text-ivory-500" />
                  )}
                  <span className="text-[11px] text-ivory-200">
                    {demoMode ? "ACTIVE (DEMO)" : "LIVE AWS ONLY"}
                  </span>
                </button>
              </div>
            </div>

            {/* Notification Preferences */}
            <div className="bg-charcoal-850 border border-charcoal-700 p-5 space-y-4">
              <div className="border-b border-charcoal-750 pb-2">
                <h2 className="font-bold text-ivory-100 uppercase text-sm">
                  2. Incident Alerts & Escalation Channels
                </h2>
                <p className="text-[11px] text-ivory-400 mt-0.5">
                  Route Critical and High severity findings to SecOps paging services
                </p>
              </div>

              <div className="space-y-3">
                <label className="flex items-center justify-between p-3 bg-charcoal-900 border border-charcoal-750 cursor-pointer">
                  <div>
                    <span className="font-bold text-ivory-200 block text-xs">
                      Slack / Amazon SNS Incident Dispatch
                    </span>
                    <span className="text-[11px] text-ivory-400">
                      Notify #secops-alerts channel when a Critical finding correlates with an active incident.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={slackNotifications}
                    onChange={(e) => setSlackNotifications(e.target.checked)}
                    className="h-4 w-4 accent-lime-500 bg-charcoal-950 border-charcoal-700"
                  />
                </label>

                <label className="flex items-center justify-between p-3 bg-charcoal-900 border border-charcoal-750 cursor-pointer">
                  <div>
                    <span className="font-bold text-ivory-200 block text-xs">
                      Emergency Email Escalation
                    </span>
                    <span className="text-[11px] text-ivory-400">
                      Send urgent pager alerts to the active duty SecOps Principal.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={emailAlerts}
                    onChange={(e) => setEmailAlerts(e.target.checked)}
                    className="h-4 w-4 accent-lime-500 bg-charcoal-950 border-charcoal-700"
                  />
                </label>
              </div>
            </div>

            {/* Session Security */}
            <div className="bg-charcoal-850 border border-charcoal-700 p-5 space-y-4">
              <div className="border-b border-charcoal-750 pb-2">
                <h2 className="font-bold text-ivory-100 uppercase text-sm">
                  3. Session Security & Idle Timeout
                </h2>
                <p className="text-[11px] text-ivory-400 mt-0.5">
                  Enforce automatic session revocation to protect console terminals in shared workspaces
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] text-ivory-300 block mb-1">
                    Automatic Idle Lockout (Minutes):
                  </label>
                  <select
                    value={sessionTimeout}
                    onChange={(e) => setSessionTimeout(e.target.value)}
                    className="w-full bg-charcoal-900 border border-charcoal-700 px-3 py-2 text-xs text-ivory-100 focus:outline-none focus:border-lime-500"
                  >
                    <option value="15">15 Minutes (Strict)</option>
                    <option value="30">30 Minutes (Recommended)</option>
                    <option value="60">60 Minutes</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] text-ivory-300 block mb-1">
                    Session Cookie Security:
                  </label>
                  <div className="p-2 bg-charcoal-900 border border-charcoal-750 text-[10px] text-lime-400">
                    HttpOnly: true | SameSite: Lax | Secure: SSL Enforced
                  </div>
                </div>
              </div>
            </div>

            <Button type="submit" size="md" className="gap-2">
              <Sliders className="w-4 h-4" />
              <span>SAVE CONFIGURATION CHANGES</span>
            </Button>
          </form>
        </main>
      </div>
    </div>
  );
}
