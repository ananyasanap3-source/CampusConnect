const conversationsList = document.getElementById("conversationsList");
const messagesContainer = document.getElementById("messagesContainer");
const messageInput = document.getElementById("messageInput");
const sendButton = document.getElementById("sendButton");
const searchInput = document.getElementById("searchInput");

let conversations = [];
let selectedConversationId = null;
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

    // Fallback to Rahul
    return {
        student_id: 1,
        name: "Rahul Sharma"
    };
}

currentUser = getCurrentUser();


// ===============================
// LOAD CONVERSATIONS
// ===============================

async function loadConversations() {

    try {

        const response = await fetch(
            `http://localhost:5000/api/conversations/${currentUser.student_id}`
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Failed to load conversations");
        }

        conversations = data;

        displayConversations(conversations);


        // IMPORTANT:
        // Check URL for a specific conversation
        const urlParams = new URLSearchParams(window.location.search);
        const requestedConversation = urlParams.get("conversation");


        if (requestedConversation) {

            const conversationExists = conversations.find(
                conversation =>
                    String(conversation.conversation_id) ===
                    String(requestedConversation)
            );

            if (conversationExists) {

                selectConversation(
                    conversationExists.conversation_id
                );

                return;
            }
        }


        // If no conversation was specified in URL,
        // open the first conversation.
        if (conversations.length > 0) {

            selectConversation(
                conversations[0].conversation_id
            );

        } else {

            messagesContainer.innerHTML = `
                <div class="empty-state">
                    <h3>No conversations yet</h3>
                    <p>Connect with a student to start chatting.</p>
                </div>
            `;
        }

    } catch (error) {

        console.error("Error loading conversations:", error);

        conversationsList.innerHTML = `
            <p class="loading">
                Cannot load conversations.
            </p>
        `;
    }
}


// ===============================
// DISPLAY CONVERSATIONS
// ===============================

function displayConversations(list) {

    if (list.length === 0) {

        conversationsList.innerHTML = `
            <p class="loading">
                No conversations yet.
            </p>
        `;

        return;
    }


    conversationsList.innerHTML = list.map(conversation => {

        const isActive =
            String(conversation.conversation_id) ===
            String(selectedConversationId);

        return `
            <div
                class="conversation-item ${isActive ? "active" : ""}"
                data-conversation-id="${conversation.conversation_id}"
            >

                <div class="conversation-avatar">
                    ${getInitials(
                        conversation.other_student_name
                    )}
                </div>

                <div class="conversation-info">

                    <h3>
                        ${escapeHtml(
                            conversation.other_student_name
                        )}
                    </h3>

                    <p>
                        ${
                            conversation.last_message
                                ? escapeHtml(
                                    conversation.last_message
                                )
                                : "Start a conversation"
                        }
                    </p>

                </div>

            </div>
        `;

    }).join("");


    // Add click events
    document
        .querySelectorAll(".conversation-item")
        .forEach(item => {

            item.addEventListener("click", function () {

                const conversationId =
                    this.dataset.conversationId;

                selectConversation(conversationId);

            });

        });
}


// ===============================
// SELECT CONVERSATION
// ===============================

async function selectConversation(conversationId) {

    selectedConversationId = conversationId;

    displayConversations(conversations);


    const conversation = conversations.find(
        item =>
            String(item.conversation_id) ===
            String(conversationId)
    );


    if (!conversation) {
        return;
    }


    // Update chat header
    const chatName =
        document.getElementById("chatName");

    if (chatName) {

        chatName.textContent =
            conversation.other_student_name;
    }


    const chatStatus =
        document.getElementById("chatStatus");

    if (chatStatus) {

        chatStatus.textContent =
            `${conversation.course || ""} ${
                conversation.year
                    ? "• Year " + conversation.year
                    : ""
            }`;
    }


    await loadMessages(conversationId);
}


// ===============================
// LOAD MESSAGES
// ===============================

async function loadMessages(conversationId) {

    try {

        const response = await fetch(
            `http://localhost:5000/api/messages/${conversationId}`
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.message || "Failed to load messages"
            );
        }

        displayMessages(data);

    } catch (error) {

        console.error("Error loading messages:", error);

        messagesContainer.innerHTML = `
            <p class="loading">
                Cannot load messages.
            </p>
        `;
    }
}


// ===============================
// DISPLAY MESSAGES
// ===============================

function displayMessages(messages) {

    if (messages.length === 0) {

        messagesContainer.innerHTML = `
            <div class="empty-state">
                <h3>No messages yet</h3>
                <p>Send a message to start the conversation.</p>
            </div>
        `;

        return;
    }


    messagesContainer.innerHTML = messages.map(message => {

        const isSent =
            Number(message.sender_id) ===
            Number(currentUser.student_id);


        return `
            <div class="message ${isSent ? "sent" : "received"}">

                <div class="message-bubble">

                    <div class="message-text">
                        ${escapeHtml(message.message_text)}
                    </div>

                    <div class="message-time">
                        ${formatTime(message.sent_at)}
                    </div>

                </div>

            </div>
        `;

    }).join("");


    messagesContainer.scrollTop =
        messagesContainer.scrollHeight;
}


// ===============================
// SEND MESSAGE
// ===============================

