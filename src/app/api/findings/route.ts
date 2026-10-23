import { NextResponse } from "next/server";
import { getAllSecurityFindings, isDemoModeActive } from "@/lib/store/soc-store";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const findings = await getAllSecurityFindings();
    return NextResponse.json(
      {
        findings,
        count: findings.length,
        isDemoMode: isDemoModeActive(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[AutoSOC API] Findings fetch failed:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch security findings",
        findings: [],
        isDemoMode: false,
      },
      { status: 500 }
    );
  }
}
