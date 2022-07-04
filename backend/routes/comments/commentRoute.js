const express = require("express");
const {
  createCommentCtrl,
  fetchAllCommentsCtrl,
} = require("../../controllers/comments/commentCtrl");
const authMiddleware = require("../../middlewares/auth/authMiddleware");

const commentsRoutes = express.Router();

commentsRoutes.post("/", authMiddleware, createCommentCtrl);
commentsRoutes.get("/", authMiddleware, fetchAllCommentsCtrl);

module.exports = commentsRoutes;
