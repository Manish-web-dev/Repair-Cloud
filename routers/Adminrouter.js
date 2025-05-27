import express from "express";
// import bcrypt from "bcryptjs"; // REMOVE this line
import Admin from "../model/Adminschema.js";
import Project from "../model/projectschema.js";
// import imageSchema from "../model/imageschema.js"; // If needed

const router = express.Router();

const adminEmail = "sanjeet@gmail.com";
const adminPassword = "manish";

// Middleware to check admin session
function requireAdmin(req, res, next) {
  if (req.session && req.session.isAdmin) {
    // Prevent browser caching for admin page
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    res.setHeader("Surrogate-Control", "no-store");
    next();
  } else {
    res.redirect("/");
  }
}

// Home page: always logout admin if present
router.get("/", (req, res) => {
  if (req.session && req.session.isAdmin) {
    req.session.destroy(() => {
      res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
      res.setHeader("Pragma", "no-cache");
      res.setHeader("Expires", "0");
      res.setHeader("Surrogate-Control", "no-store");
      res.render("home", { error: null, success: null });
    });
  } else {
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    res.setHeader("Surrogate-Control", "no-store");
    res.render("home", { error: null, success: null });
  }
});

// Render the admin panel (require login)
router.get("/admin", requireAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 20;
    const skip = (page - 1) * limit;
    const total = await Project.countDocuments();
    const projects = await Project.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    const projectsWithUrl = projects.map(p => ({
      ...p.toObject(),
       imageUrl: p.image ? `/uploads/${p.image}` : null // <-- fix here
    }));
    const totalPages = Math.ceil(total / limit);
    res.render("admin", {
      name: "Admin",
      projects: projectsWithUrl,
      page,
      totalPages,
      error: null
    });
  } catch (error) {
    res.render("admin", { name: "Admin", projects: [], error: "Failed to load projects", page: 1, totalPages: 1 });
  }
});

// Handle login form submission
router.post("/login", async (req, res) => {
  const { email, Password } = req.body;
  try {
    if (email === adminEmail && Password === adminPassword) {
      if (req.session) req.session.isAdmin = true;
      // Redirect to /admin so session is used for access
      return res.redirect("/admin");
    } else {
      if (req.session) req.session.isAdmin = false;
      return res.render("home", { error: "Invalid credentials", success: null });
    }
  } catch (error) {
    if (req.session) req.session.isAdmin = false;
    console.error("Login error:", error);
    return res.render("home", { error: "Server error", success: null });
  }
});

// Logout route for admin
router.get("/logout", (req, res) => {
  if (req.session) {
    req.session.destroy(() => {
      res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
      res.setHeader("Pragma", "no-cache");
      res.setHeader("Expires", "0");
      res.setHeader("Surrogate-Control", "no-store");
      res.redirect("/");
    });
  } else {
    res.redirect("/");
  }
});

export default router;