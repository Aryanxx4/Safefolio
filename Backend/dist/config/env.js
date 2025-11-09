"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
exports.buildPostgresConnectionString = buildPostgresConnectionString;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
function required(name) {
    const value = process.env[name];
    if (!value) {
        throw new Error(`Missing required env var ${name}`);
    }
    return value;
}
exports.env = {
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
function buildPostgresConnectionString() {
    const { user, password, host, port, database } = exports.env.pg;
    return `postgresql://${user}:${encodeURIComponent(password)}@${host}:${port}/${database}`;
}
