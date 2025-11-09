import passport from "passport";
import { Strategy as GoogleStrategy, Profile } from "passport-google-oauth20";
import { env } from "./config/env";
import {
  createUserFromProfile,
  findUserByGoogleId,
  mapDbUserToAppUser,
  updateUserProfile,
} from "./db/users";

export type AppUser = {
  id: number;
  googleId: string;
  name?: string;
  email?: string;
  picture?: string;
  balance: number;
};

passport.serializeUser<AppUser>((user, done) => {
  done(null, user);
});

passport.deserializeUser<AppUser>((obj, done) => {
  done(null, obj as AppUser);
});

passport.use(
  new GoogleStrategy(
    {
      clientID: env.googleClientId,
      clientSecret: env.googleClientSecret,
      callbackURL: `${env.apiOrigin}/auth/google/callback`,
    },
    async (_accessToken: string, _refreshToken: string, profile: Profile, done) => {
      try {
        const baseProfile = {
          googleId: profile.id,
          name: profile.displayName,
          email: profile.emails?.[0]?.value,
          picture: profile.photos?.[0]?.value,
        };

        const existing = await findUserByGoogleId(profile.id);
        if (!existing) {
          const created = await createUserFromProfile({
            googleId: baseProfile.googleId,
            name: baseProfile.name,
            email: baseProfile.email,
            picture: baseProfile.picture,
          });
          return done(null, mapDbUserToAppUser(created));
        }

        await updateUserProfile(existing.id, {
          googleId: baseProfile.googleId,
          name: baseProfile.name,
          email: baseProfile.email,
          picture: baseProfile.picture,
        });

        const refreshed = await findUserByGoogleId(profile.id);
        return done(null, mapDbUserToAppUser(refreshed ?? existing));
      } catch (error) {
        return done(error as Error);
      }
    }
  )
);

export default passport;
