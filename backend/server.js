const express = require('express');
const dotenv = require('dotenv');

dotenv.config();

const dbConnect = require("./config/db/dbConnect");
const {userRegisterCtrl} = require("./controllers/users/usersCtrl");
const app = express();

//DB 
dbConnect();

// MIDDLEWARE
app.use(express.json());

// CUSTOM MIDDLEWARE
const logger = (req, res, next) => {
    console.log('Am a logger');
    next();
};

// 2.usage
app.use(logger)

// POST REQUEST - REGISTER
app.post("/api/users/register", userRegisterCtrl);

// POST REQUEST - LOGIN
app.post("/api/users/login", (req, res) => {
    // business logic
    res.json({user: "User Login"});
})

// FETCH ALL USERS
app.get("/api/users/", (req, res) => {
    // business logic
    res.json({user: "Fetch All Users"});
})

// SERVER 
const PORT = process.env.PORT || 3000;
app.listen(PORT, console.log(`Server is running on port ${PORT}`));