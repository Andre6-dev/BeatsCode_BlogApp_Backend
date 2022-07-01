const expressAsyncHandler = require("express-async-handler");
const User = require("../../models/user/User");
const generateToken = require("../../config/token/generateToken");
const validateMongodbId = require("../../utils/validateMongodbID");
const dotenv = require("dotenv");
dotenv.config();
const API_KEY = process.env.API_KEY;
const DOMAIN = process.env.DOMAIN;

const mailgun = require("mailgun-js");
const mg = mailgun({ apiKey: API_KEY, domain: DOMAIN });

// -------------------------------------
// Register
// -------------------------------------
const userRegisterCtrl = expressAsyncHandler(async (req, res) => {
  // CHECK IF USER EXISTS
  const userExists = await User.findOne({ email: req?.body?.email });

  if (userExists) throw new Error("User already exists");

  try {
    // Register user
    const user = await User.create({
      /* We are establishing that the following parameters are required */
      firstName: req?.body?.firstName,
      lastName: req?.body?.lastName,
      email: req?.body?.email,
      password: req?.body?.password,
    });
    res.json(user);
  } catch (error) {
    res.json(error);
  }
});

// -------------------------------------
// Login
// -------------------------------------

const loginUserCtrl = expressAsyncHandler(async (req, res) => {
  const { email, password } = req.body;
  // Check if user exists
  const userFound = await User.findOne({ email });
  // Check if both passwords are equal
  if (userFound && (await userFound.isPasswordMatched(password))) {
    res.json({
      _id: userFound?.id,
      firstName: userFound?.firstName,
      lastName: userFound?.lastName,
      email: userFound?.email,
      profilePhoto: userFound?.profilePhoto,
      isAdmin: userFound?.isAdmin,
      token: generateToken(userFound?._id),
    });
  } else {
    res.status(401);
    throw new Error("Invalid Login Credentials");
  }
});

// -------------------------------------
// USERS - LIST
// -------------------------------------

const fetchUsersCtrl = expressAsyncHandler(async (req, res) => {
  console.log(req.headers);
  try {
    const users = await User.find({});
    res.json(users);
  } catch (error) {
    res.json(error);
  }
});

// -------------------------------------
// DELETE USER
// -------------------------------------

const deleteUsersCtrl = expressAsyncHandler(async (req, res) => {
  const { id } = req.params;

  /* Check if user id is valid */
  validateMongodbId(id);
  try {
    const deletedUser = await User.findByIdAndDelete(id);
    res.json(deletedUser);
  } catch (error) {
    res.json(error);
  }
});

// -------------------------------------
// USER DETAILS
// -------------------------------------

const fetchUsersDetailsCtrl = expressAsyncHandler(async (req, res) => {
  const { id } = req.params;
  // check if user id is valid
  validateMongodbId(id);
  try {
    const user = await User.findById(id);
    res.json(user);
  } catch (error) {
    res.json(error);
  }
});

// -------------------------------------
// USER PROFILE
// -------------------------------------

const userProfileCtrl = expressAsyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongodbId(id);
  try {
    const myProfile = await User.findById(id);
    res.json(myProfile);
  } catch (error) {
    res.json(error);
  }
});

// -------------------------------------
// UPDATE PROFILE
// -------------------------------------

const updateUserCtrl = expressAsyncHandler(async (req, res) => {
  const { _id } = req?.user;
  validateMongodbId(_id);

  const user = await User.findByIdAndUpdate(
    _id,
    {
      firstName: req?.body?.firstName,
      lastName: req?.body?.lastName,
      email: req?.body?.email,
      bio: req?.body?.bio,
    },
    {
      new: true,
      runValidators: true,
    }
  );

  res.json(user);
});

// -------------------------------------
// UPDATE PASSWORD
// -------------------------------------

const updateUserPasswordCtrl = expressAsyncHandler(async (req, res) => {
  // destructure the login user
  const { _id } = req.user;
  // this password will come from body
  const { password } = req.body;
  validateMongodbId(_id);
  // Find the user by id
  const user = await User.findById(_id);

  if (password) {
    user.password = password;
    const updatedUser = await user.save();
    res.json(updatedUser);
  } else {
    res.json(user);
  }
});

// -------------------------------------
// FOLLOWING
// -------------------------------------

const followingUserCtrl = expressAsyncHandler(async (req, res) => {
  const { followId } = req.body;
  const loginUserId = req.user.id;

  /* Find the target user and check if the login id exists. */
  const targetUser = await User.findById(followId);

  const alreadyFollowing = targetUser?.followers?.find(
    (user) => user?.toString() === loginUserId.toString()
  );

  if (alreadyFollowing) throw new Error("You already followed this user");

  /* 1. Find the user you want to follow and update it's followers field */
  await User.findByIdAndUpdate(
    followId,
    {
      $push: { followers: loginUserId },
      isFollowing: true,
    },
    { new: true }
  );

  /* 2. Update the login user following field */
  await User.findByIdAndUpdate(
    loginUserId,
    {
      $push: { following: followId },
    },
    { new: true }
  );
  res.json("You have successfully following this user");
});

// -------------------------------------
// UNFOLLOWING
// -------------------------------------

const unfollowUserCtrl = expressAsyncHandler(async (req, res) => {
  const { unFollowId } = req.body;
  const loginUserId = req.user.id;

  await User.findByIdAndUpdate(
    unFollowId,
    {
      $pull: { followers: loginUserId },
      isFollowing: false,
    },
    { new: true }
  );

  await User.findByIdAndUpdate(
    loginUserId,
    {
      $pull: { following: unFollowId },
    },
    { new: true }
  );

  res.json("You have successfully unfollowing this user");
});

// -------------------------------------
// BLOCK USER
// -------------------------------------

const blockUserCtrl = expressAsyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongodbId(id);

  const user = await User.findByIdAndUpdate(
    id,
    {
      isBlocked: true,
    },
    { new: true }
  );
  res.json(user);
});

// -------------------------------------
// UNBLOCK USER
// -------------------------------------

const unBlockUserCtrl = expressAsyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongodbId(id);

  const user = await User.findByIdAndUpdate(
    id,
    {
      isBlocked: false,
    },
    { new: true }
  );
  res.json(user);
});

// -------------------------------------
// SENDING EMAIL
// -------------------------------------

const generateVerificationTokenCtrl = expressAsyncHandler(async (req, res) => {
  // Getting the user id
  const loginUserId = req.user.id;
  const user = await User.findById(loginUserId);
  console.log(user);
  try {
    // Generates token
    const verificationToken = user.createAccountVerificationToken();
    console.log(verificationToken);

    const data = {
      from: "BeatsCode Blog App <andre@beatscode.com>",
      to: "ndre322@gmail.com",
      subject: "BeatsCode Blog App",
      text: "Testeando some Mailgun awesomness!",
    };
    mg.messages().send(data, function (error, body) {
      console.log(body);
    });
    res.json("Email sent");
  } catch (error) {
    res.json(error);
  }
});

module.exports = {
  generateVerificationTokenCtrl,
  userRegisterCtrl,
  loginUserCtrl,
  fetchUsersCtrl,
  deleteUsersCtrl,
  fetchUsersDetailsCtrl,
  userProfileCtrl,
  updateUserCtrl,
  updateUserPasswordCtrl,
  followingUserCtrl,
  unfollowUserCtrl,
  blockUserCtrl,
  unBlockUserCtrl,
};
