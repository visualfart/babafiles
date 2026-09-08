// Cloudflare Workers build: vite.config.ts aliases "@/db/client" to this file.
import { env } from "cloudflare:workers";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";

type Env = { DB: D1Database };
export const db = drizzle((env as unknown as Env).DB, { schema });
export type Db = typeof db;
