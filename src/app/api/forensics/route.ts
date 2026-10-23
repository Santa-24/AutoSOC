import { NextResponse } from "next/server";
import { getForensicRecords } from "@/lib/store/soc-store";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const records = await getForensicRecords();
    return NextResponse.json({ records, count: records.length }, { status: 200 });
  } catch (error) {
    console.error("[AutoSOC API] Forensics fetch failed:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch forensic records",
        records: [],
      },
      { status: 500 }
    );
  }
}
