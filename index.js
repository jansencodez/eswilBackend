const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mysql = require("mysql2");
require("dotenv").config();
const { db, connectDB } = require("./config/db");
const studentsRoutes = require("./routes/students");
const adminsRoutes = require("./routes/admins");
const teacherRoutes = require("./routes/teachers");
const app = express();
const port = process.env.PORT || 3000;

//middleware
app.use(cors());
app.use(bodyParser.json());

connectDB();

app.use("/students", studentsRoutes);
app.use("/admins", adminsRoutes);
app.use("/teachers", teacherRoutes);

app.listen(port, () => {
  console.log(`server is running on http://localhost:${port}`);
});
