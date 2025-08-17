const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config();

const connectDB = require('./config/db');
const userRoutes = require("./routes/userRoutes");

const app = express();

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// EJS setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Routes
app.use("/", userRoutes);

// Start Server
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
