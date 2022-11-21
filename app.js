require("dotenv").config();

const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const multer = require("multer");

const feedRoutes = require("./routes/feed");
const authRoutes = require("./routes/auth");

const DB_NAME = process.env.DB_NAME;
const DB_USER = process.env.DB_USER;
const MONGODB_URI = `mongodb+srv://${DB_USER}@cluster0.gkrbr.mongodb.net/${DB_NAME}`;

const app = express();

// use body parser to parse the incoming data
// app.use(bodyParser.urlencoded); // x-www-form-urlencoded <form>
app.use(bodyParser.json()); // application/json

/** Multer Setup **/

// use multer to parse the incoming files -- in our case it is a single image file
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "images"),
  filename: (req, file, cb) =>
    cb(null, new Date().toISOString().replace(/\-/g, "").replace(/\:/g, "") + "-" + file.originalname),
});

const fileFilter = (req, file, cb) => {
  const fileTypes = ["image/png", "image/jpg", "image/jpeg"];
  if (fileTypes.includes(file.mimetype)) cb(null, true);
  else cb(null, false);
};

app.use(multer({ storage, fileFilter }).single("image"));

// Static File Handling - Images
app.use("/images", express.static(path.join(__dirname, "images")));

// Cors Setup
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

/**
 * Route Handling
 */
app.use("/feed", feedRoutes);
app.use("/auth", authRoutes);

// Error Handling Middleware
app.use(
  /**
   *
   * @param {import("express").ErrorRequestHandler} error
   * @param {*} req
   * @param {import("express").Response} res
   * @param {*} next
   */
  (error, req, res, next) => {
    console.log({ error });
    const statusCode = error.statusCode || 501;
    res.status(statusCode).json({ message: error.message, data: error.data });
  }
);

(async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    const server = app.listen(8080, () => console.log("Server started listening on port: " + 8080));
    // Setup websocket with socket.io
    // All the other http requests will work as before, websocket protocol will not intervene them
    const io = require("./socket").init(server);
    // Listen for every client connection
    io.on("connection", (socket) => {
      console.log("Client connected!");
    });
  } catch (error) {
    console.log(error);
  }
})();
