const express = require("express");
const { createPostController } = require("../../controllers/posts/postCtrl");
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

module.exports = postRoute;
