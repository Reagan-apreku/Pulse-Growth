import { NextRequest, NextResponse } from "next/server";
import { getResellerByEmail, verifyResellerPassword } from "@/lib/resellers";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body || !body.email || !body.password) {
    return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
  }

  const resellerByEmail = await getResellerByEmail(body.email);
  if (!resellerByEmail) {
    return NextResponse.json({ error: "No reseller account found with this email." }, { status: 404 });
  }

  if (resellerByEmail.status === "pending") {
    return NextResponse.json(
      { error: "Your reseller account is pending admin approval. You will be able to log in once an admin approves your request." },
      { status: 403 }
    );
  }

  if (resellerByEmail.status !== "active") {
    return NextResponse.json({ error: "Your reseller account is inactive. Please contact support." }, { status: 403 });
  }

  // If password is set on account, verify it
  if (resellerByEmail.passwordHash) {
    const validReseller = await verifyResellerPassword(body.email, body.password);
    if (!validReseller) {
      return NextResponse.json({ error: "Incorrect password. Please try again." }, { status: 401 });
    }
    return NextResponse.json({ reseller: validReseller });
  }

  return NextResponse.json({ reseller: resellerByEmail });
}


