import { Router } from "express";
import passport from "./auth";

const router = Router();

router.get(
  "/login",
  passport.authenticate("github", {
    scope: ["user:email"],
  })
);

router.get(
  "/callback",
  passport.authenticate("github", {
    failureRedirect: "/",
    session: true,
  }),
  (_req, res) => {
    res.redirect("/");
  }
);

router.get("/me", (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json(null);
  }

  res.json(req.user);
});

router.get("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);

    req.session.destroy(() => {
      res.clearCookie("connect.sid");
      res.redirect("https://pqc-messager.vercel.app/");
    });
  });
});

export function registerOAuthRoutes(app: any) {
  app.use("/api/oauth", router);
}