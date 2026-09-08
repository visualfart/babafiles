import fs from "node:fs";
import path from "node:path";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";

// Local: libsql over a file. Later on Cloudflare this becomes drizzle-orm/d1 with the same schema.
const url = process.env.DATABASE_URL ?? "file:.data/babafiles.db";
if (url.startsWith("file:")) {
  fs.mkdirSync(path.dirname(url.slice(5)), { recursive: true });
}

const globalForDb = globalThis as unknown as { __libsql?: ReturnType<typeof createClient> };
export const client = globalForDb.__libsql ?? createClient({ url });
if (process.env.NODE_ENV !== "production") globalForDb.__libsql = client;

export const db = drizzle(client, { schema });
export type Db = typeof db;
