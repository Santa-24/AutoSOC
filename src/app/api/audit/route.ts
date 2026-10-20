import { NextResponse } from "next/server";
import { getAuditEvents } from "@/lib/audit/logger";
import { requireAuth } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    await requireAuth();

    const { searchParams } = new URL(request.url);
    const actor = searchParams.get("actor") || undefined;
    const action = searchParams.get("action") || undefined;
    const outcome = searchParams.get("outcome") || undefined;
    const format = searchParams.get("format");

    const events = getAuditEvents({ actor, action, outcome });

    if (format === "csv") {
      const headers = ["ID", "Timestamp", "Actor", "Role", "Action", "Target", "Outcome", "CorrelationID"];
      const rows = events.map((e) => [
        e.id,
        e.timestamp,
        `"${e.actor}"`,
        `"${e.role}"`,
        `"${e.action}"`,
        `"${e.target}"`,
        e.outcome,
        e.correlationId,
      ]);
      const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

      return new NextResponse(csvContent, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="autosoc-audit-log-${new Date().toISOString().slice(0, 10)}.csv"`,
        },
      });
    }

    return NextResponse.json({ events });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json(
      { error: err.message || "Failed to retrieve audit log" },
      { status: 500 }
    );
  }
}
