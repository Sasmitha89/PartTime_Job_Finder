const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
{
    name: {
    type: String,
    required: true,
    trim: true
    },

    email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
    },

    password: {
    type: String,
    required: true
    },

    role: {
    type: String,
    enum: ["jobseeker", "employer"],
    default: "jobseeker"
    },

    skills: [String],

    location: {
    type: String
    }
},
{ timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
