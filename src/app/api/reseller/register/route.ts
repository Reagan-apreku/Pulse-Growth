import { NextRequest, NextResponse } from "next/server";
import { registerReseller } from "@/lib/resellers";
import { notifyAdminNewReseller } from "@/lib/telegram-notify";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body || !body.name || !body.email || !body.password || !body.phone) {
    return NextResponse.json({ error: "Name, email, password, and phone number are required." }, { status: 400 });
  }

  if (typeof body.password !== "string" || body.password.length < 6) {
    return NextResponse.json({ error: "Password must be at least 6 characters long." }, { status: 400 });
  }

  const reseller = await registerReseller({
    name: body.name,
    email: body.email,
    password: body.password,
    phone: body.phone,
    businessName: body.businessName,
  });

  // Send Telegram notification to admin for approval
  await notifyAdminNewReseller(reseller).catch((err) => {
    console.error("Failed to send Telegram reseller alert:", err);
  });

  return NextResponse.json({ reseller }, { status: 201 });
}



