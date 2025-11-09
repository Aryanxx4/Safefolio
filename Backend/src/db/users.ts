import { pool } from "./pool";
import type { AppUser } from "../passport";

export type DbUser = {
  id: number;
  google_id: string;
  email: string | null;
  name: string | null;
  picture: string | null;
  balance: string;
  created_at: Date;
  updated_at: Date;
};

const SELECT_FIELDS = "id, google_id, email, name, picture, balance, created_at, updated_at";

export async function findUserByGoogleId(googleId: string): Promise<DbUser | null> {
  const result = await pool.query<DbUser>(
    `SELECT ${SELECT_FIELDS} FROM users WHERE google_id = $1 LIMIT 1`,
    [googleId]
  );
  return result.rows[0] ?? null;
}

export async function findUserById(id: number): Promise<DbUser | null> {
  const result = await pool.query<DbUser>(
    `SELECT ${SELECT_FIELDS} FROM users WHERE id = $1 LIMIT 1`,
    [id]
  );
  return result.rows[0] ?? null;
}

type ProfileInput = {
  googleId: string;
  email?: string | null;
  name?: string | null;
  picture?: string | null;
};

export async function createUserFromProfile(profile: ProfileInput): Promise<DbUser> {
  const result = await pool.query<DbUser>(
    `INSERT INTO users (google_id, email, name, picture, balance)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING ${SELECT_FIELDS}`,
    [profile.googleId, profile.email ?? null, profile.name ?? null, profile.picture ?? null, 100000]
  );
  return result.rows[0];
}

export async function updateUserProfile(userId: number, profile: ProfileInput): Promise<void> {
  await pool.query(
    `UPDATE users SET email = $1, name = $2, picture = $3, updated_at = NOW() WHERE id = $4`,
    [profile.email ?? null, profile.name ?? null, profile.picture ?? null, userId]
  );
}

export function mapDbUserToAppUser(dbUser: DbUser): AppUser {
  return {
    id: dbUser.id,
    googleId: dbUser.google_id,
    email: dbUser.email ?? undefined,
    name: dbUser.name ?? undefined,
    picture: dbUser.picture ?? undefined,
    balance: Number(dbUser.balance),
  };
}
