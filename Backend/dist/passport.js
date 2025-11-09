"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const passport_1 = __importDefault(require("passport"));
const passport_google_oauth20_1 = require("passport-google-oauth20");
const env_1 = require("./config/env");
const users_1 = require("./db/users");
passport_1.default.serializeUser((user, done) => {
    done(null, user);
});
passport_1.default.deserializeUser((obj, done) => {
    done(null, obj);
});
passport_1.default.use(new passport_google_oauth20_1.Strategy({
    clientID: env_1.env.googleClientId,
    clientSecret: env_1.env.googleClientSecret,
    callbackURL: `${env_1.env.apiOrigin}/auth/google/callback`,
}, async (_accessToken, _refreshToken, profile, done) => {
    try {
        const baseProfile = {
            googleId: profile.id,
            name: profile.displayName,
            email: profile.emails?.[0]?.value,
            picture: profile.photos?.[0]?.value,
        };
        const existing = await (0, users_1.findUserByGoogleId)(profile.id);
        if (!existing) {
            const created = await (0, users_1.createUserFromProfile)({
                googleId: baseProfile.googleId,
                name: baseProfile.name,
                email: baseProfile.email,
                picture: baseProfile.picture,
            });
            return done(null, (0, users_1.mapDbUserToAppUser)(created));
        }
        await (0, users_1.updateUserProfile)(existing.id, {
            googleId: baseProfile.googleId,
            name: baseProfile.name,
            email: baseProfile.email,
            picture: baseProfile.picture,
        });
        const refreshed = await (0, users_1.findUserByGoogleId)(profile.id);
        return done(null, (0, users_1.mapDbUserToAppUser)(refreshed ?? existing));
    }
    catch (error) {
        return done(error);
    }
}));
exports.default = passport_1.default;
