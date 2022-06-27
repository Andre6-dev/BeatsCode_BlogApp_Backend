const mongoose = require('mongoose');

const dbConnect = async () => {
    try{
        await mongoose.connect(process.env.MONGODB_URL);
        console.log("DB is Connected Successfully");
    } catch(err){
        console.log(`Error ${err.message}`);
    }
};

module.exports = dbConnect;