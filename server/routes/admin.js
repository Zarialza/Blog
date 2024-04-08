const express = require("express");
const router = express.Router();
const Post = require("../models/post");
const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const multer = require("multer");
const path = require("path");

// Set storage engine
const storage = multer.diskStorage({
  destination: "./public/img",
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

// Init upload
const upload = multer({
  storage: storage,
  limits: { fileSize: 1000000 }, // Limit file size to 1MB, adjust as needed
}).single("blog_img"); // 'blog_img' is the name of your file input field

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

router.get("/admin", getAdminPage);
router.post("/admin", postAdminLogin);
router.get("/dashboard", checkAuth, getDashboard);
router.get("/add-post", checkAuth, getAddPostPage);
router.post("/add-post", checkAuth, upload, postAddPost);
router.post("/register", postRegister);
router.get("/edit-post/:id", checkAuth, getEditPostPage);
router.put("/edit-post/:id", checkAuth, putEditPost);

async function getAdminPage(req, res) {
  try {
    const locals = {
      title: "Admin",
      description: "Admin page",
    };

    res.render("admin/index", { locals, layout: "../views/layouts/admin" });
  } catch (error) {
    console.log(error);
  }
}

async function postAdminLogin(req, res) {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    res.cookie("token", token, { httpOnly: true });

    res.redirect("/dashboard");
  } catch (error) {
    console.log(error);
  }
}

async function getDashboard(req, res) {
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
}

async function getAddPostPage(req, res) {
  try {
    const locals = {
      title: "Admin",
      description: "Admin page",
    };

    const data = await Post.find();
    res.render("admin/add-post", {
      locals,
      data,
      layout: "../views/layouts/admin",
    });
  } catch (error) {
    console.log(error);
  }
}

async function postAddPost(req, res) {
  try {
    const newPost = new Post({
      title: req.body.title,
      blog_img: req.file ? req.file.filename : "",
      content: req.body.content,
    });

    await Post.create(newPost);

    res.redirect("/dashboard");
  } catch (error) {
    console.log(error);
  }
}

async function postRegister(req, res) {
  try {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
      const user = await User.create({ username, password: hashedPassword });
      return res.status(201).json({ message: "User Created", user });
    } catch (error) {
      if (error.code === 11000) {
        return res.status(409).json({ message: "Username already exists" });
      }
      return res.status(500).json({ message: "Error creating user" });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "An error occurred" });
  }
}

async function getEditPostPage(req, res) {
  try {
    const locals = {
      title: "Admin",
      description: "Admin page",
    };

    const data = await Post.findById(req.params.id);

    res.render("admin/edit-post", {
      locals,
      data,
      layout: "../views/layouts/admin",
    });
  } catch (error) {
    console.log(error);
  }
}

async function putEditPost(req, res) {
  try {
    await Post.findByIdAndUpdate(req.params.id, {
      title: req.body.title,
      blog_img: req.file ? req.file.filename : "",
      content: req.body.content,
    });

    res.redirect(`/edit-post/${req.params.id}`);
  } catch (error) {
    console.log(error);
  }
}

module.exports = router;
