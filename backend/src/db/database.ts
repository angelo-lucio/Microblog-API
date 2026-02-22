import "dotenv/config";
import { drizzle, NodePgDatabase } from "drizzle-orm/node-postgres";
import { Client } from "pg";
import * as schema from "./schema";

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

await client.connect();

type DBSchema = NodePgDatabase<typeof schema>;

const db: DBSchema = drizzle(client, { schema });

export { db };