document.addEventListener("DOMContentLoaded", async () => {
    const userData = JSON.parse(localStorage.getItem("loggedUser"));
    const welcomeMsg = document.getElementById("welcome-message");
    const logoutBtn = document.getElementById("logout-btn");

    if (!userData) {
        window.location.href = "../login/index.html";
        return;
    }

    welcomeMsg.textContent = `Welcome, ${userData.firstName}!`;

    logoutBtn.addEventListener("click", () => {
        localStorage.removeItem("loggedUser");
        window.location.href = "../login/index.html";
    });

    const statsContainer = document.getElementById("stats-summary");
    const recookedList = JSON.parse(localStorage.getItem("recookedRecipes")) || [];
    statsContainer.innerHTML = `
        <p>🍳 Total recipes re-cooked: <strong>${recookedList.length}</strong></p>
    `;

    const latestContainer = document.getElementById("recooked-list");
    latestContainer.innerHTML = "";

    if (recookedList.length === 0) {
        latestContainer.innerHTML = "<p>No recipes re-cooked yet.</p>";
    } else {
        recookedList.slice(-3).reverse().forEach(recipe => {
            const div = document.createElement("div");
            div.className = "recooked-card";
            div.innerHTML = `
                <p>🍲 <strong>${recipe.name}</strong> — at ${new Date(recipe.date).toLocaleString()}</p>
            `;
            latestContainer.appendChild(div);
        });
    }

    const featuredContainer = document.getElementById("featured-card");
    try {
    const res = await fetch("https://dummyjson.com/recipes");
    const data = await res.json();
    const recipes = data.recipes;

    const today = new Date();
    const seed = parseInt(today.getFullYear().toString() +
                          (today.getMonth() + 1).toString().padStart(2, "0") +
                          today.getDate().toString().padStart(2, "0"));

    const randomIndex = seed % recipes.length;
    const recipe = recipes[randomIndex];

    featuredContainer.innerHTML = `
        <div class="featured-recipe">
            <img src="${recipe.image}" alt="${recipe.name}" width="200">
            <h3>${recipe.name}</h3>
            <p>⏱️ ${recipe.prepTimeMinutes + recipe.cookTimeMinutes} mins | ⭐ ${recipe.rating} | 🍴 ${recipe.cuisine}</p>
        </div>
    `;
    } catch (err) {
        featuredContainer.innerHTML = `<p>Failed to load featured recipe. (${err.message})</p>`;
    }
});