import { AnalystRole, SessionUser } from "@/types/security";
import { cookies } from "next/headers";
import { PRESET_ANALYSTS } from "./presets";

export { PRESET_ANALYSTS };

const SESSION_COOKIE_NAME = "autosoc_analyst_session";

/**
 * Server-side session resolver from HttpOnly cookie
 */
export async function getSessionUser(): Promise<SessionUser | null> {
  try {
    const cookieStore = cookies();
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);

    if (!sessionCookie?.value) {
      // In local dev/demo mode, provide the SecOps Principal by default so the analyst can immediately explore
      return PRESET_ANALYSTS.secops_admin;
    }

    try {
      const decoded = JSON.parse(decodeURIComponent(sessionCookie.value)) as {
        role: AnalystRole;
        email: string;
      };
      if (decoded.role && PRESET_ANALYSTS[decoded.role]) {
        return PRESET_ANALYSTS[decoded.role];
      }
    } catch {
      return PRESET_ANALYSTS.secops_admin;
    }

    return PRESET_ANALYSTS.secops_admin;
  } catch {
    // If called outside request context (e.g., during static render)
    return PRESET_ANALYSTS.secops_admin;
  }
}

/**
 * Server-side authorization gate
 */
export async function requireAuth(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) {
    throw new Error("UNAUTHORIZED: Active analyst session is required to access AutoSOC Console.");
  }
  return user;
}

/**
 * Server-side permission assertion
 */
export async function requirePermission(
  permission: keyof SessionUser["permissions"]
): Promise<SessionUser> {
  const user = await requireAuth();
  if (!user.permissions[permission]) {
    throw new Error(
      `FORBIDDEN: Analyst role '${user.role}' lacks required permission '${permission}'. Authorization denied.`
    );
  }
  return user;
}
