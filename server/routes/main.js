const express = require("express");
const router = express.Router();
const Post = require("../models/post");

/**
 * GET /
 * HOME
 */
router.get("", async (req, res) => {
  try {
    const locals = {
      title: "Blog Website",
      description: "Welcome to my blog website",
    };

    const perPage = 5;
    const page = parseInt(req.query.page) || 1;
    const skip = perPage * (page - 1);

    const [data, count] = await Promise.all([
      Post.find().sort({ createdAt: -1 }).skip(skip).limit(perPage),
      Post.countDocuments(),
    ]);

    const hasNextPage = page * perPage < count;

    res.render("index", {
      locals,
      data,
      current: page,
      nextPage: hasNextPage ? page + 1 : null,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
});

router.get("/about", (req, res) => {
  res.render("about");
});

router.get("/contact", (req, res) => {
  res.render("contact");
});

/**
 * GET /
 * Post: id
 */
router.get("/post/:id", async (req, res) => {
  try {
    const postId = req.params.id;

    const data = await Post.findById(postId);
    if (!data) {
      return res.status(404).send("Post not found");
    }

    const locals = {
      title: data.title,
      blog_img: data.blog_img,
      description: "Welcome to my blog website",
    };
    res.render("post", { locals, data });
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
});

/**
 * POST /
 * Post: search
 */
router.post("/search", async (req, res) => {
  try {
    const locals = {
      title: "Blog Website",
      description: "Welcome to my blog website",
    };

    const searchTerm = req.body.searchTerm.trim();
    const searchRegex = new RegExp(searchTerm, "i");

    const data = await Post.find({
      $or: [
        { title: { $regex: searchRegex } },
        { body: { $regex: searchRegex } },
      ],
    });

    res.render("search", { data, locals });
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
