const opportunitiesContainer =
    document.getElementById("opportunitiesContainer");

const searchInput =
    document.getElementById("searchInput");

const filterButtons =
    document.querySelectorAll(".filter-button");

const createOpportunityButton =
    document.getElementById("createOpportunityButton");

const logoutButton =
    document.getElementById("logoutButton");


// ================================
// SAMPLE OPPORTUNITIES
// ================================

const opportunities = [

    {
        title: "Frontend Development Intern",
        company: "TechNova Solutions",
        category: "Internship",
        icon: "💻",
        description:
            "Work with a development team to build modern and responsive web applications.",
        location: "📍 Pune • Hybrid",
        deadline: "⏰ Deadline: 30 Sep 2026",
        duration: "📅 3 Months",
        skills: ["HTML", "CSS", "JavaScript"]
    },

    {
        title: "AI Innovation Hackathon",
        company: "Campus Tech Club",
        category: "Hackathon",
        icon: "🏆",
        description:
            "Build an innovative AI-powered solution and compete with students from different colleges.",
        location: "📍 Online",
        deadline: "⏰ Registration ends: 5 Oct 2026",
        duration: "📅 48 Hours",
        skills: ["AI", "Python", "Innovation"]
    },

    {
        title: "Merit Scholarship 2026",
        company: "Education Foundation",
        category: "Scholarship",
        icon: "🎓",
        description:
            "Financial support opportunity for high-performing undergraduate students.",
        location: "📍 India",
        deadline: "⏰ Apply before: 15 Oct 2026",
        duration: "💰 Up to ₹50,000",
        skills: ["Academic Merit", "Undergraduate"]
    },

    {
        title: "Cloud Computing Certification",
        company: "Cloud Academy",
        category: "Certification",
        icon: "📜",
        description:
            "Learn cloud fundamentals and earn an industry-recognized certification.",
        location: "📍 Online",
        deadline: "⏰ Enrollment open",
        duration: "📅 6 Weeks",
        skills: ["AWS", "Cloud", "DevOps"]
    },

    {
        title: "Data Science Internship",
        company: "DataWorks India",
        category: "Internship",
        icon: "📊",
        description:
            "Gain practical experience working with datasets, analytics and machine learning.",
        location: "📍 Mumbai • Remote",
        deadline: "⏰ Deadline: 10 Oct 2026",
        duration: "📅 4 Months",
        skills: ["Python", "SQL", "Machine Learning"]
    },

    {
        title: "Startup Pitch Challenge",
        company: "Entrepreneurship Cell",
        category: "Hackathon",
        icon: "🚀",
        description:
            "Present your startup idea and get feedback from entrepreneurs and industry experts.",
        location: "📍 College Campus",
        deadline: "⏰ Registration ends: 12 Oct 2026",
        duration: "📅 1 Day",
        skills: ["Business", "Pitching", "Innovation"]
    },

    {
        title: "Women in Technology Scholarship",
        company: "FutureTech Foundation",
        category: "Scholarship",
        icon: "👩‍💻",
        description:
            "Scholarship program supporting students pursuing technology and engineering education.",
        location: "📍 India",
        deadline: "⏰ Apply before: 20 Oct 2026",
        duration: "💰 Up to ₹75,000",
        skills: ["Engineering", "Technology"]
    },

    {
        title: "Cyber Security Fundamentals",
        company: "SecureLearn",
        category: "Certification",
        icon: "🔐",
        description:
            "Learn the fundamentals of cyber security, networking and ethical security practices.",
        location: "📍 Online",
        deadline: "⏰ Enrollment open",
        duration: "📅 8 Weeks",
        skills: ["Cyber Security", "Networking", "Linux"]
    }

];


// ================================
// CURRENT FILTER
// ================================

let currentCategory = "All";


// ================================
// DISPLAY OPPORTUNITIES
// ================================

function displayOpportunities() {

    const searchText =
        searchInput.value.toLowerCase().trim();

    const filteredOpportunities =
        opportunities.filter(function (opportunity) {

            const matchesCategory =
                currentCategory === "All" ||
                opportunity.category === currentCategory;

            const searchableText = (
                opportunity.title +
                " " +
                opportunity.company +
                " " +
                opportunity.category +
                " " +
                opportunity.description +
                " " +
                opportunity.location +
                " " +
                opportunity.skills.join(" ")
            ).toLowerCase();

            const matchesSearch =
                searchableText.includes(searchText);

            return matchesCategory && matchesSearch;

        });


    opportunitiesContainer.innerHTML = "";


    // No results

    if (filteredOpportunities.length === 0) {

        opportunitiesContainer.innerHTML = `
            <p class="no-results">
                No opportunities found 🔍
            </p>
        `;

        return;
    }


    // Create cards

    filteredOpportunities.forEach(function (opportunity) {

        const card =
            document.createElement("div");

        card.className = "opportunity-card";


        card.innerHTML = `

            <div class="opportunity-top">

                <div class="opportunity-icon">
                    ${opportunity.icon}
                </div>

                <span class="category">
                    ${opportunity.category}
                </span>

            </div>


            <h2>
                ${opportunity.title}
            </h2>


            <div class="company">
                ${opportunity.company}
            </div>


            <p class="description">
                ${opportunity.description}
            </p>


            <div class="details">

                <div class="detail">
                    ${opportunity.location}
                </div>

                <div class="detail">
                    ${opportunity.deadline}
                </div>

                <div class="detail">
                    ${opportunity.duration}
                </div>

            </div>


            <div class="skills">

                ${opportunity.skills.map(function (skill) {

                    return `
                        <span class="skill">
                            ${skill}
                        </span>
                    `;

                }).join("")}

            </div>


            <button
                class="apply-button"
                onclick="applyOpportunity('${opportunity.title.replace(/'/g, "\\'") }')"
            >
                View Opportunity
            </button>

        `;


        opportunitiesContainer.appendChild(card);

    });

}


// ================================
// SEARCH
// ================================

searchInput.addEventListener(
    "input",
    displayOpportunities
);


// ================================
// CATEGORY FILTER
// ================================

filterButtons.forEach(function (button) {

    button.addEventListener("click", function () {

        filterButtons.forEach(function (btn) {
            btn.classList.remove("active");
        });


        button.classList.add("active");


        currentCategory =
            button.dataset.category;


        displayOpportunities();

    });

});


// ================================
// VIEW OPPORTUNITY
// ================================

function applyOpportunity(title) {

    alert(
        "You selected: " +
        title +
        "\n\nOpportunity details and application will be available here."
    );

}


// ================================
// CREATE OPPORTUNITY
// ================================

createOpportunityButton.addEventListener(
    "click",
    function () {

        alert(
            "Post Opportunity feature coming soon! 🚀"
        );

    }
);


// ================================
// LOGOUT
// ================================

logoutButton.addEventListener(
    "click",
    function () {

        localStorage.removeItem("campusUser");

        window.location.href =
            "http://127.0.0.1:5500/index.html";

    }
);


// ================================
// INITIAL LOAD
// ================================

displayOpportunities();