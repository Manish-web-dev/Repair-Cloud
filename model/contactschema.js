 import mongoose from "mongoose";

const contactSchema = new mongoose.Schema(
  {
    Name: {
      type: String,
      required: [true, "Name must be provided"],
    },
    
    Email: {
      type: String,
      required: [true, "EmailAddress must be provided"],
    },
    Phone: {
      type: String,
      required: [true, "PhoneNumber must be provided"],
    },
    Servicetype: {
      type: String,
      required: [true, "Servicetype must be provided"],
    },
    Message: {
      type: String,
      required: [true, "Description must be provided"],
    },
  },
  {
    timestamps: true,
  }
);

const Contact = mongoose.model("Contact", contactSchema);
export default Contact;