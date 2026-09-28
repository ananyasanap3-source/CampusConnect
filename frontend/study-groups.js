const groupsContainer = document.getElementById("groupsContainer");
const searchInput = document.getElementById("searchInput");

let studyGroups = [];
let currentUser = null;


// ===============================
// GET CURRENT USER
// ===============================

function getCurrentUser() {

    const storedUser = localStorage.getItem("currentUser");

    if (storedUser) {
        try {
            return JSON.parse(storedUser);
        } catch (error) {
            console.error("Invalid currentUser data");
        }
    }

    return {
        student_id: 1,
        name: "Rahul Sharma"
    };
}

currentUser = getCurrentUser();


// ===============================
// LOAD GROUPS
// ===============================

async function loadGroups() {

    try {

        const response = await fetch("https://campusconnect-production-0cdf.up.railway.app/api/study-groups");

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Failed to load study groups");
        }

        studyGroups = data;

        displayGroups(studyGroups);

    } catch (error) {

        console.error("Error loading study groups:", error);

        groupsContainer.innerHTML = `
            <p class="loading">
                Could not load study groups.
            </p>
        `;
    }
}


// ===============================
// DISPLAY GROUPS
// ===============================

function displayGroups(groups) {

    if (groups.length === 0) {

        groupsContainer.innerHTML = `
            <p class="loading">
                No study groups found.
            </p>
        `;

        return;
    }


    groupsContainer.innerHTML = groups.map(group => `

        <div class="group-card">

            <div class="group-icon">
                ${group.icon}
            </div>

            <h2>
                ${escapeHtml(group.name)}
            </h2>

            <p class="subject">
                ${escapeHtml(group.subject)}
            </p>

            <p class="description">
                ${escapeHtml(group.description || "")}
            </p>

            <div class="group-info">

                <span>
                    👥 ${group.member_count} member${group.member_count == 1 ? "" : "s"}
                </span>

                <span>
                    📍 ${escapeHtml(group.meeting_info || "TBD")}
                </span>

            </div>

            <button
                class="join-button"
                data-group-id="${group.group_id}"
            >
                Join Group
            </button>

        </div>

    `).join("");


    // Wire up join buttons
    document
        .querySelectorAll(".join-button")
        .forEach(button => {

            button.addEventListener("click", function () {

                const groupId = this.dataset.groupId;

                joinGroup(groupId, this);

            });

        });

}


// ===============================
// JOIN GROUP
// ===============================

async function joinGroup(groupId, buttonElement) {

    try {

        const response = await fetch(
            `https://campusconnect-production-0cdf.up.railway.app/api/study-groups/${groupId}/join`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    student_id: currentUser.student_id
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {

            if (response.status === 409) {
                alert("You've already joined this group!");
            } else {
                throw new Error(data.message || "Failed to join group");
            }

            return;
        }

        buttonElement.textContent = "Joined ✓";
        buttonElement.disabled = true;

        await loadGroups();

    } catch (error) {

        console.error("Error joining group:", error);

        alert("Could not join group.");
    }
}


// ===============================
// SEARCH
// ===============================

searchInput.addEventListener("input", function () {

    const searchTerm = searchInput.value
        .toLowerCase()
        .trim();


    const filteredGroups = studyGroups.filter(group => {

        const groupInfo = `
            ${group.name}
            ${group.subject}
            ${group.description || ""}
        `.toLowerCase();


        return groupInfo.includes(searchTerm);

    });


    displayGroups(filteredGroups);

});


// ===============================
// CREATE GROUP
// ===============================

document.getElementById("createGroupButton").addEventListener("click", async function () {

    const name = prompt("Group name:");
    if (!name) return;

    const subject = prompt("Subject:");
    if (!subject) return;

    const description = prompt("Description (optional):") || "";
    const meeting_info = prompt("Meeting time/place (optional):") || "";

    try {

        const response = await fetch("https://campusconnect-production-0cdf.up.railway.app/api/study-groups", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name,
                subject,
                description,
                meeting_info,
                icon: "📚",
                created_by: currentUser.student_id
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Failed to create group");
        }

        await loadGroups();

    } catch (error) {

        console.error("Error creating group:", error);

        alert("Could not create group.");
    }

});


// ===============================
// LOGOUT
// ===============================

document.getElementById("logoutButton").addEventListener("click", function () {

    localStorage.removeItem("currentUser");

    window.location.href = "index.html";

});


// ===============================
// HELPERS
// ===============================

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


// ===============================
// START
// ===============================

loadGroups();