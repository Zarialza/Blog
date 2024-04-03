const express = require("express");
const router = express.Router();
const Post = require("../models/post");
const User = require("../models/post");
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
 * GET /
 * Admin - check login
 */

router.post("/admin", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (req.username === "username" && req.password === "password") {
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
 * GET /
 * Admin - check register
 */

router.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
      const user = await User.create({ username, password: hashedPassword });
      res.status(201).json({ message: "User Creater", user });
    } catch (error) {
      if (error.code === 11000) {
        res.status(409).json({ message: "Username already exists" });
      }
      res.status(500).json({ message: "Error creating user" });
    }
  } catch (error) {
    console.log(error);
  }
});
