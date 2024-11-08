const mongoose = require("mongoose");

let isConnected = false;

const connectMongo = async () => {
  if (isConnected) {
    console.log("Using existing database connection to Mongo");
    return;
  }

  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    isConnected = conn.connections[0].readyState;
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (e) {
    console.log(`Error: ${e.message}`);
    process.exit(1);
  }
};

module.exports = connectMongo;
