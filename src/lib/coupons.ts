import fs from "fs";
import path from "path";
import { isMongoConfigured, getDb } from "./mongodb";
import { Coupon, CouponUsage, DiscountType } from "./types";

const COUPONS_COLLECTION = "coupons";
const USAGE_COLLECTION = "coupon_usages";

const LOCAL_COUPONS_FILE = path.join(process.cwd(), "src", "lib", "data", "coupons.local.json");
const LOCAL_USAGE_FILE = path.join(process.cwd(), "src", "lib", "data", "coupon_usages.local.json");

// Default initial coupons if local JSON store is fresh
const INITIAL_COUPONS: Coupon[] = [
  {
    id: "CPN-WELCOME10",
    code: "WELCOME10",
    discountType: "percentage",
    discountValue: 10,
    maxUses: 100,
    usedCount: 0,
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "CPN-PULSE5",
    code: "PULSE5",
    discountType: "fixed",
    discountValue: 5,
    maxUses: null,
    usedCount: 0,
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// --- Local Storage Helpers ---
function readLocalCoupons(): Coupon[] {
  try {
    if (!fs.existsSync(LOCAL_COUPONS_FILE)) {
      fs.mkdirSync(path.dirname(LOCAL_COUPONS_FILE), { recursive: true });
      fs.writeFileSync(LOCAL_COUPONS_FILE, JSON.stringify(INITIAL_COUPONS, null, 2));
      return INITIAL_COUPONS;
    }
    const raw = fs.readFileSync(LOCAL_COUPONS_FILE, "utf-8");
    return JSON.parse(raw) as Coupon[];
  } catch {
    return INITIAL_COUPONS;
  }
}

function writeLocalCoupons(coupons: Coupon[]) {
  try {
    fs.mkdirSync(path.dirname(LOCAL_COUPONS_FILE), { recursive: true });
    fs.writeFileSync(LOCAL_COUPONS_FILE, JSON.stringify(coupons, null, 2));
  } catch {
    // Read-only filesystem fallback
  }
}

function readLocalUsages(): CouponUsage[] {
  try {
    if (!fs.existsSync(LOCAL_USAGE_FILE)) {
      return [];
    }
    const raw = fs.readFileSync(LOCAL_USAGE_FILE, "utf-8");
    return JSON.parse(raw) as CouponUsage[];
  } catch {
    return [];
  }
}

function writeLocalUsages(usages: CouponUsage[]) {
  try {
    fs.mkdirSync(path.dirname(LOCAL_USAGE_FILE), { recursive: true });
    fs.writeFileSync(LOCAL_USAGE_FILE, JSON.stringify(usages, null, 2));
  } catch {
    // Read-only filesystem fallback
  }
}

// --- Public Operations ---

export async function listCoupons(): Promise<Coupon[]> {
  if (!isMongoConfigured) {
    return readLocalCoupons().sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  }
  const db = await getDb();
  const docs = await db.collection(COUPONS_COLLECTION).find({}).sort({ createdAt: -1 }).toArray();
  return docs.map((d) => ({
    id: d.id as string,
    code: d.code as string,
    discountType: d.discountType as DiscountType,
    discountValue: Number(d.discountValue),
    maxUses: d.maxUses !== null && d.maxUses !== undefined ? Number(d.maxUses) : null,
    usedCount: Number(d.usedCount || 0),
    active: Boolean(d.active),
    createdAt: d.createdAt as string,
    updatedAt: d.updatedAt as string,
  }));
}

export async function createCoupon(input: {
  code: string;
  discountType: DiscountType;
  discountValue: number;
  maxUses?: number | null;
}): Promise<Coupon> {
  const formattedCode = input.code.trim().toUpperCase();
  const now = new Date().toISOString();
  const coupon: Coupon = {
    id: `CPN-${Date.now().toString(36).toUpperCase()}`,
    code: formattedCode,
    discountType: input.discountType,
    discountValue: Number(input.discountValue),
    maxUses: input.maxUses ? Number(input.maxUses) : null,
    usedCount: 0,
    active: true,
    createdAt: now,
    updatedAt: now,
  };

  if (!isMongoConfigured) {
    const coupons = readLocalCoupons();
    // Prevent duplicate active code
    const existingIdx = coupons.findIndex((c) => c.code === formattedCode);
    if (existingIdx !== -1) {
      coupons[existingIdx] = coupon;
    } else {
      coupons.unshift(coupon);
    }
    writeLocalCoupons(coupons);
    return coupon;
  }

  const db = await getDb();
  await db.collection(COUPONS_COLLECTION).updateOne(
    { code: formattedCode },
    { $set: { ...coupon } },
    { upsert: true }
  );
  return coupon;
}

export async function toggleCouponStatus(code: string, active: boolean): Promise<Coupon | null> {
  const formattedCode = code.trim().toUpperCase();
  const now = new Date().toISOString();

  if (!isMongoConfigured) {
    const coupons = readLocalCoupons();
    const idx = coupons.findIndex((c) => c.code === formattedCode);
    if (idx === -1) return null;
    coupons[idx].active = active;
    coupons[idx].updatedAt = now;
    writeLocalCoupons(coupons);
    return coupons[idx];
  }

  const db = await getDb();
  const result = await db.collection(COUPONS_COLLECTION).findOneAndUpdate(
    { code: formattedCode },
    { $set: { active, updatedAt: now } },
    { returnDocument: "after" }
  );
  if (!result) return null;
  return result as unknown as Coupon;
}

export async function deleteCoupon(code: string): Promise<boolean> {
  const formattedCode = code.trim().toUpperCase();
  if (!isMongoConfigured) {
    const coupons = readLocalCoupons();
    const filtered = coupons.filter((c) => c.code !== formattedCode);
    writeLocalCoupons(filtered);
    return true;
  }
  const db = await getDb();
  await db.collection(COUPONS_COLLECTION).deleteOne({ code: formattedCode });
  return true;
}

export async function validateCoupon(
  code: string,
  machineId?: string,
  customerEmail?: string
): Promise<{ valid: boolean; coupon?: Coupon; error?: string }> {
  const formattedCode = code.trim().toUpperCase();
  const coupons = await listCoupons();
  const coupon = coupons.find((c) => c.code === formattedCode);

  if (!coupon) {
    return { valid: false, error: "Invalid coupon code." };
  }
  if (!coupon.active) {
    return { valid: false, error: "This coupon is currently inactive." };
  }
  if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) {
    return { valid: false, error: "This coupon has reached its maximum usage limit." };
  }

  // Single-use restriction check per machine or customer email
  let usages: CouponUsage[] = [];
  if (!isMongoConfigured) {
    usages = readLocalUsages();
  } else {
    const db = await getDb();
    const docs = await db.collection(USAGE_COLLECTION).find({ couponCode: formattedCode }).toArray();
    usages = docs.map((d) => ({
      id: d.id as string,
      couponCode: d.couponCode as string,
      customerEmail: (d.customerEmail as string) || null,
      machineId: d.machineId as string,
      orderId: d.orderId as string,
      usedAt: d.usedAt as string,
    }));
  }

  const alreadyUsed = usages.some((u) => {
    if (u.couponCode !== formattedCode) return false;
    const matchMachine = machineId && u.machineId && u.machineId === machineId;
    const matchEmail = customerEmail && u.customerEmail && u.customerEmail.toLowerCase() === customerEmail.toLowerCase();
    return Boolean(matchMachine || matchEmail);
  });

  if (alreadyUsed) {
    return { valid: false, error: "You have already used this coupon once." };
  }

  return { valid: true, coupon };
}

export async function recordCouponUsage(
  code: string,
  machineId: string,
  customerEmail: string | null,
  orderId: string
): Promise<void> {
  const formattedCode = code.trim().toUpperCase();
  const usage: CouponUsage = {
    id: `USG-${Date.now()}`,
    couponCode: formattedCode,
    customerEmail: customerEmail || null,
    machineId,
    orderId,
    usedAt: new Date().toISOString(),
  };

  if (!isMongoConfigured) {
    const usages = readLocalUsages();
    usages.push(usage);
    writeLocalUsages(usages);

    const coupons = readLocalCoupons();
    const idx = coupons.findIndex((c) => c.code === formattedCode);
    if (idx !== -1) {
      coupons[idx].usedCount += 1;
      coupons[idx].updatedAt = new Date().toISOString();
      writeLocalCoupons(coupons);
    }
    return;
  }

  const db = await getDb();
  await db.collection(USAGE_COLLECTION).insertOne({ ...usage });
  await db.collection(COUPONS_COLLECTION).updateOne(
    { code: formattedCode },
    { $inc: { usedCount: 1 }, $set: { updatedAt: new Date().toISOString() } }
  );
}
