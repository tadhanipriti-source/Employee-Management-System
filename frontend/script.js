
// ============================================
// EMPLOYEE MANAGEMENT SYSTEM
// ============================================

const API_URL = "https://employee-management-system-hqfm.onrender.com/api/employees";
const ATTENDANCE_API = "https://employee-management-system-hqfm.onrender.com/api/attendance";

let currentPage = 1;
let totalPages = 1;
let limit = 5;


// ============================================
// COMMON FUNCTIONS
// ============================================

function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, function (char) {
        return {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        }[char];
    });
}


function formatCurrency(amount) {
    return "₹" + Number(amount || 0).toLocaleString("en-IN");
}


function formatDate(date) {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("en-IN");
}


function getPhotoURL(photo) {
    if (!photo) {
        return "https://placehold.co/100x100?text=No+Photo";
    }

    if (photo.startsWith("http")) {
        return photo;
    }

    return "https://employee-management-system-hqfm.onrender.com" + photo;
}


// ============================================
// DASHBOARD
// ============================================

async function refreshDashboard() {
    await Promise.all([
        loadEmployees(),
        loadDepartmentStats(),
        loadSalaryStats(),
        loadRecentEmployees()
    ]);
}


// ============================================
// ADD EMPLOYEE FORM
// ============================================

function openEmployeeForm() {
    document.getElementById("addEmployeeSection")
        .classList.remove("hidden");
}


function closeEmployeeForm() {
    document.getElementById("addEmployeeSection")
        .classList.add("hidden");

    document.getElementById("employeeForm").reset();
}


// Add Employee
document.getElementById("employeeForm")
    .addEventListener("submit", async function (event) {

        event.preventDefault();

        const form = this;
        const formData = new FormData(form);

        try {
            const response = await fetch(API_URL, {
                method: "POST",
                body: formData
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.message || "Unable to add employee");
            }

            alert("Employee added successfully!");

            form.reset();
            closeEmployeeForm();

            await refreshDashboard();
            await loadAttendanceEmployees();

        } catch (error) {
            alert(error.message);
            console.error("Add Employee Error:", error);
        }
    });


// ============================================
// LOAD EMPLOYEES
// ============================================

async function loadEmployees() {
    try {
        const response = await fetch(
            `${API_URL}?page=${currentPage}&limit=${limit}`
        );

        const result = await response.json();

        if (!response.ok || !result.success) {
            throw new Error(result.message || "Unable to load employees");
        }

        displayEmployees(result.data);

        // Pagination information
        if (result.pagination) {
            totalPages = result.pagination.totalPages || 1;
        } else {
            totalPages = 1;
        }

        document.getElementById("pageInfo").textContent =
            `Page ${currentPage} of ${totalPages}`;

        document.getElementById("prevBtn").disabled =
            currentPage <= 1;

        document.getElementById("nextBtn").disabled =
            currentPage >= totalPages;

        // Dashboard employee count
        if (result.pagination &&
            result.pagination.totalEmployees !== undefined) {

            document.getElementById("totalEmployees").textContent =
                result.pagination.totalEmployees;
        }

    } catch (error) {
        console.error("Load Employees Error:", error);

        document.getElementById("employeeTableBody").innerHTML = `
            <tr>
                <td colspan="9" class="loading-text">
                    Unable to load employees.
                </td>
            </tr>
        `;
    }
}


// ============================================
// DISPLAY EMPLOYEES
// ============================================

