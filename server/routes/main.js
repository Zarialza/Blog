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
    let perPage = 5;
    let page = req.query.page || 1;

    const data = await Post.aggregate([
      // Sort documents by createdAt in descending order
      { $sort: { createdAt: -1 } },
      // Skip documents to achieve pagination
      { $skip: perPage * (page - 1) },
      // Limit the number of documents to the size of a page
      { $limit: perPage },
    ]);

    const count = await Post.countDocuments();
    const nextPage = parseInt(page) + 1;
    const hasNextPage = nextPage <= Math.ceil(count / perPage);

    res.render("index", {
      locals,
      data,
      current: page,
      nextPage: hasNextPage ? nextPage : null,
    });
  } catch (error) {
    console.log(error);
  }
});

// Insert post data

// function insertPostData() {
//   Post.insertMany([
//     {
//       title: "Starting Out",
//       content:
//         "This is my first project. I am very excited to work on this project. I hope you like it.",
//       blog_img: "/img/blog-img.webp",
//     },
//     {
//       title: "Inventory Management System",
//       content:
//         "This is my second project. I am very excited to work on this project. I hope you like it.",
//       blog_img: "/img/IMS.webp",
//     },
//     {
//       title: "E-commerce Website",
//       content:
//         "This is my third project. I am very excited to work on this project. I hope you like it.",
//       blog_img: "/img/Ecom.webp",
//     },
//   ]);
// }

// insertPostData();

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
    let slug = req.params.id;

    const data = await Post.findById({ _id: slug });
    const locals = {
      title: data.title,
      description: "Welcome to my blog website",
    };
    res.render("post", { locals, data });
  } catch (error) {
    console.log(error);
  }
});

/**
 * GET /
 * Post: search
 */

router.post("/search", async (req, res) => {
  try {
    const locals = {
      title: "Blog Website",
      description: "Welcome to my blog website",
    };
    let searchTerm = req.body.searchTerm;
    const searchNoSpecialChars = searchTerm.replace(/[^a-zA-Z0-9]/g, "");
    const data = await Post.find({
      $or: [
        { title: { $regex: new RegExp(searchNoSpecialChars, "i") } },
        { body: { $regex: new RegExp(searchNoSpecialChars, "i") } },
      ],
    });

    res.render("search", { data, locals });
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
