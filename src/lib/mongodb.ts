import { MongoClient, Db } from "mongodb";

/**
 * MongoDB connection singleton.
 *
 * Caches the client promise on `globalThis` so that HMR / serverless cold
 * starts don't open a new connection pool on every request. This is the
 * standard Next.js pattern recommended by the MongoDB team.
 */

const MONGODB_URI = process.env.MONGODB_URI || "";

if (!MONGODB_URI) {
  // This is fine — the app falls back to the local JSON store.
  // Only warn if someone explicitly set a partial URI.
}

interface MongoGlobal {
  _mongoClientPromise?: Promise<MongoClient>;
}

const g = globalThis as unknown as MongoGlobal;

let clientPromise: Promise<MongoClient>;

if (MONGODB_URI) {
  if (process.env.NODE_ENV === "development") {
    // In dev, reuse the same promise across HMR reloads.
    if (!g._mongoClientPromise) {
      const client = new MongoClient(MONGODB_URI);
      g._mongoClientPromise = client.connect();
    }
    clientPromise = g._mongoClientPromise;
  } else {
    // In production, create a fresh client.
    const client = new MongoClient(MONGODB_URI);
    clientPromise = client.connect();
  }
}

export const isMongoConfigured = Boolean(MONGODB_URI);

/**
 * Get the connected database instance.
 * The database name is extracted from the URI or defaults to "pulse".
 */
export async function getDb(): Promise<Db> {
  const client = await clientPromise;
  return client.db(); // uses the db name from the URI, or default
}
