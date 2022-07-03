const expressAsyncHandler = require("express-async-handler");
const Comment = require("../../models/comment/Comment");

const createCommentCtrl = expressAsyncHandler(async (req, res) => {
  // 1.Get the user
  const user = req.user;
  // 2.Get the post Id
  const { postId, description } = req.body;
  console.log(description);
  try {
    const comment = await Comment.create({
      post: postId,
      user,
      description,
    });
    res.json(comment);
  } catch (error) {
    res.json(error);
  }
});

module.exports = { createCommentCtrl };
