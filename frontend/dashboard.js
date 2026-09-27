// =====================================================
// CURRENT USER
// =====================================================

let currentUser = null;

const storedUser = localStorage.getItem("currentUser");

if (storedUser) {

    try {
        currentUser = JSON.parse(storedUser);
    } catch (error) {
        console.error("Invalid currentUser data");
    }

}

// Temporary fallback for testing
if (!currentUser) {

    currentUser = {
        user_id: 1,
        student_id: 1,
        name: "Rahul Sharma",
        email: "rahul@campusconnect.com"
    };

}


// =====================================================
// POPULATE DASHBOARD
// =====================================================

const welcomeTitle = document.getElementById("welcomeTitle");
const userAvatar = document.getElementById("userAvatar");
const userName = document.getElementById("userName");
const userEmail = document.getElementById("userEmail");

if (welcomeTitle) {

    const firstName = currentUser.name
        ? currentUser.name.split(" ")[0]
        : "there";

    welcomeTitle.textContent = `Welcome back, ${firstName}! 👋`;

}

if (userAvatar) {

    userAvatar.textContent = currentUser.name
        ? currentUser.name.charAt(0).toUpperCase()
        : "?";

}

if (userName) {
    userName.textContent = currentUser.name || "Student";
}

if (userEmail) {
    userEmail.textContent = currentUser.email || "";
}


// =====================================================
// LOGOUT
// =====================================================

const logoutButton = document.getElementById("logoutButton");

if (logoutButton) {

    logoutButton.addEventListener("click", function () {

        localStorage.removeItem("currentUser");

        window.location.href = "index.html";

    });

}