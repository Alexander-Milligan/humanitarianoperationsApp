// db/db.ts
import { sql, createPool } from "@vercel/postgres";
import type { QueryResultRow } from "@vercel/postgres";

// optional pool (for cases like pool.query)
export const pool = createPool({
  connectionString: process.env.POSTGRES_URL,
});

// helper for tagged-template queries
export async function query<T extends QueryResultRow = QueryResultRow>(
  strings: TemplateStringsArray,
  ...values: any[]
) {
  return sql<T>(strings, ...values);
}