function displayEmployees(employees) {

    const tableBody = document.getElementById("employeeTableBody");

    if (!employees || employees.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="9" class="loading-text">
                    No employees found.
                </td>
            </tr>
        `;
        return;
    }

    tableBody.innerHTML = employees.map(employee => {

        return `
            <tr>

                <td>
                    <img
                        src="${escapeHTML(getPhotoURL(employee.profilePhoto))}"
                        alt="Employee Photo"
                    >
                </td>

                <td>${escapeHTML(employee.employeeId)}</td>

                <td>
                    <a href="employee-details.html?id=${encodeURIComponent(employee._id)}">
                        ${escapeHTML(employee.fullName)}
                    </a>
                </td>

                <td>${escapeHTML(employee.email)}</td>

                <td>${escapeHTML(employee.department)}</td>

                <td>${escapeHTML(employee.designation)}</td>

                <td>${formatCurrency(employee.salary)}</td>

                <td>${formatDate(employee.joiningDate)}</td>

                <td>
                    <button
                        class="edit-btn"
                        onclick="editEmployee('${employee._id}')"
                        title="Edit Employee"
                    >
                        <i class="fa-solid fa-pen"></i>
                    </button>

                    <button
                        class="delete-btn"
                        onclick="deleteEmployee('${employee._id}')"
                        title="Delete Employee"
                    >
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </td>

            </tr>
        `;

    }).join("");
}


// ============================================
// SEARCH EMPLOYEES
// ============================================

document.getElementById("searchInput")
    .addEventListener("input", async function () {

        const search = this.value.trim();

        currentPage = 1;

        try {
            const response = await fetch(
                `${API_URL}?search=${encodeURIComponent(search)}&page=${currentPage}&limit=${limit}`
            );

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.message || "Search failed");
            }

            displayEmployees(result.data);

            if (result.pagination) {
                totalPages = result.pagination.totalPages || 1;
            } else {
                totalPages = 1;
            }

            document.getElementById("pageInfo").textContent =
                `Page ${currentPage} of ${totalPages}`;

            document.getElementById("prevBtn").disabled = true;

            document.getElementById("nextBtn").disabled =
                currentPage >= totalPages;

        } catch (error) {
            console.error("Search Error:", error);
        }
    });


// ============================================
// PAGINATION
// ============================================

document.getElementById("prevBtn")
    .addEventListener("click", function () {

        if (currentPage > 1) {
            currentPage--;
            loadEmployees();
        }
    });


document.getElementById("nextBtn")
    .addEventListener("click", function () {

        if (currentPage < totalPages) {
            currentPage++;
            loadEmployees();
        }
    });


// ============================================
// EDIT EMPLOYEE
// ============================================

async function editEmployee(id) {

    try {
        const response = await fetch(`${API_URL}/${id}`);

        const result = await response.json();

        if (!response.ok || !result.success) {
            throw new Error(result.message || "Employee not found");
        }

        const employee = result.data;

        document.getElementById("editEmployeeId").value =
            employee._id;

        document.getElementById("editEmployeeCode").value =
            employee.employeeId;

        document.getElementById("editFullName").value =
            employee.fullName;

        document.getElementById("editEmail").value =
            employee.email;

        document.getElementById("editPhone").value =
            employee.phone;

        document.getElementById("editGender").value =
            employee.gender;

        document.getElementById("editDepartment").value =
            employee.department;

        document.getElementById("editDesignation").value =
            employee.designation;

        document.getElementById("editSalary").value =
            employee.salary;

        document.getElementById("editJoiningDate").value =
            employee.joiningDate
                ? employee.joiningDate.split("T")[0]
                : "";

        document.getElementById("editAddress").value =
            employee.address;

        document.getElementById("editPhotoPreview").src =
            getPhotoURL(employee.profilePhoto);

        document.getElementById("editModal").style.display = "block";

    } catch (error) {
        alert(error.message);
        console.error("Edit Employee Error:", error);
    }
}


// Update Employee
document.getElementById("editEmployeeForm")
    .addEventListener("submit", async function (event) {

        event.preventDefault();

        const id = document.getElementById("editEmployeeId").value;

        const formData = new FormData(this);

        try {
            const response = await fetch(`${API_URL}/${id}`, {
                method: "PUT",
                body: formData
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.message || "Unable to update employee");
            }

            alert("Employee updated successfully!");

            closeEditModal();

            await refreshDashboard();
            await loadAttendanceEmployees();

        } catch (error) {
            alert(error.message);
            console.error("Update Employee Error:", error);
        }
    });


// Close Edit Modal
function closeEditModal() {
    document.getElementById("editModal").style.display = "none";
}


// Photo Preview
document.getElementById("editProfilePhoto")
    .addEventListener("change", function () {

        const file = this.files[0];

        if (!file) return;

        const allowedTypes = [
            "image/jpeg",
            "image/jpg",
            "image/png",
            "image/webp"
        ];

        if (!allowedTypes.includes(file.type)) {
            alert("Please select JPG, JPEG, PNG or WEBP image.");

            this.value = "";
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            alert("Photo size must be less than 5 MB.");

            this.value = "";
            return;
        }

        document.getElementById("editPhotoPreview").src =
            URL.createObjectURL(file);
    });


// Close Modal on Outside Click
document.getElementById("editModal")
    .addEventListener("click", function (event) {

        if (event.target === this) {
            closeEditModal();
        }
    });


// ============================================
// DELETE EMPLOYEE
// ============================================

async function deleteEmployee(id) {

    const confirmDelete = confirm(
        "Are you sure you want to delete this employee?"
    );

    if (!confirmDelete) return;

    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: "DELETE"
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
            throw new Error(result.message || "Unable to delete employee");
        }

        alert("Employee deleted successfully!");

        await refreshDashboard();
        await loadAttendanceEmployees();

    } catch (error) {
        alert(error.message);
        console.error("Delete Employee Error:", error);
    }
}


// ============================================
// DEPARTMENT STATISTICS
// ============================================

async function loadDepartmentStats() {

    try {
        const response = await fetch(
            `${API_URL}/stats/departments`
        );

        const result = await response.json();

        if (!response.ok || !result.success) {
            throw new Error("Unable to load department statistics");
        }

        const departments = result.data;

        document.getElementById("totalDepartments").textContent =
            departments.length;

        const container = document.getElementById("departmentStats");

        if (!departments || departments.length === 0) {
            container.innerHTML = "No department data found.";
            return;
        }

        container.innerHTML = departments.map(department => {

            return `
                <div class="department-item">

                    <p>${escapeHTML(department._id)}</p>

                    <span>
                        ${department.totalEmployees} Employees
                    </span>

                </div>
            `;

        }).join("");

    } catch (error) {
        console.error("Department Stats Error:", error);
    }
}


// ============================================
// SALARY STATISTICS
// ============================================

async function loadSalaryStats() {

    try {
        const response = await fetch(
            `${API_URL}/stats/salary`
        );

        const result = await response.json();

        if (!response.ok || !result.success) {
            throw new Error("Unable to load salary statistics");
        }

        const data = result.data;

        document.getElementById("totalSalary").textContent =
            formatCurrency(data.totalSalary);

        document.getElementById("averageSalary").textContent =
            formatCurrency(data.averageSalary);

        document.getElementById("highestSalary").textContent =
            formatCurrency(data.highestSalary);

    } catch (error) {
        console.error("Salary Stats Error:", error);
    }
}


// ============================================
// RECENT EMPLOYEES
// ============================================

async function loadRecentEmployees() {

    try {
        const response = await fetch(
            `${API_URL}/recent`
        );

        const result = await response.json();

        if (!response.ok || !result.success) {
            throw new Error("Unable to load recent employees");
        }

        displayRecentEmployees(result.data);

    } catch (error) {
        console.error("Recent Employees Error:", error);
    }
}


function displayRecentEmployees(employees) {

    const container = document.getElementById("recentEmployees");

    if (!employees || employees.length === 0) {
        container.innerHTML = "No recent employees found.";
        return;
    }

    container.innerHTML = employees.map(employee => {

        return `
            <div class="recent-employee">

                <img
                    src="${escapeHTML(getPhotoURL(employee.profilePhoto))}"
                    alt="Employee Photo"
                >

                <div>

                    <a href="employee-details.html?id=${encodeURIComponent(employee._id)}">
                        ${escapeHTML(employee.fullName)}
                    </a>

                    <p>${escapeHTML(employee.designation)}</p>

                    <p>
                        ${escapeHTML(employee.employeeId)}
                        | ${escapeHTML(employee.department)}
                    </p>

                </div>

            </div>
        `;

    }).join("");
}


// ============================================
// EXPORT EMPLOYEES TO CSV
// ============================================

document.getElementById("exportBtn")
    .addEventListener("click", async function () {

        const button = this;

        button.disabled = true;
        button.innerHTML = "Exporting...";

        try {
            const response = await fetch(
                `${API_URL}?page=1&limit=10000`
            );

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error("Unable to export employees");
            }

            const employees = result.data;

            if (!employees || employees.length === 0) {
                alert("No employees available to export.");
                return;
            }

            const headers = [
                "Employee ID",
                "Full Name",
                "Email",
                "Phone",
                "Gender",
                "Department",
                "Designation",
                "Salary",
                "Joining Date",
                "Address"
            ];

            function csvValue(value) {
                let text = String(value ?? "");

                // Prevent spreadsheet formula injection
                if (/^[\s]*[=+\-@]/.test(text)) {
                    text = "'" + text;
                }

                return '"' + text.replace(/"/g, '""') + '"';
            }

            const rows = employees.map(employee => {

                return [
                    employee.employeeId,
                    employee.fullName,
                    employee.email,
                    employee.phone,
                    employee.gender,
                    employee.department,
                    employee.designation,
                    employee.salary,
                    employee.joiningDate
                        ? employee.joiningDate.split("T")[0]
                        : "",
                    employee.address
                ].map(csvValue).join(",");

            });

            const csvContent =
                "\uFEFF" +
                headers.map(csvValue).join(",") +
                "\n" +
                rows.join("\n");

            const blob = new Blob(
                [csvContent],
                { type: "text/csv;charset=utf-8;" }
            );

            const url = URL.createObjectURL(blob);

            const link = document.createElement("a");

            link.href = url;
            link.download = "Employee_List.csv";

            document.body.appendChild(link);

            link.click();

            link.remove();

            URL.revokeObjectURL(url);

            alert("Employee CSV exported successfully!");

        } catch (error) {
            alert(error.message);
            console.error("Export CSV Error:", error);

        } finally {
            button.disabled = false;

            button.innerHTML =
                '<i class="fa-solid fa-file-csv"></i> Export CSV';
        }
    });


// ============================================
// ATTENDANCE MANAGEMENT
// ============================================

const attendanceForm = document.getElementById("attendanceForm");

const attendanceEmployee =
    document.getElementById("attendanceEmployee");

const attendanceDate =
    document.getElementById("attendanceDate");

const attendanceStatus =
    document.getElementById("attendanceStatus");

const attendanceTableBody =
    document.getElementById("attendanceTableBody");


// Set Today's Date
function setAttendanceTodayDate() {

    if (!attendanceDate) return;

    const today = new Date();

    const localDate = [
        today.getFullYear(),
        String(today.getMonth() + 1).padStart(2, "0"),
        String(today.getDate()).padStart(2, "0")
    ].join("-");

    attendanceDate.value = localDate;
}


// Load Employees in Attendance Dropdown
async function loadAttendanceEmployees() {

    try {
        const response = await fetch(
            `${API_URL}?page=1&limit=10000`
        );

        const result = await response.json();

        if (!response.ok || !result.success) {
            throw new Error(result.message || "Unable to load employees");
        }

        attendanceEmployee.innerHTML =
            '<option value="">Select Employee</option>';

        result.data.forEach(employee => {

            const option = document.createElement("option");

            option.value = employee._id;

            option.textContent =
                `${employee.employeeId} - ${employee.fullName}`;

            attendanceEmployee.appendChild(option);
        });

    } catch (error) {
        console.error("Attendance Employee Error:", error);

        attendanceEmployee.innerHTML =
            '<option value="">Unable to load employees</option>';
    }
}


// Load Attendance Records
async function loadAttendanceRecords() {

    try {
        const response = await fetch(ATTENDANCE_API);

        const result = await response.json();

        if (!response.ok || !result.success) {
            throw new Error(
                result.message || "Unable to load attendance records"
            );
        }

        displayAttendanceRecords(result.data);

    } catch (error) {
        console.error("Attendance Loading Error:", error);

        attendanceTableBody.innerHTML = `
            <tr>
                <td colspan="5" class="loading-text">
                    Unable to load attendance records.
                </td>
            </tr>
        `;
    }
}


// Display Attendance Records
function displayAttendanceRecords(records) {

    if (!records || records.length === 0) {

        attendanceTableBody.innerHTML = `
            <tr>
                <td colspan="5" class="loading-text">
                    No attendance records found.
                </td>
            </tr>
        `;

        return;
    }

    attendanceTableBody.innerHTML = records.map(record => {

        const employee = record.employee || {};

        const status = escapeHTML(record.status);

        let statusClass = "status-present";

        if (record.status === "Absent") {
            statusClass = "status-absent";
        } else if (record.status === "Half Day") {
            statusClass = "status-half-day";
        } else if (record.status === "Leave") {
            statusClass = "status-leave";
        }

        return `
            <tr>

                <td>
                    ${escapeHTML(employee.employeeId || "-")}
                </td>

                <td>
                    ${escapeHTML(employee.fullName || "-")}
                </td>

                <td>
                    ${escapeHTML(employee.department || "-")}
                </td>

                <td>
                    ${formatDate(record.date)}
                </td>

                <td>
                    <span class="${statusClass}">
                        ${status}
                    </span>
                </td>

            </tr>
        `;

    }).join("");
}


// Submit Attendance Form
if (attendanceForm) {

    attendanceForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        const employee = attendanceEmployee.value;
        const date = attendanceDate.value;
        const status = attendanceStatus.value;

        if (!employee || !date || !status) {
            alert("Please fill all attendance details.");
            return;
        }

        const submitButton =
            attendanceForm.querySelector('button[type="submit"]');

        submitButton.disabled = true;
        submitButton.textContent = "Saving...";

        try {
            const response = await fetch(ATTENDANCE_API, {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    employee,
                    date,
                    status
                })
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(
                    result.message || "Unable to mark attendance"
                );
            }

            alert("Attendance marked successfully!");

            attendanceForm.reset();

            setAttendanceTodayDate();

            await loadAttendanceRecords();

        } catch (error) {
            alert(error.message);

            console.error("Attendance Submit Error:", error);

        } finally {
            submitButton.disabled = false;

            submitButton.innerHTML =
                '<i class="fa-solid fa-check"></i> Mark Attendance';
        }

    });

}


// ============================================
// INITIALIZE APPLICATION
// ============================================

refreshDashboard();

if (attendanceForm) {
    setAttendanceTodayDate();
    loadAttendanceEmployees();
    loadAttendanceRecords();
}
