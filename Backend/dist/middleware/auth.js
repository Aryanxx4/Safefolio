"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ensureAuthenticated = ensureAuthenticated;
function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated?.() && req.user) {
        return next();
    }
    return res.status(401).json({ error: "Unauthorized" });
}
