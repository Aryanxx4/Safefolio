"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pool = void 0;
exports.withClient = withClient;
const pg_1 = require("pg");
const env_1 = require("../config/env");
exports.pool = new pg_1.Pool({
    connectionString: (0, env_1.buildPostgresConnectionString)(),
});
async function withClient(fn) {
    return fn(exports.pool);
}
