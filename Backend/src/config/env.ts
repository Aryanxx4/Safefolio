import dotenv from "dotenv";

dotenv.config();

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required env var ${name}`);
  }
  return value;
}

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT) || 4000,
  frontendOrigin: process.env.FRONTEND_ORIGIN || "http://localhost:3000",
  apiOrigin: process.env.API_ORIGIN || "http://localhost:4000",
  cookieDomain: process.env.COOKIE_DOMAIN || "localhost",
  googleClientId: required("GOOGLE_CLIENT_ID"),
  googleClientSecret: required("GOOGLE_CLIENT_SECRET"),
  sessionSecret: required("SESSION_SECRET"),
  pg: {
    user: required("PG_USER"),
    host: required("PG_HOST"),
    database: required("PG_DATABASE"),
    password: required("PG_PASSWORD"),
    port: Number(process.env.PG_PORT) || 5432,
  },
};

export function buildPostgresConnectionString(): string {
  const { user, password, host, port, database } = env.pg;
  return `postgresql://${user}:${encodeURIComponent(password)}@${host}:${port}/${database}`;
}
