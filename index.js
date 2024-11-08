const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
require("dotenv").config();
const studentsRoutes = require("./routes/students");
const adminsRoutes = require("./routes/admins");
const teacherRoutes = require("./routes/teachers");
const updateRoutes = require("./routes/update");
const connectMongo = require("./config/mongo");

const app = express();
const port = process.env.PORT || 3001;

// Connect to MongoDB
connectMongo();

// Middleware
app.use(helmet()); // Security headers
const allowedOrigins = process.env.FRONTEND_URL || "http://localhost:3000"; // Change this to your frontend URL

app.use(
  cors({
    origin: allowedOrigins, // Allow only this origin
    methods: ["GET", "POST", "PUT", "DELETE"], // Allow specific HTTP methods
    allowedHeaders: ["Content-Type", "Authorization"], // Specify allowed headers
    credentials: true, // Allow cookies or authentication headers
  })
); // CORS setup
app.use(bodyParser.json());

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Routes
app.use("/api/students", studentsRoutes);
app.use("/api/admins", adminsRoutes);
app.use("/api/teachers", teacherRoutes);
app.use("/api/update", updateRoutes);

// Health Check Endpoint
app.get("/health", (req, res) => {
  res.json({ status: "Server is up and running" });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);

  if (err.name === "ValidationError") {
    return res
      .status(400)
      .json({ error: "Validation error", details: err.errors });
  }

  res.status(500).json({ error: "Something went wrong!" });
});

// Start Server
const server = app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// Graceful Shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received. Closing server...");
  server.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
});
