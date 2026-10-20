import React from "react";
import { getSessionUser } from "@/lib/auth/session";
import { isDemoModeActive } from "@/lib/store/soc-store";
import { verifyServerSideAWSIdentity } from "@/lib/aws/credentials";
import { ConsoleNav } from "@/components/layout/console-nav";
import { ConsoleSidebar } from "@/components/layout/console-sidebar";
import { DemoBanner } from "@/components/ui/demo-banner";

interface ConsoleShellProps {
  children: React.ReactNode;
}

export async function ConsoleShell({ children }: ConsoleShellProps) {
  const user = await getSessionUser();
  const demoActive = isDemoModeActive();
  const awsIdentity = await verifyServerSideAWSIdentity();

  return (
    <div className="min-h-screen bg-charcoal-900 text-ivory-100 flex flex-col font-mono selection:bg-lime-500 selection:text-charcoal-950">
      {/* Top Demo/Status Banner */}
      <DemoBanner
        isDemoMode={demoActive}
        awsConnected={awsIdentity.connected}
      />

      {/* Top Console Navigation Bar */}
      <ConsoleNav user={user} />

      {/* Main Workspace with Sidebar */}
      <div className="flex-1 flex overflow-hidden">
        <ConsoleSidebar />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
}
