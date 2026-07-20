import { NextRequest, NextResponse } from "next/server";
import { validateCoupon } from "@/lib/coupons";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body || !body.code) {
    return NextResponse.json({ error: "Coupon code is required." }, { status: 400 });
  }

  const result = await validateCoupon(body.code, body.machineId, body.customerEmail);

  if (!result.valid || !result.coupon) {
    return NextResponse.json({ valid: false, error: result.error || "Invalid coupon." }, { status: 400 });
  }

  return NextResponse.json({
    valid: true,
    code: result.coupon.code,
    discountType: result.coupon.discountType,
    discountValue: result.coupon.discountValue,
  });
}
