import { NextResponse } from "next/server";
import { executeAIInvestigation } from "@/lib/aws/bedrock";
import { requirePermission } from "@/lib/auth/session";
import { AIInvestigationRequest } from "@/types/security";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    await requirePermission("canTriggerAI");

    const body = (await request.json()) as AIInvestigationRequest;
    if (!body.findingContext || !Array.isArray(body.findingContext)) {
      return NextResponse.json(
        { error: "Valid findingContext array is required." },
        { status: 400 }
      );
    }

    const result = await executeAIInvestigation(body);
    return NextResponse.json(result);
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json(
      { error: err.message || "AI Investigation execution failed." },
      { status: 500 }
    );
  }
}
