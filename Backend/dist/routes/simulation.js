"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Advance simulation time (placeholder - will update positions based on historical data)
router.post("/advance", auth_1.ensureAuthenticated, async (req, res) => {
    try {
        const user = req.user;
        const { period } = req.body; // "1week", "1month", "3months", "1year"
        // TODO: Update positions based on historical price changes for the selected period
        // For now, just acknowledge the request
        res.json({
            success: true,
            message: `Simulation advanced by ${period}`,
            userId: user.id,
        });
    }
    catch (error) {
        console.error("Failed to advance simulation", error);
        res.status(500).json({ error: "Failed to advance simulation" });
    }
});
exports.default = router;
