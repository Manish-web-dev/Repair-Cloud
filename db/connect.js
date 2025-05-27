import mongoose from "mongoose";

export const connectDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI); // Removed deprecated options
    console.log("Database connection successful");
  } catch (error) {
    console.error("Database connection error:", error.message);
    throw error; // Rethrow the error to handle it in server.js
  }
};