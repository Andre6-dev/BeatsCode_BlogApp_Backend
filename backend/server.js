const express = require('express');
const dotenv = require('dotenv');

dotenv.config();

const dbConnect = require("./config/db/dbConnect");

const app = express();

//DB 
dbConnect();
console.log(process.env);

// SERVER 
const PORT = process.env.PORT || 3000;
app.listen(PORT, console.log(`Server is running on port ${PORT}`));