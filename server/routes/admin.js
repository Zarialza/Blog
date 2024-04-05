const express = require("express");
const router = express.Router();
const Post = require("../models/post");
const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

/**
 * GET /
 * Admin -login
 */

router.get("/admin", async (req, res) => {
  try {
    const locals = {
      title: "Admin",
      description: "Admin page",
    };

    res.render("admin/index", { locals, layout: "../views/layouts/admin" });
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;

/**
 * POST /
 * Admin - check login
 */

router.post("/admin", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (req.body.username === "username" && req.body.password === "password") {
      res.send("Logged in!");
    } else {
      res.send("Wrong credentials!");
    }
    res.redirect("admin");
  } catch (error) {
    console.log(error);
  }
});

/**
 * POST /
 * Admin - check register
 */

router.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
      const user = await User.create({ username, password: hashedPassword });
      return res.status(201).json({ message: "User Created", user }); // Return to prevent further execution
    } catch (error) {
      if (error.code === 11000) {
        return res.status(409).json({ message: "Username already exists" }); // Return to prevent further execution
      }
      return res.status(500).json({ message: "Error creating user" }); // Moved inside catch to prevent execution after response
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "An error occurred" }); // Ensure a response is sent on error
  }
});
