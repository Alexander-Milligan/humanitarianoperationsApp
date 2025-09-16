// db/db.ts
import { sql, createPool } from "@vercel/postgres";
import type { QueryResultRow } from "@vercel/postgres";

const connectionString = process.env.POSTGRES_URL || process.env.STORAGE_URL;

if (!connectionString) {
  throw new Error("No database connection string found");
}

export const pool = createPool({ connectionString });

export async function query<T extends QueryResultRow = QueryResultRow>(
  strings: TemplateStringsArray,
  ...values: any[]
) {
  return sql<T>(strings, ...values);
}
