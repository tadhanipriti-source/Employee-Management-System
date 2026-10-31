
// API URL
const API_URL = "http://localhost:5000/api/employees";


// HTML Escape Function
function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, function (char) {
        const entities = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        };

        return entities[char];
    });
}


// Format Currency
function formatCurrency(amount) {
    return "₹" + Number(amount || 0).toLocaleString("en-IN");
}


// Format Date
function formatDate(date) {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "long",
        year: "numeric"
    });
}


// Get Profile Photo
function getPhotoURL(photo) {
    if (photo) {
        return `http://localhost:5000${photo}`;
    }

    return "https://placehold.co/150x150?text=No+Photo";
}


// Get Employee ID From URL
const urlParams = new URLSearchParams(window.location.search);

const employeeId = urlParams.get("id");


// Load Employee Details
async function loadEmployeeDetails() {

    const container = document.getElementById("employeeDetails");

    if (!employeeId) {
        container.innerHTML = `
            <p>Employee ID is missing.</p>
        `;
        return;
    }

    try {

        const response = await fetch(
            `${API_URL}/${encodeURIComponent(employeeId)}`
        );

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "Employee not found");
        }

        const employee = result.data;

        displayEmployeeDetails(employee);

    } catch (error) {

        console.error("Employee Details Error:", error);

        container.innerHTML = `
            <h2>Employee Not Found</h2>
            <p>${escapeHTML(error.message)}</p>
            <button onclick="window.location.href='index.html'">
                Back to Dashboard
            </button>
        `;
    }
}


// Display Employee Details
function displayEmployeeDetails(employee) {

    const container = document.getElementById("employeeDetails");

    container.innerHTML = `

        <!-- Employee Profile -->
        <div class="employee-profile">

            <img
                src="${escapeHTML(getPhotoURL(employee.profilePhoto))}"
                alt="Employee Photo"
                onerror="this.src='https://placehold.co/150x150?text=No+Photo'"
            >

            <div>

                <h2>${escapeHTML(employee.fullName)}</h2>

                <p>
                    ${escapeHTML(employee.designation)}
                </p>

                <p>
                    Employee ID: ${escapeHTML(employee.employeeId)}
                </p>

            </div>

        </div>


        <!-- Employee Information -->
        <div class="details-grid">

            <div class="detail-item">
                <h4>Full Name</h4>
                <p>${escapeHTML(employee.fullName)}</p>
            </div>

            <div class="detail-item">
                <h4>Employee ID</h4>
                <p>${escapeHTML(employee.employeeId)}</p>
            </div>

            <div class="detail-item">
                <h4>Email Address</h4>
                <p>${escapeHTML(employee.email)}</p>
            </div>

            <div class="detail-item">
                <h4>Phone Number</h4>
                <p>${escapeHTML(employee.phone)}</p>
            </div>

            <div class="detail-item">
                <h4>Gender</h4>
                <p>${escapeHTML(employee.gender)}</p>
            </div>

            <div class="detail-item">
                <h4>Department</h4>
                <p>${escapeHTML(employee.department)}</p>
            </div>

            <div class="detail-item">
                <h4>Designation</h4>
                <p>${escapeHTML(employee.designation)}</p>
            </div>

            <div class="detail-item">
                <h4>Salary</h4>
                <p>${formatCurrency(employee.salary)}</p>
            </div>

            <div class="detail-item">
                <h4>Joining Date</h4>
                <p>${formatDate(employee.joiningDate)}</p>
            </div>

            <div class="detail-item">
                <h4>Address</h4>
                <p>${escapeHTML(employee.address)}</p>
            </div>

            <div class="detail-item">
                <h4>Account Created</h4>
                <p>${formatDate(employee.createdAt)}</p>
            </div>

            <div class="detail-item">
                <h4>Last Updated</h4>
                <p>${formatDate(employee.updatedAt)}</p>
            </div>

        </div>

    `;
}


// Load Details When Page Opens
loadEmployeeDetails();
