document.addEventListener("DOMContentLoaded", () => {
    const userData = JSON.parse(localStorage.getItem("loggedUser"));
    const container = document.getElementById("recipes-container");
    const searchInput = document.getElementById("search-input");
    const cuisineFilter = document.getElementById("cuisine-filter");
    const showMoreBtn = document.getElementById("show-more-btn");
    const modal = document.getElementById("recipe-modal");
    const logoutBtn = document.getElementById("logout-btn");

    if (!userData) {
        window.location.href = "index.html";
        return;
    }

    document.getElementById("welcome-message").textContent = `Welcome, ${userData.firstName}!`;

    logoutBtn.addEventListener("click", () => {
        localStorage.removeItem("loggedUser");
        window.location.href = "index.html";
    });

    let recipes = [];
    let displayed = 0;
    const perPage = 6;

    async function loadRecipes() {
        try {
            container.innerHTML = "<p>Loading recipes...</p>";
            const res = await fetch("https://dummyjson.com/recipes");
            const data = await res.json();
            recipes = data.recipes;

            const cuisines = [...new Set(recipes.map(r => r.cuisine))];
            cuisines.forEach(c => {
                const opt = document.createElement("option");
                opt.value = c;
                opt.textContent = c;
                cuisineFilter.appendChild(opt);
            });

            renderRecipes();
        } catch (err) {
            container.innerHTML = `<p style="color:red;">Failed to load recipes: ${err.message}</p>`;
        }
    }

    function renderRecipes(filter = "") {
        container.innerHTML = "";
        const filtered = recipes.filter(r => {
            const search = searchInput.value.toLowerCase();
            const matchSearch = (
                r.name.toLowerCase().includes(search) ||
                r.cuisine.toLowerCase().includes(search) ||
                r.ingredients.join(" ").toLowerCase().includes(search) ||
                r.tags.join(" ").toLowerCase().includes(search)
            );
            const matchCuisine = filter ? r.cuisine === filter : true;
            return matchSearch && matchCuisine;
        });

        const visible = filtered.slice(0, displayed + perPage);
        visible.forEach(r => createRecipeCard(r));

        displayed += perPage;

        showMoreBtn.style.display = filtered.length > displayed ? "block" : "none";
    }

    function createRecipeCard(r) {
        const card = document.createElement("div");
        card.className = "recipe-card";
        card.innerHTML = `
            <img src="${r.image}" alt="${r.name}">
            <h3>${r.name}</h3>
            <p>⏱️ ${r.cookTimeMinutes} mins</p>
            <p>⭐ ${r.rating} | ${r.cuisine}</p>
            <button class="view-btn" data-id="${r.id}">View Full Recipe</button>
        `;
        container.appendChild(card);
    }

    container.addEventListener("click", async (e) => {
        if (e.target.classList.contains("view-btn")) {
            const id = e.target.dataset.id;
            const res = await fetch(`https://dummyjson.com/recipes/${id}`);
            const recipe = await res.json();

            document.getElementById("modal-title").textContent = recipe.name;
            document.getElementById("modal-image").src = recipe.image;
            document.querySelector(".modal-header-details").textContent =
                `⏱️ ${recipe.prepTimeMinutes + recipe.cookTimeMinutes} mins | ⭐ ${recipe.rating} | ${recipe.cuisine}`;

            const ingList = document.getElementById("modal-ingredients-list");
            ingList.innerHTML = recipe.ingredients.map(i => `<li>${i}</li>`).join("");

            const instrList = document.getElementById("modal-instructions-list");
            instrList.innerHTML = recipe.instructions.map(i => `<li>${i}</li>`).join("");

            const markBtn = document.getElementById("mark-recooked-btn");
            markBtn.dataset.recipeId = recipe.id;
            markBtn.dataset.recipeName = recipe.name;

            modal.style.display = "flex";
        }
    });

    document.querySelector(".close-btn").addEventListener("click", () => {
        modal.style.display = "none";
    });

    document.getElementById("mark-recooked-btn").addEventListener("click", (e) => {
        const recooked = JSON.parse(localStorage.getItem("recookedRecipes")) || [];
        recooked.push({
            id: e.target.dataset.recipeId,
            name: e.target.dataset.recipeName,
            date: new Date().toISOString()
        });
        localStorage.setItem("recookedRecipes", JSON.stringify(recooked));
        alert("✅ Marked as re-cooked!");
    });

    let debounceTimer;
    searchInput.addEventListener("input", () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            displayed = 0;
            renderRecipes(cuisineFilter.value);
        }, 400);
    });

    cuisineFilter.addEventListener("change", () => {
        displayed = 0;
        renderRecipes(cuisineFilter.value);
    });

    showMoreBtn.addEventListener("click", () => {
        renderRecipes(cuisineFilter.value);
    });

    loadRecipes();
});