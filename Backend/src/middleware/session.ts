import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import { env } from "../config/env";
import { pool } from "../db/pool";

const PgStore = connectPgSimple(session);

export const sessionMiddleware = session({
  store: new PgStore({
    pool,
    createTableIfMissing: true,
  }),
  name: "zenith.sid",
  secret: env.sessionSecret,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    httpOnly: true,
    secure: env.nodeEnv === "production",
    sameSite: env.nodeEnv === "production" ? "lax" : "lax",
    domain: env.cookieDomain === "localhost" ? undefined : env.cookieDomain,
  },
});
