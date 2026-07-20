import { NextRequest, NextResponse } from "next/server";
import { registerReseller } from "@/lib/resellers";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body || !body.name || !body.email || !body.password) {
    return NextResponse.json({ error: "Name, email, and password are required." }, { status: 400 });
  }

  if (typeof body.password !== "string" || body.password.length < 6) {
    return NextResponse.json({ error: "Password must be at least 6 characters long." }, { status: 400 });
  }

  const reseller = await registerReseller({
    name: body.name,
    email: body.email,
    password: body.password,
    businessName: body.businessName,
    phone: body.phone,
  });

  return NextResponse.json({ reseller }, { status: 201 });
}

