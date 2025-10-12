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
            const usersRes = await fetch("https://dummyjson.com/users");
            if (!usersRes.ok) throw new Error("Failed to fetch users");

            const usersData = await usersRes.json();
            const userExists = usersData.users.find(u => u.username === username);

            if (!userExists) {
                message.textContent = "❌ Username not found!";
                message.style.color = "red";
                return;
            }

            const loginResponse = await fetch("https://dummyjson.com/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password })
            });

            if (!loginResponse.ok) {
                message.textContent = "❌ Incorrect password!";
                message.style.color = "red";
                return;
            }

            const loggedUser = await loginResponse.json();

            localStorage.setItem("loggedUser", JSON.stringify({
                id: loggedUser.id,
                firstName: loggedUser.firstName,
                username: loggedUser.username,
                token: loggedUser.token
            }));

            message.textContent = "✅ Login successful! Redirecting...";
            message.style.color = "green";

            setTimeout(() => {
                window.location.href = "../homepage/homepage.html";
            }, 1000);

        } catch (error) {
            message.textContent = "❌ Error: " + error.message;
            message.style.color = "red";
        }
    });
});