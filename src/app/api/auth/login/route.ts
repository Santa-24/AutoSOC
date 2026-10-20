import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { PRESET_ANALYSTS } from "@/lib/auth/session";
import { AnalystRole } from "@/types/security";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const role = (body.role as AnalystRole) || "secops_admin";

    const analyst = PRESET_ANALYSTS[role];
    if (!analyst) {
      return NextResponse.json({ error: "Invalid analyst role" }, { status: 400 });
    }

    const cookieStore = cookies();
    cookieStore.set("autosoc_analyst_session", encodeURIComponent(JSON.stringify(analyst)), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return NextResponse.json({ success: true, user: analyst });
  } catch {
    return NextResponse.json({ error: "Failed to establish analyst session" }, { status: 500 });
  }
}