async function sendMessage() {

    const message = messageInput.value.trim();

    if (!message) {
        return;
    }

    if (!selectedConversationId) {
        alert("Please select a conversation first.");
        return;
    }


    try {

        const response = await fetch(
            "http://localhost:5000/api/messages",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    conversation_id:
                        selectedConversationId,

                    sender_id:
                        currentUser.student_id,

                    message_text: message
                })
            }
        );


        const data = await response.json();


        if (!response.ok) {

            throw new Error(
                data.message || "Failed to send message"
            );
        }


        messageInput.value = "";

        await loadMessages(selectedConversationId);

        await loadConversations();


        // Keep the same conversation selected
        selectConversation(selectedConversationId);

    } catch (error) {

        console.error("Error sending message:", error);

        alert("Could not send message.");
    }
}


// ===============================
// SEARCH
// ===============================

if (searchInput) {

    searchInput.addEventListener("input", function () {

        const searchTerm =
            searchInput.value
                .toLowerCase()
                .trim();


        const filtered =
            conversations.filter(conversation => {

                const info = `
                    ${conversation.other_student_name}
                    ${conversation.course || ""}
                    ${conversation.last_message || ""}
                `.toLowerCase();

                return info.includes(searchTerm);

            });


        displayConversations(filtered);

    });
}


// ===============================
// SEND BUTTON
// ===============================

if (sendButton) {

    sendButton.addEventListener(
        "click",
        sendMessage
    );
}


// ===============================
// ENTER TO SEND
// ===============================

if (messageInput) {

    messageInput.addEventListener(
        "keydown",
        function (event) {

            if (
                event.key === "Enter" &&
                !event.shiftKey
            ) {

                event.preventDefault();

                sendMessage();
            }

        }
    );
}


// ===============================
// LOGOUT
// ===============================

const logoutButton =
    document.getElementById("logoutButton");

if (logoutButton) {

    logoutButton.addEventListener(
        "click",
        function () {

            localStorage.removeItem(
                "currentUser"
            );

            window.location.href =
                "index.html";

        }
    );
}


// ===============================
// NEW MESSAGE BUTTON
// ===============================

const newMessageButton =
    document.getElementById("newMessageButton");

if (newMessageButton) {
    newMessageButton.addEventListener("click", openNewMessageModal);
}


async function openNewMessageModal() {

    const oldOverlay = document.getElementById("newMessageOverlay");
    if (oldOverlay) {
        oldOverlay.remove();
    }

    try {

        const response = await fetch("http://localhost:5000/api/students");

        if (!response.ok) {
            throw new Error("Failed to load students");
        }

        const students = await response.json();

        const otherStudents = students.filter(
            student =>
                Number(student.student_id) !==
                Number(currentUser.student_id)
        );

        const overlay = document.createElement("div");
        overlay.id = "newMessageOverlay";

        overlay.innerHTML = `
            <div class="new-message-modal">
                <div class="new-message-header">
                    <div>
                        <h2>New Message</h2>
                        <p>Choose a student to message</p>
                    </div>
                    <button class="close-modal" id="closeNewMessage">×</button>
                </div>
                <div class="student-list" id="newMessageStudentList"></div>
            </div>
        `;

        document.body.appendChild(overlay);

        const modal = overlay.querySelector(".new-message-modal");
        if (modal) {
            modal.addEventListener("click", event => event.stopPropagation());
        }

        const closeButton = document.getElementById("closeNewMessage");
        if (closeButton) {
            closeButton.addEventListener("click", () => overlay.remove());
        }

        overlay.addEventListener("click", event => {
            if (event.target === overlay) {
                overlay.remove();
            }
        });

        const studentList = document.getElementById("newMessageStudentList");

        if (!otherStudents || otherStudents.length === 0) {
            studentList.innerHTML = `<div class="no-students">No other students found.</div>`;
            return;
        }

        otherStudents.forEach(student => {

            const studentElement = document.createElement("div");
            studentElement.className = "new-message-student";

            studentElement.innerHTML = `
                <div class="conversation-avatar">
                    ${getInitials(student.name)}
                </div>
                <div class="student-info">
                    <h3>${escapeHtml(student.name)}</h3>
                    <p>
                        ${escapeHtml(student.course || "")}
                        ${student.year ? " • Year " + escapeHtml(String(student.year)) : ""}
                    </p>
                </div>
            `;

            studentElement.addEventListener("click", async () => {
                await startConversation(student.student_id);
            });

            studentList.appendChild(studentElement);
        });

    } catch (error) {
        console.error("Error opening new message:", error);
        alert("Could not load students.");
    }
}


async function startConversation(studentId) {

    const overlay = document.getElementById("newMessageOverlay");
    if (overlay) {
        overlay.remove();
    }

    try {

        const response = await fetch("http://localhost:5000/api/conversations", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                student1_id: currentUser.student_id,
                student2_id: studentId
            })
        });

        if (!response.ok) {
            throw new Error("Failed to create conversation");
        }

        const conversation = await response.json();

        await loadConversations();
        await selectConversation(conversation.conversation_id);

    } catch (error) {
        console.error("Error starting conversation:", error);
        alert("Could not start conversation.");
    }
}


// ===============================
// HELPERS
// ===============================

function getInitials(name) {

    if (!name) {
        return "?";
    }

    return name
        .split(" ")
        .map(word => word.charAt(0))
        .join("")
        .substring(0, 2)
        .toUpperCase();
}


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


function formatTime(dateString) {

    if (!dateString) {
        return "";
    }

    const date = new Date(dateString);

    if (isNaN(date.getTime())) {
        return "";
    }

    return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
    });
}


// ===============================
// START
// ===============================

loadConversations();