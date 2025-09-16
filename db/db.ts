import { sql } from "@vercel/postgres";


import type { QueryResultRow } from "@vercel/postgres";

export async function query<T extends QueryResultRow = any>(
  strings: TemplateStringsArray,
  ...values: any[]
): Promise<{ rows: T[] }> {
  const result = await sql<T>(strings, ...values);
  return { rows: result.rows };
}

export { sql }; 
