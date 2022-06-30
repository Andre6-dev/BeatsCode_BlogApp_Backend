const expressAsyncHandler = require('express-async-handler');

const jwt = require('jsonwebtoken');
const User = require('../../models/user/User');

const authMiddleware = expressAsyncHandler(async (req, res, next) => {
    let token;

    /* This function allow us to verify the headers throughout the token. */
    if(req?.headers?.authorization?.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(" ")[1];
            /* If we have a token execute this */
            if(token) {
                /* Using the token that I provided in the .env variable*/
                const decoded = jwt.verify(token, process.env.JWT_KEY);
                // FIND THE USER BY ID OF THE LOGGING USER
                const user = await User.findById(decoded?.id).select("-password");
                // ATTACH THE USER TO THE REQUEST OBJECT
                req.user = user
                next();
            } else {
                throw new Error('There is no token attached to the header')
            }
        } catch (error) {
            throw new Error('Not Authorized token expired, login again');
        }
    }
});

module.exports = authMiddleware;