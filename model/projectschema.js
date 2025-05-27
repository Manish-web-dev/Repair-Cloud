import mongoose from "mongoose";

const projectSchema = new mongoose.Schema({
    projectNumber: { type: String, required: true },
    description: { type: String, required: true },
    date: { type: Date, required: true },
    image: { type: String },
    completed: { type: Boolean, default: false } // <-- add this line
}, { timestamps: true });

export default mongoose.model("Project", projectSchema);
