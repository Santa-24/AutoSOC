import { NextResponse } from "next/server";
import { getAllIncidents, isDemoModeActive } from "@/lib/store/soc-store";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const incidents = await getAllIncidents();
    const activeIncidents = incidents.filter(
      (i) => i.status !== "CONTAINED" && i.status !== "CLOSED"
    );
    return NextResponse.json(
      {
        incidents,
        count: activeIncidents.length,
        isDemoMode: isDemoModeActive(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[AutoSOC API] Incidents fetch failed:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch incidents",
        incidents: [],
        isDemoMode: false,
      },
      { status: 500 }
    );
  }
}
