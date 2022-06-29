const expressAsyncHandler = require("express-async-handler");
const PATH = '../../models/user/'
const User = require(PATH + 'User');
const express = require("express");

// -------------------------------------
// Register
// -------------------------------------
const userRegisterCtrl = expressAsyncHandler(async (req, res) => {

    // CHECK IF USER EXISTS
    const userExists = await User.findOne({email: req?.body?.email});

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
    const {email, password} = req.body;
    // Check if user exists
    const userFound = await User.findOne({ email });
    // Check if both passwords are equal
    if (userFound && (await  userFound.isPasswordMatched(password))) {
        res.json(userFound);
    } else {
        res.status(401);
        throw new Error("Invalid Login Credentials")
    }
});

module.exports = {userRegisterCtrl, loginUserCtrl};