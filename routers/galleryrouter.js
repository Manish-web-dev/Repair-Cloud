import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import GalleryImage from "../model/gallerymodel.js";

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Multer setup for gallery images
const galleryDir = path.join(__dirname, "../uploads/gallery");
if (!fs.existsSync(galleryDir)) fs.mkdirSync(galleryDir, { recursive: true });

const galleryStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, galleryDir);
  },
  filename: function (req, file, cb) {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  }
});
const galleryUpload = multer({ 
    storage: galleryStorage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        if (!file.mimetype.startsWith('image/')) {
            return cb(new Error('Only image files are allowed!'), false);
        }
        cb(null, true);
    }
});

// GET all gallery images
router.get("/", async (req, res) => {
  try {
    const images = await GalleryImage.find().sort({ createdAt: -1 });
    const imagesWithUrl = images.map(img => ({
      _id: img._id,
      imageUrl: img.imageUrl.startsWith("/uploads/") ? img.imageUrl : "/uploads/gallery/" + img.imageUrl,
      createdAt: img.createdAt
    }));
    res.json(imagesWithUrl);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch images" });
  }
});

// POST upload a new gallery image
router.post("/", galleryUpload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, error: "No image uploaded" });
    const img = new GalleryImage({
      imageUrl: "/uploads/gallery/" + req.file.filename
    });
    await img.save();
    res.json({ success: true, image: img });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to upload image" });
  }
});

// DELETE a gallery image
router.delete("/:id", async (req, res) => {
  try {
    const img = await GalleryImage.findByIdAndDelete(req.params.id);
    if (img) {
      const filePath = path.join(__dirname, "../", img.imageUrl);
      fs.unlink(filePath, () => {});
      res.json({ success: true });
    } else {
      res.status(404).json({ success: false, error: "Image not found" });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to delete image" });
  }
});

export default router;
