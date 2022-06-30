const expressAsyncHandler = require("express-async-handler");
const PATH = "../../models/user/";
const User = require(PATH + "User");
const express = require("express");
const generateToken = require("../../config/token/generateToken");
const validateMongodbId = require("../../utils/validateMongodbID");

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
      lastName: userFound?.isAdmin,
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

module.exports = {
  userRegisterCtrl,
  loginUserCtrl,
  fetchUsersCtrl,
  deleteUsersCtrl,
  fetchUsersDetailsCtrl,
  userProfileCtrl,
};
