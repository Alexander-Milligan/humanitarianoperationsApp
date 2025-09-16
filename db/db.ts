// db/db.ts
import { sql } from "@vercel/postgres";

// ✅ generic query helper
export async function query<T = any>(
  strings: TemplateStringsArray,
  ...values: any[]
): Promise<{ rows: T[] }> {
  const result = await sql<T>(strings, ...values);
  return { rows: result.rows };
}

export { sql }; // in case you want direct access
