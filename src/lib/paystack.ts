/**
 * Server-side Paystack API helpers.
 *
 * Uses the REST API directly — no SDK dependency needed.
 * All amounts are in **pesewas** (1 GHS = 100 pesewas).
 */

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY || "";
const BASE = "https://api.paystack.co";

function headers() {
  return {
    Authorization: `Bearer ${PAYSTACK_SECRET}`,
    "Content-Type": "application/json",
  };
}

/** Convert a GHS amount (e.g. 45.00) to pesewas (4500). */
export function ghsToPesewas(ghs: number): number {
  return Math.round(ghs * 100);
}

export interface InitTxnResponse {
  status: boolean;
  message: string;
  data: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

/**
 * Initialize a Paystack transaction.
 * Docs: https://paystack.com/docs/api/transaction/#initialize
 */
export async function initializeTransaction(opts: {
  email: string;
  amount: number; // in pesewas
  reference: string;
  callbackUrl: string;
  metadata?: Record<string, unknown>;
  channels?: string[];
}): Promise<InitTxnResponse> {
  const res = await fetch(`${BASE}/transaction/initialize`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      email: opts.email,
      amount: opts.amount,
      reference: opts.reference,
      callback_url: opts.callbackUrl,
      currency: "GHS",
      channels: opts.channels || ["mobile_money", "card", "bank_transfer", "qr"],
      metadata: opts.metadata,
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Paystack initialize failed: ${res.status} ${text}`);
  }
  return res.json();
}

export interface VerifyTxnResponse {
  status: boolean;
  message: string;
  data: {
    id: number;
    status: "success" | "failed" | "abandoned";
    reference: string;
    amount: number;
    currency: string;
    channel: string;
    paid_at: string | null;
    metadata: Record<string, unknown> | null;
  };
}

/**
 * Verify a transaction by reference.
 * Docs: https://paystack.com/docs/api/transaction/#verify
 */
export async function verifyTransaction(reference: string): Promise<VerifyTxnResponse> {
  const res = await fetch(`${BASE}/transaction/verify/${encodeURIComponent(reference)}`, {
    method: "GET",
    headers: headers(),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Paystack verify failed: ${res.status} ${text}`);
  }
  return res.json();
}

/**
 * Validate a Paystack webhook signature.
 * Docs: https://paystack.com/docs/payments/webhooks/#verify-event-origin
 */
export function isValidWebhookSignature(
  body: string,
  signature: string | null
): boolean {
  if (!signature || !PAYSTACK_SECRET) return false;
  const crypto = require("crypto") as typeof import("crypto");
  const hash = crypto
    .createHmac("sha512", PAYSTACK_SECRET)
    .update(body)
    .digest("hex");
  return hash === signature;
}
