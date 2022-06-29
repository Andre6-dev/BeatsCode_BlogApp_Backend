const jwt = require('jsonwebtoken');

/* Generates a JWT TOKEN which takes the user id and returns the token */
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_KEY, { expiresIn:"30d" })
};

module.exports = generateToken;