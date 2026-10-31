
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

const connectDB = require("./config/db");

const employeeRoutes = require("./routes/employeeRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded employee photos
app.use("/uploads", express.static("uploads"));

// Connect MongoDB
connectDB();

// Home Route
app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Employee Management System API is Running!"
    });
});

// Employee Routes
app.use("/api/employees", employeeRoutes);

// Attendance Routes
app.use("/api/attendance", attendanceRoutes);

// Server Port
const PORT = process.env.PORT || 5000;

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
