import { Router, Request, Response, NextFunction } from "express";
import passport, { AppUser } from "../passport";
import { env } from "../config/env";
import { findUserById, mapDbUserToAppUser } from "../db/users";

const router = Router();

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: `${env.frontendOrigin}/login?error=oauth_failed`,
    session: true,
  }),
  (_req, res) => {
    res.redirect(`${env.frontendOrigin}/dashboard`);
  }
);

router.post("/logout", (req: Request, res: Response, next: NextFunction) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    req.session?.destroy(() => {
      res.clearCookie("zenith.sid", {
        domain: env.cookieDomain === "localhost" ? undefined : env.cookieDomain,
        httpOnly: true,
        sameSite: env.nodeEnv === "production" ? "lax" : "lax",
        secure: env.nodeEnv === "production",
      });
      res.status(200).json({ ok: true });
    });
  });
});

router.get("/me", async (req: Request, res: Response) => {
  if (req.isAuthenticated?.() && req.user) {
    const sessionUser = req.user as AppUser;
    const dbUser = await findUserById(sessionUser.id);
    const user = dbUser ? mapDbUserToAppUser(dbUser) : sessionUser;
    return res.json({ authenticated: true, user });
  }
  return res.json({ authenticated: false, user: null });
});

export default router;
