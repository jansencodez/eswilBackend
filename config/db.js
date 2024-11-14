const mongoose = require("mongoose");

let isConnected = false;

const connectDB = async () => {
  if (isConnected) {
    console.log("Using existing database connection to Mongo");
    return;
  }

  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    isConnected = conn.connections[0].readyState === 1;
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn; // Optional: Return the connection object
  } catch (e) {
    console.error(`Error connecting to MongoDB: ${e.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
