require("dotenv").config();

const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const methodOverride = require("method-override");
const MongoStore = require("connect-mongo");
const connectDB = require("./server/config/db");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to database
connectDB();

// Set up static file serving for images
app.use("/blog_img", express.static(path.join(__dirname, "/public/img")));

// Set up body parser
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Set up cookie parser
app.use(cookieParser());

// Set up method override
app.use(methodOverride("_method"));

// Set up session management
app.use(
  session({
    secret: process.env.SESSION_SECRET || "keyboard cat",
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI,
    }),
  })
);

// Set up static file serving for other public assets
app.use(express.static("public"));

// Set up EJS view engine and layouts
app.set("view engine", "ejs");
app.set("layout", "layouts/main");

// Set up express-ejs-layouts
app.use(expressLayouts);

// Route handling
app.use("/", require("./server/routes/main"));
app.use("/", require("./server/routes/admin"));

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
