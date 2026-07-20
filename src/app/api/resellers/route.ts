import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/session";
import { listResellers, toggleResellerStatus } from "@/lib/resellers";
import { notifyResellerApprovedWhatsApp } from "@/lib/whatsapp-notify";

async function isAuthorizedAdmin() {
  const cookieStore = await cookies();
  const session = verifySessionToken(cookieStore.get(SESSION_COOKIE)?.value);
  return Boolean(session);
}

export async function GET() {
  if (!(await isAuthorizedAdmin())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  const resellers = await listResellers();
  return NextResponse.json({ resellers });
}

export async function PATCH(req: NextRequest) {
  if (!(await isAuthorizedAdmin())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  if (!body || !body.id || !body.status) {
    return NextResponse.json({ error: "Reseller ID and status required." }, { status: 400 });
  }

  const updated = await toggleResellerStatus(body.id, body.status);
  if (!updated) {
    return NextResponse.json({ error: "Reseller not found." }, { status: 404 });
  }

  // If reseller status was set to active, fire automated WhatsApp notification
  if (body.status === "active") {
    await notifyResellerApprovedWhatsApp(updated).catch((err) => {
      console.error("Automated WhatsApp reseller alert error:", err);
    });
  }

  return NextResponse.json({ reseller: updated });
}

