import { NextResponse } from "next/server";
import { getAggregatedHealthStatus } from "@/lib/aws/health";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const report = await getAggregatedHealthStatus();
    return NextResponse.json(report, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        status: "ERROR",
        message: "Failed to generate system health status",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
