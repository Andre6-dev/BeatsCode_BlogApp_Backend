const User = require("../../models/user/User");

// -------------------------------------
// Register
// -------------------------------------
const userRegisterCtrl = async (req, res) => {
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
    }catch (error) {
        res.json(error);
    }
};

module.exports = { userRegisterCtrl };