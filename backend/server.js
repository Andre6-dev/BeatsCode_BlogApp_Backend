const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
dotenv.config();
const dbConnect = require("./config/db/dbConnect");
const userRoutes = require("./route/users/usersRoute");
const { errorHandler, notFound } = require("./middlewares/error/errorHandler");
const postRoute = require("./route/posts/postRoute");
const commentsRoutes = require("./route/comments/commentRoute");
const emailRoutes = require("./route/emailMsg/emailMsgRoute");
const categoryRoute = require("./route/category/categoryRoute");

const app = express();
//DB
dbConnect();

// MIDDLEWARE
/* Allow us to receive parameters in Json format*/
app.use(express.json());

// CORS
app.use(cors());

// USERS ROUTES
app.use("/api/users", userRoutes);

// POSTS ROUTES
app.use("/api/posts", postRoute);

// COMMENT ROUTES
app.use("/api/comments", commentsRoutes);

// EMAIL ROUTES
app.use("/api/email", emailRoutes);

// CATEGORY ROUTES
app.use("/api/category", categoryRoute);

// ERROR HANDLER
app.use(notFound); // We put this error in this order because we need the message before we executed the next app.use(error Handler)
app.use(errorHandler);
// SERVER
const PORT = process.env.PORT || 5000;
app.listen(PORT, console.log(`Server is running on port ${PORT}`));
