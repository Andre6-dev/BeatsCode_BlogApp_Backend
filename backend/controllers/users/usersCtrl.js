const expressAsyncHandler = require("express-async-handler");
const User = require("../../models/user/User");

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

module.exports = {userRegisterCtrl};