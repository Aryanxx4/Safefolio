import { Router, Request, Response } from "express";
import { ensureAuthenticated } from "../middleware/auth";
import type { AppUser } from "../passport";

const router = Router();

// Advance simulation time (placeholder - will update positions based on historical data)
router.post("/advance", ensureAuthenticated, async (req: Request, res: Response) => {
  try {
    const user = req.user as AppUser;
    const { period } = req.body; // "1week", "1month", "3months", "1year"

    // TODO: Update positions based on historical price changes for the selected period
    // For now, just acknowledge the request

    res.json({
      success: true,
      message: `Simulation advanced by ${period}`,
      userId: user.id,
    });
  } catch (error) {
    console.error("Failed to advance simulation", error);
    res.status(500).json({ error: "Failed to advance simulation" });
  }
});

export default router;
