const mongoose = require("mongoose");

const dbConnect = () => {
  mongoose.connect(process.env.MONGO_URI, {})
    .then(() => {
      console.log("Connected successfully to mongodb");
    })
    .catch((error) => {
      console.log(error);
    });
};

module.exports = dbConnect;