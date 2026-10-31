
const express = require("express");
const router = express.Router();

const {
    addEmployee,
    getEmployees,
    getEmployeeById,
    updateEmployee,
    deleteEmployee,
    getDepartmentStats,
    getSalaryStats,
    getRecentEmployees
} = require("../controllers/employeeController");

const upload = require("../middleware/upload");

// Add Employee with Photo
router.post("/", upload.single("profilePhoto"), addEmployee);

// Get All Employees
router.get("/", getEmployees);

// Get Department Statistics
router.get("/stats/departments", getDepartmentStats);

// Get Salary Statistics
router.get("/stats/salary", getSalaryStats);

// Get Recent 5 Employees
router.get("/recent", getRecentEmployees);

// Get Employee By ID
router.get("/:id", getEmployeeById);

// Update Employee with Photo
router.put("/:id", upload.single("profilePhoto"), updateEmployee);

// Delete Employee
router.delete("/:id", deleteEmployee);

module.exports = router;
