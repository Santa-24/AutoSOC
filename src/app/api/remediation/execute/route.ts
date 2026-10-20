import { NextResponse } from "next/server";
import { executeApprovedResponseAction } from "@/lib/aws/remediation";
import { requirePermission } from "@/lib/auth/session";
import { PlaybookId } from "@/types/security";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    // 1. Server-side permission check: must have canApproveRemediation
    const user = await requirePermission("canApproveRemediation");

    const body = await request.json();
    const incidentId = (body.incidentId as string) || "INC-MANUAL-ACTION";
    const playbookId = body.playbookId as PlaybookId;
    const targetResource = body.targetResource as string;
    const confirmedApproval = Boolean(body.confirmedApproval);

    if (!playbookId || !targetResource) {
      return NextResponse.json(
        { error: "Both playbookId and targetResource are required." },
        { status: 400 }
      );
    }

    if (!confirmedApproval) {
      return NextResponse.json(
        { error: "Confirmation gate failed: explicit analyst confirmation checkbox is required." },
        { status: 400 }
      );
    }

    const action = await executeApprovedResponseAction({
      incidentId,
      playbookId,
      targetResource,
      actor: user.name,
      role: user.role,
      confirmedApproval,
    });

    return NextResponse.json(action);
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json(
      { error: err.message || "Failed to execute response action." },
      { status: 403 }
    );
  }
}
