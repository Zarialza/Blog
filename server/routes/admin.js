const express = require("express");
const router = express.Router();
const Post = require("../models/post");
const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

/**
 *
 * Check Login
 */
const checkAuth = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ message: "You need to Login" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userID = decoded.userID;
    next();
  } catch (error) {
    return res.status(401).json({ message: "You need to Login" });
  }
};

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

/**
 * POST /
 * Admin - check login
 */

router.post("/admin", async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });

    if (!user) {
      return res.status(401).json({ message: "invalid Credential" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "invalid Credential" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    res.cookie("token", token, { httpOnly: true });

    res.redirect("/dashboard");
  } catch (error) {
    console.log(error);
  }
});

/**
 * GET /
 * Admin -dashboard
 */

router.get("/dashboard", checkAuth, async (req, res) => {
  try {
    const data = await Post.find();
    const locals = {
      title: "Admin",
      description: "Admin page",
    };

    res.render("admin/dashboard", {
      locals,
      layout: "../views/layouts/admin",
      data,
    });
  } catch (error) {
    console.log(error);
  }
});

// router.post("/admin", async (req, res) => {
//   try {
//     const { username, password } = req.body;

//     if (req.body.username === "username" && req.body.password === "password") {
//       res.send("Logged in!");
//     } else {
//       res.send("Wrong credentials!");
//     }
//     res.redirect("admin");
//   } catch (error) {
//     console.log(error);
//   }
// });

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

module.exports = router;
