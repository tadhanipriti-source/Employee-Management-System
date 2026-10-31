
const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema(
    {
        employeeId: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },

        fullName: {
            type: String,
            required: true,
            trim: true
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },

        phone: {
            type: String,
            required: true
        },

        gender: {
            type: String,
            enum: ["Male", "Female", "Other"],
            required: true
        },

        department: {
            type: String,
            required: true
        },

        designation: {
            type: String,
            required: true
        },

        salary: {
            type: Number,
            required: true,
            min: 0
        },

        joiningDate: {
            type: Date,
            required: true
        },

        address: {
            type: String,
            required: true
        },

        profilePhoto: {
            type: String,
            default: ""
        }
    },
    {
        timestamps: true
    }
);

const Employee = mongoose.model("Employee", employeeSchema);

module.exports = Employee;
