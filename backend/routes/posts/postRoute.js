const express = require("express");
const {
  createPostController,
  fetchPostsCtrl,
  fetchPostCtrl,
} = require("../../controllers/posts/postCtrl");
const authMiddleware = require("../../middlewares/auth/authMiddleware");
const {
  photoUpload,
  postImageResize,
} = require("../../middlewares/uploads/photoUpload");

const postRoute = express.Router();

postRoute.post(
  "/",
  authMiddleware,
  photoUpload.single("image"),
  postImageResize,
  createPostController
);

postRoute.get("/", fetchPostsCtrl);
postRoute.get("/:id", fetchPostCtrl); // Single post

module.exports = postRoute;
