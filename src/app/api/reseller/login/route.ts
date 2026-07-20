import { NextRequest, NextResponse } from "next/server";
import { getResellerByEmail } from "@/lib/resellers";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body || !body.email) {
    return NextResponse.json({ error: "Email is required." }, { status: 400 });
  }

  const reseller = await getResellerByEmail(body.email);
  if (!reseller) {
    return NextResponse.json({ error: "No reseller account found with this email." }, { status: 404 });
  }

  if (reseller.status === "pending") {
    return NextResponse.json(
      { error: "Your reseller account is pending admin approval. You will be able to log in once an admin approves your request." },
      { status: 403 }
    );
  }

  if (reseller.status !== "active") {
    return NextResponse.json({ error: "Your reseller account is inactive. Please contact support." }, { status: 403 });
  }

  return NextResponse.json({ reseller });
}

