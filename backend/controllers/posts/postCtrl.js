const expressAsyncHandler = require("express-async-handler");
const Filter = require("bad-words");
const fs = require("fs");
const Post = require("../../models/post/Post");
const validateMongodbId = require("../../utils/validateMongodbID");
const User = require("../../models/user/User");
const cloudinaryUploadImage = require("../../utils/cloudinary");

//------------------------------
// CREATE POST
//------------------------------
const createPostController = expressAsyncHandler(async (req, res) => {
  const { _id } = req.user;
  // We need the login user id to validate the post
  //validateMongodbId(req.body.user);

  // Check for bad words
  filter = new Filter();
  const isProfane = filter.isProfane(req.body.title, req.body.description);

  // Block User
  if (isProfane) {
    await User.findByIdAndUpdate(_id, {
      isBlocked: true,
    });
    throw new Error(
      "Creating failed because it contains profane words and you have been blocked"
    );
  }

  // 1. Get the image path
  const localPath = `public/images/posts/${req.file.filename}`;

  // 2. Upload the photo to Cloudinary
  const imgUploaded = await cloudinaryUploadImage(localPath);

  try {
    /* const post = await Post.create({
      ...req.body,
      image: imgUploaded?.url,
      user: _id,
    }); */
    res.json(imgUploaded);

    // Remove uploaded image
    fs.unlinkSync(localPath);
  } catch (error) {
    res.json(error);
  }
});

//------------------------------
// FETCH ALL POSTS
//------------------------------
const fetchPostsCtrl = expressAsyncHandler(async (req, res) => {
  try {
    const posts = await Post.find({}).populate("user");
    res.json(posts);
  } catch (error) {
    res.json(error);
  }
});

module.exports = { createPostController, fetchPostsCtrl };
