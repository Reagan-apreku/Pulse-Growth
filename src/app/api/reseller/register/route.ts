import { NextRequest, NextResponse } from "next/server";
import { registerReseller } from "@/lib/resellers";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body || !body.name || !body.email) {
    return NextResponse.json({ error: "Name and email are required." }, { status: 400 });
  }

  const reseller = await registerReseller({
    name: body.name,
    email: body.email,
    businessName: body.businessName,
    phone: body.phone,
  });

  return NextResponse.json({ reseller }, { status: 201 });
}
