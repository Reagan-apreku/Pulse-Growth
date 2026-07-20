import fs from "fs";
import path from "path";
import { isMongoConfigured, getDb } from "./mongodb";
import { ResellerAccount } from "./types";

const RESELLERS_COLLECTION = "resellers";
const LOCAL_RESELLERS_FILE = path.join(process.cwd(), "src", "lib", "data", "resellers.local.json");

const INITIAL_RESELLERS: ResellerAccount[] = [
  {
    id: "RSL-DEMO1",
    name: "Alex Johnson",
    email: "reseller@pulse.dev",
    businessName: "Apex Growth Agency",
    phone: "233550001122",
    status: "active",
    discountPercentage: 10,
    totalOrders: 14,
    totalSpent: 420.0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

function readLocalResellers(): ResellerAccount[] {
  try {
    if (!fs.existsSync(LOCAL_RESELLERS_FILE)) {
      fs.mkdirSync(path.dirname(LOCAL_RESELLERS_FILE), { recursive: true });
      fs.writeFileSync(LOCAL_RESELLERS_FILE, JSON.stringify(INITIAL_RESELLERS, null, 2));
      return INITIAL_RESELLERS;
    }
    const raw = fs.readFileSync(LOCAL_RESELLERS_FILE, "utf-8");
    return JSON.parse(raw) as ResellerAccount[];
  } catch {
    return INITIAL_RESELLERS;
  }
}

function writeLocalResellers(resellers: ResellerAccount[]) {
  try {
    fs.mkdirSync(path.dirname(LOCAL_RESELLERS_FILE), { recursive: true });
    fs.writeFileSync(LOCAL_RESELLERS_FILE, JSON.stringify(resellers, null, 2));
  } catch {
    // Read-only filesystem fallback
  }
}

export async function listResellers(): Promise<ResellerAccount[]> {
  if (!isMongoConfigured) {
    return readLocalResellers().sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  }
  const db = await getDb();
  const docs = await db.collection(RESELLERS_COLLECTION).find({}).sort({ createdAt: -1 }).toArray();
  return docs.map((d) => ({
    id: d.id as string,
    name: d.name as string,
    email: d.email as string,
    businessName: (d.businessName as string) || null,
    phone: (d.phone as string) || null,
    status: (d.status as "pending" | "active" | "inactive") || "pending",
    discountPercentage: Number(d.discountPercentage || 10),
    totalOrders: Number(d.totalOrders || 0),
    totalSpent: Number(d.totalSpent || 0),
    createdAt: d.createdAt as string,
    updatedAt: d.updatedAt as string,
  }));
}

export async function getResellerByEmail(email: string): Promise<ResellerAccount | null> {
  const formatted = email.trim().toLowerCase();
  if (!isMongoConfigured) {
    const list = readLocalResellers();
    return list.find((r) => r.email.toLowerCase() === formatted) || null;
  }
  const db = await getDb();
  const doc = await db.collection(RESELLERS_COLLECTION).findOne({ email: formatted });
  if (!doc) return null;
  return {
    id: doc.id as string,
    name: doc.name as string,
    email: doc.email as string,
    businessName: (doc.businessName as string) || null,
    phone: (doc.phone as string) || null,
    status: (doc.status as "pending" | "active" | "inactive") || "pending",
    discountPercentage: Number(doc.discountPercentage || 10),
    totalOrders: Number(doc.totalOrders || 0),
    totalSpent: Number(doc.totalSpent || 0),
    createdAt: doc.createdAt as string,
    updatedAt: doc.updatedAt as string,
  };
}

export async function registerReseller(input: {
  name: string;
  email: string;
  businessName?: string;
  phone?: string;
}): Promise<ResellerAccount> {
  const formattedEmail = input.email.trim().toLowerCase();
  const existing = await getResellerByEmail(formattedEmail);
  if (existing) {
    return existing;
  }

  const now = new Date().toISOString();
  const reseller: ResellerAccount = {
    id: `RSL-${Date.now().toString(36).toUpperCase()}`,
    name: input.name.trim(),
    email: formattedEmail,
    businessName: input.businessName?.trim() || null,
    phone: input.phone?.trim() || null,
    status: "pending", // Resellers require admin approval before login
    discountPercentage: 10,
    totalOrders: 0,
    totalSpent: 0,
    createdAt: now,
    updatedAt: now,
  };

  if (!isMongoConfigured) {
    const resellers = readLocalResellers();
    resellers.unshift(reseller);
    writeLocalResellers(resellers);
    return reseller;
  }

  const db = await getDb();
  await db.collection(RESELLERS_COLLECTION).insertOne({ ...reseller });
  return reseller;
}

export async function toggleResellerStatus(id: string, status: "pending" | "active" | "inactive"): Promise<ResellerAccount | null> {
  const now = new Date().toISOString();
  if (!isMongoConfigured) {
    const list = readLocalResellers();
    const idx = list.findIndex((r) => r.id === id);
    if (idx === -1) return null;
    list[idx].status = status;
    list[idx].updatedAt = now;
    writeLocalResellers(list);
    return list[idx];
  }
  const db = await getDb();
  const result = await db.collection(RESELLERS_COLLECTION).findOneAndUpdate(
    { id },
    { $set: { status, updatedAt: now } },
    { returnDocument: "after" }
  );
  if (!result) return null;
  return result as unknown as ResellerAccount;
}


export async function recordResellerOrder(email: string, amount: number): Promise<void> {
  const formattedEmail = email.trim().toLowerCase();
  if (!isMongoConfigured) {
    const list = readLocalResellers();
    const idx = list.findIndex((r) => r.email.toLowerCase() === formattedEmail);
    if (idx !== -1) {
      list[idx].totalOrders += 1;
      list[idx].totalSpent += amount;
      list[idx].updatedAt = new Date().toISOString();
      writeLocalResellers(list);
    }
    return;
  }
  const db = await getDb();
  await db.collection(RESELLERS_COLLECTION).updateOne(
    { email: formattedEmail },
    {
      $inc: { totalOrders: 1, totalSpent: amount },
      $set: { updatedAt: new Date().toISOString() },
    }
  );
}
