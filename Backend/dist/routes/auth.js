"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const passport_1 = __importDefault(require("../passport"));
const env_1 = require("../config/env");
const users_1 = require("../db/users");
const router = (0, express_1.Router)();
router.get("/google", passport_1.default.authenticate("google", { scope: ["profile", "email"] }));
router.get("/google/callback", passport_1.default.authenticate("google", {
    failureRedirect: `${env_1.env.frontendOrigin}/login?error=oauth_failed`,
    session: true,
}), (_req, res) => {
    res.redirect(`${env_1.env.frontendOrigin}/dashboard`);
});
router.post("/logout", (req, res, next) => {
    req.logout(function (err) {
        if (err) {
            return next(err);
        }
        req.session?.destroy(() => {
            res.clearCookie("zenith.sid", {
                domain: env_1.env.cookieDomain === "localhost" ? undefined : env_1.env.cookieDomain,
                httpOnly: true,
                sameSite: env_1.env.nodeEnv === "production" ? "lax" : "lax",
                secure: env_1.env.nodeEnv === "production",
            });
            res.status(200).json({ ok: true });
        });
    });
});
router.get("/me", async (req, res) => {
    if (req.isAuthenticated?.() && req.user) {
        const sessionUser = req.user;
        const dbUser = await (0, users_1.findUserById)(sessionUser.id);
        const user = dbUser ? (0, users_1.mapDbUserToAppUser)(dbUser) : sessionUser;
        return res.json({ authenticated: true, user });
    }
    return res.json({ authenticated: false, user: null });
});
exports.default = router;
