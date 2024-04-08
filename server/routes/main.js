const express = require("express");
const router = express.Router();
const Post = require("../models/post");

const handleAsync = (callback) => {
  return async (req, res, next) => {
    try {
      await callback(req, res, next);
    } catch (error) {
      console.error("Error:", error);
      res.status(500).send("Internal Server Error");
    }
  };
};

router.get("/", handleAsync(getHomePage));
router.get("/about", (req, res) => res.render("about"));
router.get("/contact", (req, res) => res.render("contact"));
router.get("/post/:id", handleAsync(getPostById));
router.post("/search", handleAsync(searchPosts));

async function getHomePage(req, res) {
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
}

async function getPostById(req, res) {
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
}

async function searchPosts(req, res) {
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
}

module.exports = router;
