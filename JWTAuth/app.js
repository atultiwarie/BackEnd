require("dotenv").config();
const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;
const path = require("path");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");

const connectDB = require("./config/db");
const User = require("./models/user-model");

// Set up view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Middleware
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// connect to the database
connectDB();

// Home Route

app.get("/", (req, res) => {
  res.send("Welcome to the Home Page");
});

// REGISTER
// Render the registration page

app.get("/register", (req, res) => {
  res.render("register");
});

// Handle registration form submission
app.post("/register", async (req, res) => {
  const { username, password, email } = req.body;

  try {
    if (!username || !password || !email) {
      return res.status(400).send("All fields are required");
    }
    const hashedPassword = await bcrypt.hash(password, 10); // Hash the password
    const newUser = await User.create({
      username,
      password: hashedPassword,
      email,
    });
    res.redirect("/login");
  } catch (error) {
    console.error("Error registering user:", error.message);
    res.status(500).json({ error: "Server Error" });
  }
});
// LOGIN
// Render the login page

app.get("/login", (req, res) => {
  res.render("login");
});

// Handle login form submission
app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const oneUser = await User.findOne({ username });
    if (!oneUser) return res.status(400).send("User not found");

    const compare = await bcrypt.compare(password, oneUser.password);
    if (!compare) return res.status(400).send("Invalid username or password");

    const token = jwt.sign(
      {
        id: oneUser._id,
        username: oneUser.username,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.cookie("token", token);

    res.redirect("/dashboard");
  } catch (error) {
    console.error("Error during login:", error.message);
    return res.status(500).json({ error: "Server Error" });
  }
});

app.get("/dashboard", (req, res) => {
  const token = req.cookies.token;

  if (!token) {
    return res.redirect("/login");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    res.render("dashboard", {
      user: {
        username: decoded.username,
        id: decoded.id,
      },
    });
  } catch (err) {
    console.error("Token verification failed:", err.message);
    res.clearCookie("token");
    return res.redirect("/login");
  }
});

app.post("/logout", (req, res) => {
  res.clearCookie("token");
  res.redirect("/login");
});

app.listen(PORT, () => {
  console.log(`Server is running on port : http://localhost:${PORT}`);
});
