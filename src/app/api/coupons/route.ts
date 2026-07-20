import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/session";
import { listCoupons, createCoupon, toggleCouponStatus, deleteCoupon } from "@/lib/coupons";

async function isAuthorizedAdmin() {
  const cookieStore = await cookies();
  const session = verifySessionToken(cookieStore.get(SESSION_COOKIE)?.value);
  return Boolean(session);
}

export async function GET() {
  if (!(await isAuthorizedAdmin())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  const coupons = await listCoupons();
  return NextResponse.json({ coupons });
}

export async function POST(req: NextRequest) {
  if (!(await isAuthorizedAdmin())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  if (!body || !body.code || !body.discountType || body.discountValue === undefined) {
    return NextResponse.json({ error: "Code, discount type, and discount value are required." }, { status: 400 });
  }

  const coupon = await createCoupon({
    code: body.code,
    discountType: body.discountType,
    discountValue: Number(body.discountValue),
    maxUses: body.maxUses ? Number(body.maxUses) : null,
  });

  return NextResponse.json({ coupon }, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  if (!(await isAuthorizedAdmin())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  if (!body || !body.code || body.active === undefined) {
    return NextResponse.json({ error: "Code and active status required." }, { status: 400 });
  }

  const updated = await toggleCouponStatus(body.code, Boolean(body.active));
  if (!updated) {
    return NextResponse.json({ error: "Coupon not found." }, { status: 404 });
  }

  return NextResponse.json({ coupon: updated });
}

export async function DELETE(req: NextRequest) {
  if (!(await isAuthorizedAdmin())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  if (!code) {
    return NextResponse.json({ error: "Code parameter is required." }, { status: 400 });
  }

  await deleteCoupon(code);
  return NextResponse.json({ success: true });
}
