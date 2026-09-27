const loginForm = document.getElementById("loginForm");
const message = document.getElementById("message");

loginForm.addEventListener("submit", async function (event) {

    event.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    message.textContent = "Logging in...";
    message.style.color = "#64748b";

    try {

        const response = await fetch(
            "http://localhost:5000/api/login",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    email: email,
                    password: password
                })
            }
        );

        const data = await response.json();

        if (response.ok) {

            message.textContent = "Login successful! 🎉";
            message.style.color = "green";

            // Save user information
            localStorage.setItem(
                "currentUser",
                JSON.stringify(data.user)
            );

            // Go to dashboard
            window.location.href = "http://localhost:5500/dashboard.html";

        } else {

            message.textContent = data.message || "Login failed";
            message.style.color = "red";

        }

    } catch (error) {

        console.error(error);

        message.textContent = "Cannot connect to server.";
        message.style.color = "red";

    }

});