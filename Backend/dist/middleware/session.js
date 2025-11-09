"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sessionMiddleware = void 0;
const express_session_1 = __importDefault(require("express-session"));
const connect_pg_simple_1 = __importDefault(require("connect-pg-simple"));
const env_1 = require("../config/env");
const pool_1 = require("../db/pool");
const PgStore = (0, connect_pg_simple_1.default)(express_session_1.default);
exports.sessionMiddleware = (0, express_session_1.default)({
    store: new PgStore({
        pool: pool_1.pool,
        createTableIfMissing: true,
    }),
    name: "zenith.sid",
    secret: env_1.env.sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
        httpOnly: true,
        secure: env_1.env.nodeEnv === "production",
        sameSite: env_1.env.nodeEnv === "production" ? "lax" : "lax",
        domain: env_1.env.cookieDomain === "localhost" ? undefined : env_1.env.cookieDomain,
    },
});
