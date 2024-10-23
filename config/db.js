const mysql = require("mysql2"); // Make sure to import mysql2
require("dotenv").config(); // Load environment variables from .env file

// Create a MySQL connection
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
});

// Function to connect to the database
function connectDB() {
  db.connect((err) => {
    if (err) {
      console.error("Error connecting to the database:", err.message); // Log error details
    } else {
      console.log("Connected to MySQL");
    }
  });
}

module.exports = { db, connectDB }; // Export both db and connectDB
