"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const pool_1 = require("../db/pool");
const router = (0, express_1.Router)();
async function getOrCreateSimulation(userId) {
    // Use 'historical' as the default simulation name for portfolio
    const existing = await pool_1.pool.query(`SELECT id FROM simulations WHERE user_id = $1 AND name = 'historical' LIMIT 1`, [userId]);
    if (existing.rows.length > 0) {
        return existing.rows[0].id;
    }
    // Get actual date range from equity_prices
    const dateRange = await pool_1.pool.query(`SELECT MIN(price_date) as min_date, MAX(price_date) as max_date FROM public.equity_prices`);
    const minDate = dateRange.rows[0]?.min_date || '2007-01-01';
    const maxDate = dateRange.rows[0]?.max_date || '2012-12-31';
    const result = await pool_1.pool.query(`INSERT INTO simulations (user_id, name, "current_date", start_date, end_date)
     VALUES ($1, 'historical', $2, $2, $3)
     RETURNING id`, [userId, minDate, maxDate]);
    return result.rows[0].id;
}
router.get("/summary", auth_1.ensureAuthenticated, async (req, res) => {
    try {
        const user = req.user;
        const userId = user.id;
        const simId = await getOrCreateSimulation(userId);
        const [userRow] = (await pool_1.pool.query("SELECT balance FROM users WHERE id = $1", [userId])).rows;
        const positions = (await pool_1.pool.query(`SELECT symbol, quantity, average_price
         FROM positions
         WHERE user_id = $1 AND (simulation_id = $2 OR simulation_id IS NULL)
         ORDER BY symbol ASC`, [userId, simId])).rows.map((row) => ({
            symbol: row.symbol,
            quantity: Number(row.quantity),
            averagePrice: Number(row.average_price),
            marketValue: Number(row.quantity) * Number(row.average_price),
        }));
        const transactions = (await pool_1.pool.query(`SELECT id, symbol, side, quantity, price, executed_at
         FROM transactions
         WHERE user_id = $1 AND (simulation_id = $2 OR simulation_id IS NULL)
         ORDER BY executed_at DESC
         LIMIT 10`, [userId, simId])).rows.map((row) => ({
            id: row.id,
            symbol: row.symbol,
            side: row.side,
            quantity: Number(row.quantity),
            price: Number(row.price),
            executedAt: row.executed_at,
        }));
        const invested = positions.reduce((sum, pos) => sum + pos.marketValue, 0);
        const balance = Number(userRow?.balance ?? 0);
        // Always include cash in allocation, plus all positions
        const allocation = [
            { symbol: "Cash", value: balance },
            ...positions.map((pos) => ({ symbol: pos.symbol, value: pos.marketValue })),
        ];
        const totalValue = balance + invested;
        const equityCurve = [
            { label: "Start", value: 100000 },
            { label: "Now", value: totalValue || balance || 100000 },
        ];
        res.json({
            user: {
                id: userId,
                name: user.name,
                email: user.email,
                picture: user.picture,
                balance,
            },
            totals: {
                cash: balance,
                invested,
                totalValue,
            },
            positions,
            allocation,
            transactions,
            equityCurve,
        });
    }
    catch (error) {
        console.error("Failed to load portfolio summary", error);
        res.status(500).json({ error: "Failed to load portfolio summary. Ensure database tables are created." });
    }
});
// Reset user profile - reset balance to 100000 and delete all positions/transactions
router.post("/reset", auth_1.ensureAuthenticated, async (req, res) => {
    try {
        const user = req.user;
        const userId = user.id;
        await pool_1.pool.query("BEGIN");
        try {
            // Reset balance to 100000
            await pool_1.pool.query(`UPDATE users SET balance = 100000, updated_at = NOW() WHERE id = $1`, [userId]);
            // Delete all positions for this user
            await pool_1.pool.query(`DELETE FROM positions WHERE user_id = $1`, [userId]);
            // Delete all transactions for this user
            await pool_1.pool.query(`DELETE FROM transactions WHERE user_id = $1`, [userId]);
            // Reset simulations to start date
            const dateRange = await pool_1.pool.query(`SELECT MIN(price_date) as min_date, MAX(price_date) as max_date FROM public.equity_prices`);
            const minDate = dateRange.rows[0]?.min_date || '2007-01-01';
            await pool_1.pool.query(`UPDATE simulations 
         SET "current_date" = $1, start_date = $1, updated_at = NOW() 
         WHERE user_id = $2`, [minDate, userId]);
            await pool_1.pool.query("COMMIT");
            res.json({
                success: true,
                message: "Profile reset successfully. Balance restored to ₹100,000.",
            });
        }
        catch (err) {
            await pool_1.pool.query("ROLLBACK");
            throw err;
        }
    }
    catch (error) {
        console.error("Reset profile error:", error);
        res.status(500).json({ error: "Failed to reset profile" });
    }
});
exports.default = router;
