const express = require("express");
const { createCommentCtrl } = require("../../controllers/comments/commentCtrl");
const authMiddleware = require("../../middlewares/auth/authMiddleware");

const CommentsRoutes = express.Router();

CommentsRoutes.post("/", authMiddleware, createCommentCtrl);

module.exports = CommentsRoutes;
