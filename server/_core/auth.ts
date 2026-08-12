import passport from "passport";
import { Strategy as GitHubStrategy } from "passport-github2";
import * as db from "../db";

// Serialize user
passport.serializeUser((user: any, done) => {
  done(null, user.openId);
});

// Deserialize user
passport.deserializeUser(async (openId: string, done) => {
  try {
    const user = await db.getUserByOpenId(openId);

    if (!user) {
      return done(null, false);
    }

    return done(null, user);
  } catch (err) {
    return done(err as Error, false);
  }
});

// GitHub Strategy
passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      callbackURL: process.env.GITHUB_CALLBACK_URL!,
      scope: ["user:email"],
    },
    async (
      accessToken: string,
      refreshToken: string,
      profile: any,
      done: (error: any, user?: any) => void
    ) => {
      try {
        await db.upsertUser({
          openId: profile.id,
          name: profile.displayName || profile.username || "GitHub User",
          email: profile.emails?.[0]?.value ?? null,
          loginMethod: "github",
          lastSignedIn: new Date(),
        });

        const user = await db.getUserByOpenId(profile.id);

        if (!user) {
          return done(new Error("User could not be created"));
        }

        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);
console.log("CLIENT ID:", process.env.GITHUB_CLIENT_ID);
console.log("CLIENT SECRET:", process.env.GITHUB_CLIENT_SECRET);
console.log("CALLBACK:", process.env.GITHUB_CALLBACK_URL);
export default passport;