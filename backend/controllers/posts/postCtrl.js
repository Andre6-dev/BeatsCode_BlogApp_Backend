const expressAsyncHandler = require("express-async-handler");
const Post = require("../../models/post/Post");
const validateMongodbId = require("../../utils/validateMongodbID");

const createPostController = expressAsyncHandler(async (req, res) => {
  // We need the login user id to validate the post
  validateMongodbId(req.body.user);
  try {
    const post = await Post.create(req.body);
    res.json(post);
  } catch (error) {
    res.json(error);
  }

  res.json("Post controller");
});

module.exports = { createPostController };
