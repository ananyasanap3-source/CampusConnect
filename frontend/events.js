const eventsContainer = document.getElementById("eventsContainer");
const searchInput = document.getElementById("searchInput");


// Sample campus events
const events = [

    {
        name: "Hackathon 2026",
        category: "Technology",
        description: "Build innovative solutions, compete with other teams and showcase your coding skills.",
        date: "15 October 2026",
        time: "9:00 AM",
        venue: "Innovation Lab",
        attendees: 120,
        icon: "💻"
    },

    {
        name: "Cultural Fest",
        category: "Cultural",
        description: "A celebration of music, dance, art and culture featuring performances by students.",
        date: "22 October 2026",
        time: "5:00 PM",
        venue: "Main Auditorium",
        attendees: 350,
        icon: "🎭"
    },

    {
        name: "Tech Career Fair",
        category: "Career",
        description: "Meet recruiters, explore internship opportunities and learn about career options.",
        date: "28 October 2026",
        time: "10:00 AM",
        venue: "Seminar Hall",
        attendees: 200,
        icon: "💼"
    },

    {
        name: "Inter-College Basketball",
        category: "Sports",
        description: "Watch different colleges compete in an exciting inter-college basketball tournament.",
        date: "2 November 2026",
        time: "4:00 PM",
        venue: "College Ground",
        attendees: 180,
        icon: "🏀"
    },

    {
        name: "AI Workshop",
        category: "Workshop",
        description: "Learn the basics of artificial intelligence and build your first AI-powered project.",
        date: "8 November 2026",
        time: "2:00 PM",
        venue: "Computer Lab 3",
        attendees: 75,
        icon: "🤖"
    },

    {
        name: "Photography Walk",
        category: "Creative",
        description: "Explore the campus with fellow photography enthusiasts and capture creative moments.",
        date: "12 November 2026",
        time: "7:00 AM",
        venue: "College Entrance",
        attendees: 40,
        icon: "📸"
    }

];


// Display events
function displayEvents(eventList) {

    if (eventList.length === 0) {

        eventsContainer.innerHTML = `
            <p class="loading">
                No events found.
            </p>
        `;

        return;
    }


    eventsContainer.innerHTML = eventList.map(event => `

        <div class="event-card">

            <div class="event-icon">
                ${event.icon}
            </div>

            <h2>
                ${event.name}
            </h2>

            <p class="category">
                ${event.category}
            </p>

            <p class="description">
                ${event.description}
            </p>

            <div class="event-info">

                <span>
                    📅 ${event.date}
                </span>

                <span>
                    ⏰ ${event.time}
                </span>

                <span>
                    📍 ${event.venue}
                </span>

                <span>
                    👥 ${event.attendees} attendees
                </span>

            </div>

            <button class="register-button">
                Register
            </button>

        </div>

    `).join("");

}


// Search events
searchInput.addEventListener("input", function () {

    const searchTerm = searchInput.value
        .toLowerCase()
        .trim();


    const filteredEvents = events.filter(event => {

        const eventInfo = `
            ${event.name}
            ${event.category}
            ${event.description}
            ${event.venue}
        `.toLowerCase();


        return eventInfo.includes(searchTerm);

    });


    displayEvents(filteredEvents);

});


// Logout
document.getElementById("logoutButton").addEventListener("click", function () {

    localStorage.removeItem("campusUser");

    window.location.href = "index.html";

});


// Create event button
document.getElementById("createEventButton").addEventListener("click", function () {

    alert("Create Event feature coming soon!");

});


// Load events
displayEvents(events);