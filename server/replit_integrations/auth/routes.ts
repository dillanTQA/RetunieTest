import type { Express } from "express";
import { authStorage } from "./storage";

const DEMO_USER = {
  id: "demo-user",
  username: "Demo User",
  email: "demo@retinuesolutions.com",
  firstName: "Demo",
  lastName: "User",
  profileImageUrl: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

export function registerAuthRoutes(app: Express): void {
  app.get("/api/auth/user", async (req: any, res) => {
    try {
      if (req.isAuthenticated && req.isAuthenticated() && req.user?.claims?.sub) {
        const userId = req.user.claims.sub;
        const user = await authStorage.getUser(userId);
        if (user) return res.json(user);
      }
      if (req.session?.demoLoggedIn) {
        await authStorage.upsertUser(DEMO_USER);
        return res.json(DEMO_USER);
      }
      return res.status(401).json({ message: "Not logged in" });
    } catch (error) {
      console.error("Error fetching user:", error);
      return res.status(401).json({ message: "Not logged in" });
    }
  });

  app.post("/api/auth/demo-login", async (req: any, res) => {
    try {
      req.session.demoLoggedIn = true;
      await authStorage.upsertUser(DEMO_USER);
      return res.json(DEMO_USER);
    } catch (error) {
      console.error("Error during demo login:", error);
      return res.status(500).json({ message: "Login failed" });
    }
  });

  app.post("/api/auth/demo-logout", async (req: any, res) => {
    req.session.demoLoggedIn = false;
    return res.json({ message: "Logged out" });
  });
}
