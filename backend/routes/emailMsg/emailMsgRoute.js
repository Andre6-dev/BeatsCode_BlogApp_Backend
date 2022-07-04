const express = require("express");
const { sendEmailMsgCtrl } = require("../../controllers/emailMsg/emailMsgCtrl");

const authMiddleware = require("../../middlewares/auth/authMiddleware");

const emailRoutes = express.Router();

emailRoutes.post("/", authMiddleware, sendEmailMsgCtrl);

module.exports = emailRoutes;
