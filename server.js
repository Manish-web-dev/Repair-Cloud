import express from "express";
import session from "express-session";
import dotenv from "dotenv";
import { connectDatabase } from "./db/connect.js";
import contactRouter from "./routers/contactrouter.js";
import AdminRouter from "./routers/Adminrouter.js";
import projectRouter from "./routers/projectrouter.js";
import Project from "./model/projectschema.js";
import galleryRouter from "./routers/galleryrouter.js";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import MongoStore from "connect-mongo"; // <-- add this line

dotenv.config();

const app = express();
const port = process.env.PORT || 25000;

// ESM __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure uploads and uploads/gallery directories exist
const uploadsDir = path.join(__dirname, "uploads");
const galleryDir = path.join(uploadsDir, "gallery");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
if (!fs.existsSync(galleryDir)) fs.mkdirSync(galleryDir, { recursive: true });

// Add session middleware with MongoDB store
app.use(session({
  secret: process.env.SESSION_SECRET || "your_secret_key",
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI,
    collectionName: "sessions"
  }),
  cookie: { secure: process.env.NODE_ENV === "production" }
}));

// EJS setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Static files (css, js, images)
app.use(express.static(path.join(__dirname, 'public')));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
// Parse form data
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Middleware to log incoming requests
app.use((req, res, next) => {
  console.log(`Incoming request: ${req.method} ${req.url}`);
  next();
});


// Home page (renders home.ejs) and always destroys session
app.get("/", async (req, res) => {
  if (req.session && req.session.isAdmin) {
    req.session.destroy(async () => {
      try {
        const projects = await Project.find().sort({ createdAt: -1 });
        const projectsWithUrl = projects.map(p => ({
          ...p.toObject(),
          imageUrl: p.image ? `/uploads/${p.image}` : null // <-- fix: always use /uploads/filename
        }));
        res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
        res.setHeader("Pragma", "no-cache");
        res.setHeader("Expires", "0");
        res.setHeader("Surrogate-Control", "no-store");
        res.render("home", { success: null, error: null, projects: projectsWithUrl });
      } catch (err) {
        res.render("home", { success: null, error: "Failed to load projects", projects: [] });
      }
    });
  } else {
    try {
      const projects = await Project.find().sort({ createdAt: -1 });
      const projectsWithUrl = projects.map(p => ({
        ...p.toObject(),
        imageUrl: p.image ? `/uploads/${p.image}` : null // <-- fix: always use /uploads/filename
      }));
      res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
      res.setHeader("Pragma", "no-cache");
      res.setHeader("Expires", "0");
      res.setHeader("Surrogate-Control", "no-store");
      res.render("home", { success: null, error: null, projects: projectsWithUrl });
    } catch (err) {
      res.render("home", { success: null, error: "Failed to load projects", projects: [] });
    }
  }
});

// Add this route for gallery
app.get("/gallery", (req, res) => {
  res.render("gallery");
});

// Use the contact router for form submissions
app.use("/", contactRouter);
app.use("/", AdminRouter);
app.use("/", projectRouter);
app.use("/gallery-images", galleryRouter);

// Default 404 route (render a simple 404 page instead of JSON)
app.use((req, res) => {
  res.status(404).render("404", { url: req.originalUrl });
});

// Connect to the database
connectDatabase()
  .then(() => {
    app.listen(port, () => {
      console.log(`Server running at http://localhost:${port}`);
    });
  })
  .catch((error) => {
    console.error("Failed to connect to the database. Server not started.", error);
  });