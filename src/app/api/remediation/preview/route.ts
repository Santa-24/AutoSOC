import { NextResponse } from "next/server";
import { generateDryRunPreview } from "@/lib/aws/remediation";
import { requireAuth } from "@/lib/auth/session";
import { PlaybookId } from "@/types/security";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const user = await requireAuth();
    if (!user.permissions.canExecuteDryRun) {
      return NextResponse.json(
        { error: `Analyst role ${user.role} lacks dry-run simulation permissions.` },
        { status: 403 }
      );
    }

    const body = await request.json();
    const playbookId = body.playbookId as PlaybookId;
    const targetResource = body.targetResource as string;

    if (!playbookId || !targetResource) {
      return NextResponse.json(
        { error: "Both playbookId and targetResource are required." },
        { status: 400 }
      );
    }

    const preview = await generateDryRunPreview(playbookId, targetResource);
    return NextResponse.json(preview);
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json(
      { error: err.message || "Failed to generate dry run preview." },
      { status: 500 }
    );
  }
}
