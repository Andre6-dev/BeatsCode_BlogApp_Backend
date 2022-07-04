const express = require("express");
const dotenv = require("dotenv");
dotenv.config();
const dbConnect = require("./config/db/dbConnect");
const userRoutes = require("./routes/users/usersRoute");
const { errorHandler, notFound } = require("./middlewares/error/errorHandler");
const postRoute = require("./routes/posts/postRoute");
const commentsRoutes = require("./routes/comments/commentRoute");
const emailRoutes = require("./routes/emailMsg/emailMsgRoute");

const app = express();
//DB
dbConnect();

// MIDDLEWARE
/* Allow us to receive parameters in Json format*/
app.use(express.json());

// USERS ROUTES
app.use("/api/users", userRoutes);

// POSTS ROUTES
app.use("/api/posts", postRoute);

// COMMENT ROUTES
app.use("/api/comments", commentsRoutes);

// EMAIL ROUTES
app.use("/api/email", emailRoutes);

// ERROR HANDLER
app.use(notFound); // We put this error in this order because we need the message before we executed the next app.use(error Handler)
app.use(errorHandler);
// SERVER
const PORT = process.env.PORT || 3000;
app.listen(PORT, console.log(`Server is running on port ${PORT}`));
