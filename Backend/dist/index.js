"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const passport_1 = __importDefault(require("./passport"));
const env_1 = require("./config/env");
const session_1 = require("./middleware/session");
const auth_1 = __importDefault(require("./routes/auth"));
const health_1 = __importDefault(require("./routes/health"));
const portfolio_1 = __importDefault(require("./routes/portfolio"));
const trading_1 = __importDefault(require("./routes/trading"));
const watchlist_1 = __importDefault(require("./routes/watchlist"));
const app = (0, express_1.default)();
app.use((0, helmet_1.default)());
app.use((0, morgan_1.default)(env_1.env.nodeEnv === "production" ? "combined" : "dev"));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cors_1.default)({
    origin: env_1.env.frontendOrigin,
    credentials: true,
}));
app.use(session_1.sessionMiddleware);
app.use(passport_1.default.initialize());
app.use(passport_1.default.session());
app.use(health_1.default);
app.use("/auth", auth_1.default);
app.use("/portfolio", portfolio_1.default);
app.use("/trading", trading_1.default);
app.use("/watchlist", watchlist_1.default);
app.get("/", (_req, res) => {
    res.json({ name: "Zenith Backend", version: "1.0.0" });
});
app.use((err, _req, res, _next) => {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
});
app.listen(env_1.env.port, () => {
    console.log(`Backend running at ${env_1.env.apiOrigin}`);
});
