
const Attendance = require("../models/Attendance");
const Employee = require("../models/Employee");

// Mark Employee Attendance
const markAttendance = async (req, res) => {
    try {
        const { employee, date, status } = req.body;

        // Check required fields
        if (!employee || !date || !status) {
            return res.status(400).json({
                success: false,
                message: "Please provide employee, date and status"
            });
        }

        // Check employee exists
        const employeeExists = await Employee.findById(employee);

        if (!employeeExists) {
            return res.status(404).json({
                success: false,
                message: "Employee not found"
            });
        }

        // Validate date
        const attendanceDate = new Date(date);

        if (isNaN(attendanceDate.getTime())) {
            return res.status(400).json({
                success: false,
                message: "Invalid attendance date"
            });
        }

        // Set date to start of day
        attendanceDate.setUTCHours(0, 0, 0, 0);

        // Check duplicate attendance
        const existingAttendance = await Attendance.findOne({
            employee,
            date: attendanceDate
        });

        if (existingAttendance) {
            return res.status(409).json({
                success: false,
                message: "Attendance already marked for this date"
            });
        }

        // Create attendance
        const attendance = await Attendance.create({
            employee,
            date: attendanceDate,
            status
        });

        res.status(201).json({
            success: true,
            message: "Attendance marked successfully",
            data: attendance
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// Get All Attendance
const getAttendance = async (req, res) => {
    try {
        const attendance = await Attendance.find()
            .populate("employee", "employeeId fullName department designation")
            .sort({ date: -1 });

        res.status(200).json({
            success: true,
            data: attendance
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


module.exports = {
    markAttendance,
    getAttendance
};
