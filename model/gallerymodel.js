import mongoose from "mongoose";

const galleryImageSchema = new mongoose.Schema({
  imageUrl: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const GalleryImage = mongoose.models.GalleryImage || mongoose.model("GalleryImage", galleryImageSchema);

export default GalleryImage;
