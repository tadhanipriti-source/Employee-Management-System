
const Employee = require("../models/Employee");

// Add New Employee with Profile Photo
const addEmployee = async (req, res) => {
    try {
        const {
            employeeId,
            fullName,
            email,
            phone,
            gender,
            department,
            designation,
            salary,
            joiningDate,
            address
        } = req.body;

        // Check Existing Employee
        const existingEmployee = await Employee.findOne({
            $or: [{ employeeId }, { email }]
        });

        if (existingEmployee) {
            return res.status(400).json({
                success: false,
                message: "Employee ID or Email already exists"
            });
        }

        // Get Uploaded Photo Path
        const profilePhoto = req.file
            ? `/uploads/${req.file.filename}`
            : "";

        // Create Employee
        const employee = await Employee.create({
            employeeId,
            fullName,
            email,
            phone,
            gender,
            department,
            designation,
            salary,
            joiningDate,
            address,
            profilePhoto
        });

        res.status(201).json({
            success: true,
            message: "Employee added successfully",
            data: employee
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// Get All Employees with Search and Pagination
const getEmployees = async (req, res) => {
    try {
        const search = req.query.search || "";

        const page = Math.max(1, parseInt(req.query.page) || 1);

        const limit = Math.min(
            100,
            Math.max(1, parseInt(req.query.limit) || 10)
        );

        const skip = (page - 1) * limit;

        const searchFilter = search
            ? {
                $or: [
                    { employeeId: { $regex: search, $options: "i" } },
                    { fullName: { $regex: search, $options: "i" } },
                    { email: { $regex: search, $options: "i" } },
                    { department: { $regex: search, $options: "i" } }
                ]
            }
            : {};

        const employees = await Employee.find(searchFilter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const totalEmployees = await Employee.countDocuments(searchFilter);

        res.status(200).json({
            success: true,
            totalEmployees,
            currentPage: page,
            totalPages: Math.ceil(totalEmployees / limit),
            data: employees
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// Get Employee By ID
const getEmployeeById = async (req, res) => {
    try {
        const employee = await Employee.findById(req.params.id);

        if (!employee) {
            return res.status(404).json({
                success: false,
                message: "Employee not found"
            });
        }

        res.status(200).json({
            success: true,
            data: employee
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            message: "Invalid Employee ID"
        });
    }
};


// Update Employee with Profile Photo
const updateEmployee = async (req, res) => {
    try {
        const updateData = {
            ...req.body
        };

        // If New Photo Uploaded
        if (req.file) {
            updateData.profilePhoto = `/uploads/${req.file.filename}`;
        }

        const employee = await Employee.findByIdAndUpdate(
            req.params.id,
            updateData,
            {
                new: true,
                runValidators: true
            }
        );

        if (!employee) {
            return res.status(404).json({
                success: false,
                message: "Employee not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Employee updated successfully",
            data: employee
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};


// Delete Employee
const deleteEmployee = async (req, res) => {
    try {
        const employee = await Employee.findByIdAndDelete(
            req.params.id
        );

        if (!employee) {
            return res.status(404).json({
                success: false,
                message: "Employee not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Employee deleted successfully"
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            message: "Invalid Employee ID"
        });
    }
};


// Get Department Statistics
const getDepartmentStats = async (req, res) => {
    try {
        const departments = await Employee.aggregate([
            {
                $group: {
                    _id: "$department",
                    totalEmployees: { $sum: 1 }
                }
            },
            {
                $sort: {
                    totalEmployees: -1
                }
            }
        ]);

        res.status(200).json({
            success: true,
            data: departments
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// Get Salary Statistics
const getSalaryStats = async (req, res) => {
    try {
        const stats = await Employee.aggregate([
            {
                $group: {
                    _id: null,
                    totalSalary: { $sum: "$salary" },
                    averageSalary: { $avg: "$salary" },
                    highestSalary: { $max: "$salary" },
                    totalEmployees: { $sum: 1 }
                }
            }
        ]);

        const salaryData = stats.length > 0
            ? stats[0]
            : {
                totalSalary: 0,
                averageSalary: 0,
                highestSalary: 0,
                totalEmployees: 0
            };

        res.status(200).json({
            success: true,
            data: {
                totalSalary: salaryData.totalSalary,
                averageSalary: Math.round(salaryData.averageSalary),
                highestSalary: salaryData.highestSalary,
                totalEmployees: salaryData.totalEmployees
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// Get Recent 5 Employees
const getRecentEmployees = async (req, res) => {
    try {
        const employees = await Employee.find()
            .sort({ createdAt: -1 })
            .limit(5);

        res.status(200).json({
            success: true,
            data: employees
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// Export Functions
module.exports = {
    addEmployee,
    getEmployees,
    getEmployeeById,
    updateEmployee,
    deleteEmployee,
    getDepartmentStats,
    getSalaryStats,
    getRecentEmployees
};
