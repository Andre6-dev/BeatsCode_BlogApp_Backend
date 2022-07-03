const express = require("express");
const { createPostController } = require("../../controllers/posts/postCtrl");
const authMiddleware = require("../../middlewares/auth/authMiddleware");

const postRoute = express.Router();

postRoute.post("/", authMiddleware, createPostController);

module.exports = postRoute;
