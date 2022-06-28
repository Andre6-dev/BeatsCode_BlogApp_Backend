const express = require('express');
const dotenv = require('dotenv');
dotenv.config();
const dbConnect = require("./config/db/dbConnect");
const userRoutes = require("./routes/users/usersRoute");
const {errorHandler, notFound} = require("./middlewares/error/errorHandler");

const app = express();
//DB 
dbConnect();

// MIDDLEWARE
app.use(express.json());

// USERS ROUTE
app.use("/api/users", userRoutes);

// ERROR HANDLER
app.use(notFound); // We put this error in this order because we need the message before we executed the next app.use(error Handler)
app.use(errorHandler);
// SERVER 
const PORT = process.env.PORT || 3000;
app.listen(PORT, console.log(`Server is running on port ${PORT}`));