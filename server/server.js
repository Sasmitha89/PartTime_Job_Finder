const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

const authRoutes = require("./routes/authRoutes");

app.use("/api/auth", authRoutes);

const jobRoutes = require("./routes/jobRoutes");
app.use("/api/jobs", jobRoutes);

const applicationRoutes = require("./routes/applicationRoutes");
app.use("/api/applications", applicationRoutes);


// Test route
app.get("/", (req, res) => {
res.send("Job Finder API is running 🚀");
});

// Port
const PORT = process.env.PORT || 5000;


// DB Connection
mongoose
.connect(process.env.MONGO_URI)
.then(() => {
    console.log("MongoDB Connected");
    app.listen(PORT, () =>
    console.log(`Server running on port ${PORT}`)
    );
})
.catch((err) => console.log(err));
