const expressAsyncHandler = require("express-async-handler");
const User = require("../../models/user/User");
const crypto = require("crypto");
const generateToken = require("../../config/token/generateToken");
const validateMongodbId = require("../../utils/validateMongodbID");
const dotenv = require("dotenv");
dotenv.config();
const API_KEY = process.env.API_KEY;
const DOMAIN = process.env.DOMAIN;

const mailgun = require("mailgun-js");
const cloudinaryUploadImage = require("../../utils/cloudinary");
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
// GENERATE EMAIL VERIFICATION TOKEN
// -------------------------------------

const generateVerificationTokenCtrl = expressAsyncHandler(async (req, res) => {
  // Getting the user id
  const loginUserId = req.user.id;
  const user = await User.findById(loginUserId);
  try {
    // Generates token
    const verificationToken = await user.createAccountVerificationToken();
    // Save User
    await user.save();
    console.log(verificationToken);

    const resetURL = `If you were requested to verify your account, verify now within 10 minutes, otherwise ignore this message 
    <a href="http://localhost:3000/verify-account/${verificationToken}">Click to verify your account</a>`;
    const data = {
      from: "BeatsCode Blog App <andre@beatscode.com>",
      to: "ndre322@gmail.com",
      subject: "BeatsCode Blog App",
      text: "Token verification",
      html: resetURL,
    };
    mg.messages().send(data, function (error, body) {
      console.log(body);
    });
    res.json(resetURL);
  } catch (error) {
    res.json(error);
  }
});

//------------------------------
// ACCOUNT VERIFICATION
//------------------------------

const accountVerificationCtrl = expressAsyncHandler(async (req, res) => {
  const { token } = req.body;
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  //Find this user by token

  const userFound = await User.findOne({
    accountVerificationToken: hashedToken,
    accountVerificationTokenExpires: { $gt: new Date() },
  });
  if (!userFound) throw new Error("Token expired, try again later");
  //update the proprt to true
  userFound.isAccountVerified = true;
  userFound.accountVerificationToken = undefined;
  userFound.accountVerificationTokenExpires = undefined;
  await userFound.save();
  res.json(userFound);
});

//------------------------------
// FORGET TOKEN GENERATOR
//------------------------------

const forgetPasswordToken = expressAsyncHandler(async (req, res) => {
  // FINF THE USER BY EMAIL
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) throw new Error("User not found, try again");

  try {
    const token = await user.createPasswordResetToken();
    console.log(token);
    await user.save();

    const resetURL = `If you were requested to reset your password, reset now within 10 minutes, otherwise ignore this message 
    <a href="http://localhost:3000/reset-password/${token}">Click to reset</a>`;
    const data = {
      from: "marketingBeatscode@gmail.com",
      to: email,
      subject: "Reset Password",
      html: resetURL,
    };

    const emailMsg = mg.messages().send(data, function (error, body) {
      console.log(body);
    });
    res.json({
      msg: `A verification message has been successfully sent to ${user?.email}. Reset now within 10 minutes, ${resetURL}`,
    });
  } catch (error) {
    res.json(error);
  }
});

//------------------------------
// PASSWORD RESET
//------------------------------

const passwordResetCtrl = expressAsyncHandler(async (req, res) => {
  const { token, password } = req.body;
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  // Find this user by token
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) throw new Error("Token expired, try again later");

  //Update/change the password
  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  res.json(user);
});

//------------------------------
// PROFILE PHOTO UPLOAD
//------------------------------

const profilePhotoUploadCtrl = expressAsyncHandler(async (req, res) => {
  // Find the login user
  const { _id } = req.user;

  // 1. Get the image path
  const localPath = `public/images/profile/${req.file.filename}`;

  // 2. Upload the photo to Cloudinary
  const imgUploaded = await cloudinaryUploadImage(localPath);

  const foundUser = await User.findByIdAndUpdate(
    _id,
    {
      profilePhoto: imgUploaded?.url,
    },
    { new: true }
  );

  res.json(foundUser);
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
  accountVerificationCtrl,
  forgetPasswordToken,
  passwordResetCtrl,
  profilePhotoUploadCtrl,
};
