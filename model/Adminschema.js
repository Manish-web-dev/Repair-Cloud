 import mongoose from "mongoose";

const { Schema } = mongoose;
const adminSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        default: 'admin',
        enum: ["admin"],
    },
}, {
    timestamps: true,
});

const Admin = mongoose.model('Admin', adminSchema);
export default Admin;