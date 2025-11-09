import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import passport from "./passport";
import { env } from "./config/env";
import { sessionMiddleware } from "./middleware/session";
import authRoutes from "./routes/auth";
import healthRoutes from "./routes/health";
import portfolioRoutes from "./routes/portfolio";
import tradingRoutes from "./routes/trading";
import watchlistRoutes from "./routes/watchlist";

const app = express();

app.use(helmet());
app.use(morgan(env.nodeEnv === "production" ? "combined" : "dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: env.frontendOrigin,
    credentials: true,
  })
);

app.use(sessionMiddleware);
app.use(passport.initialize());
app.use(passport.session());

app.use(healthRoutes);
app.use("/auth", authRoutes);
app.use("/portfolio", portfolioRoutes);
app.use("/trading", tradingRoutes);
app.use("/watchlist", watchlistRoutes);

app.get("/", (_req, res) => {
  res.json({ name: "Zenith Backend", version: "1.0.0" });
});

app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(env.port, () => {
  console.log(`Backend running at ${env.apiOrigin}`);
});
