document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("login-form");
    const message = document.getElementById("message-status");

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const username = document.getElementById("username").value.trim();
        const password = document.getElementById("password").value.trim();

        message.textContent = "🔄 Logging in...";
        message.style.color = "black";

        try {
            const response = await fetch("https://dummyjson.com/users");
            if (!response.ok) throw new Error("Failed to fetch users");

            const data = await response.json();
            const user = data.users.find(u => u.username === username);

            if (!user) {
                message.textContent = "❌ Username not found!";
                message.style.color = "red";
                return;
            }

            if (password === "") {
                message.textContent = "⚠️ Password cannot be empty!";
                message.style.color = "orange";
                return;
            }

            localStorage.setItem("loggedUser", JSON.stringify({
                id: user.id,
                firstName: user.firstName,
                username: user.username
            }));

            message.textContent = "✅ Login successful! Redirecting...";
            message.style.color = "green";

            setTimeout(() => {
                window.location.href = "homepage.html";
            }, 1000);
        } catch (error) {
            message.textContent = "❌ Error: " + error.message;
            message.style.color = "red";
        }
    });
});