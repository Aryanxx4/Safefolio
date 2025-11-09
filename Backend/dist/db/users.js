"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findUserByGoogleId = findUserByGoogleId;
exports.findUserById = findUserById;
exports.createUserFromProfile = createUserFromProfile;
exports.updateUserProfile = updateUserProfile;
exports.mapDbUserToAppUser = mapDbUserToAppUser;
const pool_1 = require("./pool");
const SELECT_FIELDS = "id, google_id, email, name, picture, balance, created_at, updated_at";
async function findUserByGoogleId(googleId) {
    const result = await pool_1.pool.query(`SELECT ${SELECT_FIELDS} FROM users WHERE google_id = $1 LIMIT 1`, [googleId]);
    return result.rows[0] ?? null;
}
async function findUserById(id) {
    const result = await pool_1.pool.query(`SELECT ${SELECT_FIELDS} FROM users WHERE id = $1 LIMIT 1`, [id]);
    return result.rows[0] ?? null;
}
async function createUserFromProfile(profile) {
    const result = await pool_1.pool.query(`INSERT INTO users (google_id, email, name, picture, balance)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING ${SELECT_FIELDS}`, [profile.googleId, profile.email ?? null, profile.name ?? null, profile.picture ?? null, 100000]);
    return result.rows[0];
}
async function updateUserProfile(userId, profile) {
    await pool_1.pool.query(`UPDATE users SET email = $1, name = $2, picture = $3, updated_at = NOW() WHERE id = $4`, [profile.email ?? null, profile.name ?? null, profile.picture ?? null, userId]);
}
function mapDbUserToAppUser(dbUser) {
    return {
        id: dbUser.id,
        googleId: dbUser.google_id,
        email: dbUser.email ?? undefined,
        name: dbUser.name ?? undefined,
        picture: dbUser.picture ?? undefined,
        balance: Number(dbUser.balance),
    };
}
