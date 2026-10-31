
const express = require("express");

const router = express.Router();

const {
    markAttendance,
    getAttendance
} = require("../controllers/attendanceController");

// POST - Mark Attendance
router.post("/", markAttendance);

// GET - Get All Attendance
router.get("/", getAttendance);

module.exports = router;
