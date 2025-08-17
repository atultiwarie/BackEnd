const express = require("express");
const router = express.Router();
const User = require("../models/users");
const userValidationSchema = require("../schemas/userValidation");


router.get("/", (req, res) => {
  res.render("index", { error: null, success: null });
});


router.post("/register", async (req, res) => {
  try {
    const { error } = userValidationSchema.validate(req.body);
    if (error) {
      return res.render("index", {
        error: error.details[0].message,
        success: null,
      });
    }
    const user = new User(req.body);
    await user.save();

    res.render("index", {
      error: null,
      success: "User registered successfully!",
    });
  } catch (err) {
    res.render("index", { error: "Error: " + err.message, success: null });
  }
});

module.exports = router;
