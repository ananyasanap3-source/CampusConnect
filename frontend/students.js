const API_URL = "http://localhost:5000";

const studentsContainer = document.getElementById("studentsContainer");
const searchInput = document.getElementById("searchInput");
const logoutButton = document.getElementById("logoutButton");

let students = [];


// =====================================================
// CURRENT USER
// =====================================================

let currentUser = null;

const storedUser = localStorage.getItem("currentUser");

if (storedUser) {

    currentUser = JSON.parse(storedUser);

    // Older login data may not contain student_id
    if (currentUser && !currentUser.student_id) {
        currentUser.student_id = 1;
    }

}

// Temporary fallback for testing
if (!currentUser) {

    currentUser = {
        user_id: 1,
        student_id: 1,
        name: "Rahul Sharma"
    };

}


// =====================================================
// LOAD STUDENTS
// =====================================================

async function loadStudents() {

    try {

        const response = await fetch(`${API_URL}/api/students`);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Failed to load students");
        }

        students = data;

        displayStudents(students);

    } catch (error) {

        console.error("Error loading students:", error);

        studentsContainer.innerHTML = `
            <p class="loading">
                Cannot load students. Make sure the backend is running.
            </p>
        `;

    }

}


// =====================================================
// DISPLAY STUDENTS
// =====================================================

function displayStudents(list) {

    if (!list || list.length === 0) {

        studentsContainer.innerHTML = `
            <p class="loading">
                No students found.
            </p>
        `;

        return;
    }

    studentsContainer.innerHTML = list.map(student => `

        <div
            class="student-card"
            data-student-id="${student.student_id}"
        >

            <div class="student-avatar">
                ${getInitials(student.name)}
            </div>

            <h2>
                ${escapeHtml(student.name)}
            </h2>

            <p class="course">
                ${escapeHtml(student.course || "Course not specified")}
            </p>

            <p class="year">
                Year ${escapeHtml(String(student.year || "N/A"))}
            </p>

            <p class="skills">
                <strong>Skills:</strong>
                ${escapeHtml(student.skills || "Not specified")}
            </p>

            <p class="bio">
                ${escapeHtml(student.bio || "No bio available.")}
            </p>

            <button
                class="connect-button"
                data-student-id="${student.student_id}"
                data-student-name="${escapeHtml(student.name)}"
            >
                Connect
            </button>

        </div>

    `).join("");

    // Wire up connect buttons
    document
        .querySelectorAll(".connect-button")
        .forEach(button => {

            button.addEventListener("click", function () {

                const studentId = this.dataset.studentId;
                const studentName = this.dataset.studentName;

                connectWithStudent(studentId, studentName);

            });

        });

}


// =====================================================
// CONNECT WITH STUDENT
// =====================================================

async function connectWithStudent(studentId, studentName) {

    // Don't allow user to connect with themselves
    if (Number(studentId) === Number(currentUser.student_id)) {
        alert("You cannot connect with yourself.");
        return;
    }

    try {

        const response = await fetch(`${API_URL}/api/conversations`, {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                student1_id: currentUser.student_id,
                student2_id: studentId
            })

        });

        if (!response.ok) {

            const errorData = await response.json().catch(() => ({}));

            throw new Error(
                errorData.message || "Could not create conversation"
            );

        }

        const conversation = await response.json();

        alert(`Conversation started with ${studentName}!`);

        window.location.href =
            `messages.html?conversation=${conversation.conversation_id}`;

    } catch (error) {

        console.error("Error connecting with student:", error);

        alert("Could not connect with this student.");

    }

}


// =====================================================
// SEARCH STUDENTS
// =====================================================

if (searchInput) {

    searchInput.addEventListener("input", function () {

        const searchTerm = searchInput.value.toLowerCase().trim();

        const filteredStudents = students.filter(student => {

            const studentInfo = `
                ${student.name || ""}
                ${student.course || ""}
                ${student.skills || ""}
                ${student.bio || ""}
            `.toLowerCase();

            return studentInfo.includes(searchTerm);

        });

        displayStudents(filteredStudents);

    });

}


// =====================================================
// LOGOUT
// =====================================================

if (logoutButton) {

    logoutButton.addEventListener("click", function () {

        localStorage.removeItem("currentUser");

        window.location.href = "index.html";

    });

}


// =====================================================
// HELPER: INITIALS
// =====================================================

function getInitials(name) {

    if (!name) {
        return "?";
    }

    return name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map(word => word.charAt(0).toUpperCase())
        .join("");

}


// =====================================================
// HELPER: ESCAPE HTML
// =====================================================

function escapeHtml(value) {

    if (value === null || value === undefined) {
        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


// =====================================================
// INITIAL LOAD
// =====================================================

loadStudents();