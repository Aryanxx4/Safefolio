import { Pool } from "pg";
import { buildPostgresConnectionString } from "../config/env";

export const pool = new Pool({
  connectionString: buildPostgresConnectionString(),
});

export async function withClient<T>(fn: (client: Pool) => Promise<T>): Promise<T> {
  return fn(pool);
}
